#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v31_safe_body_answers.jsonl"),
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  jsonOutPath: null,
  mdOutPath: null,
  strict: false,
  includeDeterministic: false,
  rawModel: false,
  minDeliveredCoverage: 0.80,
  minDeliveredRouge: 0.20,
  lowAccuracyRatioThreshold: 0.05
};

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "in", "is",
  "it", "of", "on", "or", "that", "the", "this", "to", "was", "were", "with"
]);

const FIELD_ALIASES = {
  date: ["date", "date_text"],
  date_text: ["date_text", "date"],
  source: ["source", "source_url", "source_name"],
  rights: ["rights", "rights_interpretation"],
  method_context: ["method_context", "type"],
  first_or_earliest_claim: ["first_or_earliest_claim", "chronology_proof"]
};

function parseArgs(args) {
  const parsed = { ...defaults };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--min-delivered-coverage") parsed.minDeliveredCoverage = Number(args[++index]);
    else if (arg === "--min-delivered-rouge") parsed.minDeliveredRouge = Number(args[++index]);
    else if (arg === "--low-accuracy-ratio-threshold") parsed.lowAccuracyRatioThreshold = Number(args[++index]);
    else if (arg === "--include-deterministic") parsed.includeDeterministic = true;
    else if (arg === "--raw-model") parsed.rawModel = true;
    else if (arg === "--strict") parsed.strict = true;
    else positional.push(arg);
  }
  if (positional[0]) parsed.labelsPath = path.resolve(positional[0]);
  if (positional[1]) parsed.recordsPath = path.resolve(positional[1]);
  if (positional[2]) parsed.answersPath = path.resolve(positional[2]);
  return parsed;
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line));
}

function idOf(row) {
  return row.query_id || row.id;
}

function stripTags(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "")
    .trim();
}

function answerText(row, rawModel = false) {
  return rawModel
    ? (row.raw_answer_text || row.model_answer_text || row.answer_text || row.generated_text || "")
    : (row.answer_text || row.generated_text || row.model_answer_text || row.raw_answer_text || "");
}

function normalize(text) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function rouge1Recall(reference, candidate) {
  const ref = tokens(reference);
  if (ref.length === 0) return 1;
  const cand = new Set(tokens(candidate));
  const overlap = ref.filter((token) => cand.has(token)).length;
  return overlap / ref.length;
}

function flatten(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => flatten(item));
  if (typeof value === "object") return Object.values(value).flatMap((item) => flatten(item));
  return [];
}

function fieldValues(record, field) {
  const aliases = FIELD_ALIASES[field] || [field];
  return aliases.flatMap((alias) => flatten(record?.[alias]))
    .filter((value) => String(value).trim() !== "");
}

function valuesForField(records, field) {
  return [...new Set(records.flatMap((record) => fieldValues(record, field)).map(String))]
    .filter((value) => value.trim() !== "");
}

function valueMentioned(text, value) {
  const haystack = normalize(text);
  const needle = normalize(value);
  if (!needle) return false;
  if (haystack.includes(needle)) return true;
  const valueTokens = needle.split(/\s+/).filter((token) => token.length >= 4);
  if (valueTokens.length === 0) return false;
  const hitCount = valueTokens.filter((token) => haystack.includes(token)).length;
  return hitCount / valueTokens.length >= 0.5;
}

function fieldCovered(text, records, field) {
  const values = valuesForField(records, field);
  if (values.length === 0) return { covered: true, values: [], reason: "no_evidence_value" };
  const covered = values.some((value) => valueMentioned(text, value));
  return { covered, values };
}

function buildReference(records, label, queryText) {
  const required = label.required_fields || [];
  const requiredValues = required.flatMap((field) => valuesForField(records, field));
  const compact = records.flatMap((record) => [
    record?.record_id,
    record?.title,
    record?.creator,
    record?.date_text,
    record?.region,
    record?.object_type,
    record?.medium
  ].flatMap((value) => flatten(value)));
  return [
    queryText || "",
    label.intent || "",
    ...requiredValues,
    ...compact
  ].filter(Boolean).join(" ");
}

export function scoreSemanticAccuracy(options) {
  const labelsById = new Map(readJsonl(options.labelsPath).map((label) => [idOf(label), label]));
  const recordsById = new Map(readJsonl(options.recordsPath).map((record) => [record.record_id || record.id, record]));
  const answers = readJsonl(options.answersPath);
  const queriesById = fs.existsSync(options.queriesPath)
    ? new Map(readJsonl(options.queriesPath).map((query) => [idOf(query), query]))
    : new Map();

  const rows = [];
  for (const answer of answers) {
    const queryId = idOf(answer);
    const label = labelsById.get(queryId);
    if (!label || label.refusal_expected) continue;
    if (!options.includeDeterministic && (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency")) continue;
    const delivered = answerText(answer, options.rawModel);
    if (!delivered) continue;
    const body = stripTags(delivered);
    const retrievedIds = String(answer.retrieved_ids || "")
      .split("|")
      .map((id) => id.trim())
      .filter(Boolean);
    const evidenceIds = retrievedIds.length > 0 ? retrievedIds : (label.gold_evidence_ids || []);
    const records = evidenceIds.map((id) => recordsById.get(id)).filter(Boolean);
    const query = queriesById.get(queryId);
    const queryText = query?.query_text || query?.text || "";
    const reference = buildReference(records, label, queryText);
    const requiredFields = label.required_fields || [];
    const fieldResults = requiredFields.map((field) => {
      const deliveredResult = fieldCovered(delivered, records, field);
      const bodyResult = fieldCovered(body, records, field);
      return {
        field,
        delivered_covered: deliveredResult.covered,
        body_covered: bodyResult.covered,
        evidence_values: deliveredResult.values.slice(0, 5)
      };
    });
    const coverageDenominator = fieldResults.length || 1;
    const deliveredCoverage = fieldResults.filter((row) => row.delivered_covered).length / coverageDenominator;
    const bodyCoverage = fieldResults.filter((row) => row.body_covered).length / coverageDenominator;
    const deliveredRouge = rouge1Recall(reference, delivered);
    const bodyRouge = rouge1Recall(reference, body);
    const lowAccuracy = deliveredCoverage < options.minDeliveredCoverage && deliveredRouge < options.minDeliveredRouge;
    rows.push({
      query_id: queryId,
      intent: label.intent,
      delivered_required_field_coverage: Number(deliveredCoverage.toFixed(4)),
      body_required_field_coverage: Number(bodyCoverage.toFixed(4)),
      delivered_rouge1_recall: Number(deliveredRouge.toFixed(4)),
      body_rouge1_recall: Number(bodyRouge.toFixed(4)),
      low_accuracy: lowAccuracy,
      missing_delivered_fields: fieldResults.filter((row) => !row.delivered_covered).map((row) => row.field),
      missing_body_fields: fieldResults.filter((row) => !row.body_covered).map((row) => row.field)
    });
  }

  const lowAccuracyCount = rows.filter((row) => row.low_accuracy).length;
  const lowAccuracyRatio = rows.length ? lowAccuracyCount / rows.length : 0;
  const avgDeliveredCoverage = rows.length
    ? rows.reduce((sum, row) => sum + row.delivered_required_field_coverage, 0) / rows.length
    : 1;
  const avgBodyCoverage = rows.length
    ? rows.reduce((sum, row) => sum + row.body_required_field_coverage, 0) / rows.length
    : 1;
  const pass = lowAccuracyRatio <= options.lowAccuracyRatioThreshold;

  return {
    generated_at: new Date().toISOString(),
    inputs: {
      labelsPath: path.relative(repoRoot, options.labelsPath),
      recordsPath: path.relative(repoRoot, options.recordsPath),
      answersPath: path.relative(repoRoot, options.answersPath),
      queriesPath: path.relative(repoRoot, options.queriesPath)
    },
    gate: {
      pass,
      evaluated_answer_count: rows.length,
      low_accuracy_count: lowAccuracyCount,
      low_accuracy_ratio: Number(lowAccuracyRatio.toFixed(4)),
      low_accuracy_ratio_threshold: options.lowAccuracyRatioThreshold,
      min_delivered_coverage: options.minDeliveredCoverage,
      min_delivered_rouge: options.minDeliveredRouge,
      avg_delivered_required_field_coverage: Number(avgDeliveredCoverage.toFixed(4)),
      avg_body_required_field_coverage: Number(avgBodyCoverage.toFixed(4)),
      answer_source: options.rawModel ? "raw_model_text" : "delivered_answer_text"
    },
    rows
  };
}

function markdown(report) {
  const flagged = report.rows.filter((row) => row.low_accuracy || row.missing_delivered_fields.length > 0);
  const rows = flagged.length === 0
    ? "| none | none | 1.0000 | 1.0000 | none |"
    : flagged.map((row) => `| ${row.query_id} | ${row.intent} | ${row.delivered_required_field_coverage} | ${row.delivered_rouge1_recall} | ${row.missing_delivered_fields.join("; ") || "none"} |`).join("\n");
  return `# Semantic Coverage Advisory

Generated: ${report.generated_at}

This advisory report checks whether delivered answers cover required evidence
fields and roughly overlap with an evidence-derived reference. It is not an
LLM-style semantic judge and is not intended to decide answer quality by itself.
Body-only coverage is reported so V3.1 can separate model prose from
system-injected tags.

## Advisory Gate

- Pass: ${report.gate.pass}
- Evaluated answers: ${report.gate.evaluated_answer_count}
- Low accuracy count: ${report.gate.low_accuracy_count}
- Low accuracy ratio: ${report.gate.low_accuracy_ratio}
- Low accuracy threshold: ${report.gate.low_accuracy_ratio_threshold}
- Average delivered required-field coverage: ${report.gate.avg_delivered_required_field_coverage}
- Average body required-field coverage: ${report.gate.avg_body_required_field_coverage}
- Answer source: ${report.gate.answer_source}

## Flagged Rows

| Query | Intent | Delivered Field Coverage | Delivered ROUGE-1 Recall | Missing Delivered Fields |
|---|---|---:|---:|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = scoreSemanticAccuracy(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
  if (options.strict && !report.gate.pass) process.exit(1);
}
