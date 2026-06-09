#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v32_guarded_prose_budgeted_generation_answers.jsonl"),
  baselinePath: null,
  jsonOutPath: null,
  mdOutPath: null,
  strict: false,
  includeDeterministic: false,
  rawModel: false,
  maxAverageDrop: 0.05
};

const FACT_FIELDS = [
  "record_id",
  "title",
  "creator",
  "date_text",
  "region",
  "object_type",
  "medium",
  "source",
  "rights",
  "topology",
  "method_context"
];

function parseArgs(args) {
  const parsed = { ...defaults };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--baseline") parsed.baselinePath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--max-average-drop") parsed.maxAverageDrop = Number(args[++index]);
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

function flatten(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => flatten(item));
  if (typeof value === "object") return Object.values(value).flatMap((item) => flatten(item));
  return [];
}

function stripTags(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "")
    .trim();
}

function answerText(row, rawModel = false) {
  const text = rawModel
    ? (row.raw_answer_text || row.model_answer_text || row.answer_text || row.generated_text || "")
    : (row.answer_text || row.generated_text || row.model_answer_text || row.raw_answer_text || "");
  return stripTags(text);
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function recordFactValues(record = {}) {
  const values = [];
  for (const field of FACT_FIELDS) values.push(...flatten(record[field]));
  values.push(record.source?.name, record.source?.url);
  values.push(record.rights?.label, record.rights?.state);
  values.push(record.topology?.surface_type, record.topology?.publication_role);
  values.push(...(record.topology?.folder_titles || []));
  return [...new Set(values.map((value) => String(value || "").trim()).filter((value) => value.length >= 4))];
}

function valueCovered(text, value) {
  const haystack = normalize(text);
  const needle = normalize(value);
  if (!needle) return false;
  if (haystack.includes(needle)) return true;
  const tokens = needle.split(/[^a-z0-9]+/).filter((token) => token.length >= 4);
  if (tokens.length === 0) return false;
  return tokens.some((token) => haystack.includes(token));
}

function average(rows, key) {
  if (!rows.length) return 1;
  return rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
}

export function measureFactsCoverage(options) {
  const labelsById = new Map(readJsonl(options.labelsPath).map((label) => [idOf(label), label]));
  const recordsById = new Map(readJsonl(options.recordsPath).map((record) => [record.record_id || record.id, record]));
  const answers = readJsonl(options.answersPath);
  const rows = [];

  for (const answer of answers) {
    const queryId = idOf(answer);
    const label = labelsById.get(queryId);
    if (!label || label.refusal_expected) continue;
    if (!options.includeDeterministic && (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency")) continue;
    const body = answerText(answer, options.rawModel);
    if (!body) continue;
    const retrievedIds = String(answer.retrieved_ids || "")
      .split("|")
      .map((id) => id.trim())
      .filter(Boolean);
    const evidenceIds = retrievedIds.length > 0 ? retrievedIds : (label.gold_evidence_ids || []);
    const records = evidenceIds.map((id) => recordsById.get(id)).filter(Boolean);
    const facts = [...new Set(records.flatMap((record) => recordFactValues(record)))];
    const coveredFacts = facts.filter((value) => valueCovered(body, value));
    rows.push({
      query_id: queryId,
      intent: label.intent,
      fact_count: facts.length,
      covered_fact_count: coveredFacts.length,
      coverage_ratio: facts.length ? Number((coveredFacts.length / facts.length).toFixed(4)) : 1,
      uncovered_sample: facts.filter((value) => !coveredFacts.includes(value)).slice(0, 8)
    });
  }

  const avgCoverage = average(rows, "coverage_ratio");
  let baselineAverage = null;
  let averageDrop = null;
  if (options.baselinePath && fs.existsSync(options.baselinePath)) {
    const baseline = JSON.parse(fs.readFileSync(options.baselinePath, "utf8"));
    baselineAverage = baseline.gate?.avg_coverage_ratio ?? null;
    if (typeof baselineAverage === "number") averageDrop = baselineAverage - avgCoverage;
  }
  const pass = averageDrop === null || averageDrop <= options.maxAverageDrop;

  return {
    generated_at: new Date().toISOString(),
    inputs: {
      labelsPath: path.relative(repoRoot, options.labelsPath),
      recordsPath: path.relative(repoRoot, options.recordsPath),
      answersPath: path.relative(repoRoot, options.answersPath),
      baselinePath: options.baselinePath ? path.relative(repoRoot, options.baselinePath) : null
    },
    gate: {
      pass,
      evaluated_answer_count: rows.length,
      avg_coverage_ratio: Number(avgCoverage.toFixed(4)),
      baseline_avg_coverage_ratio: baselineAverage,
      average_drop: averageDrop === null ? null : Number(averageDrop.toFixed(4)),
      max_average_drop: options.maxAverageDrop,
      answer_source: options.rawModel ? "raw_model_text" : "delivered_answer_text"
    },
    rows
  };
}

function markdown(report) {
  const lowRows = report.rows
    .filter((row) => row.coverage_ratio < 0.15)
    .slice(0, 30);
  const rows = lowRows.length === 0
    ? "| none | none | 1.0000 | none |"
    : lowRows.map((row) => `| ${row.query_id} | ${row.intent} | ${row.coverage_ratio} | ${row.uncovered_sample.join("; ") || "none"} |`).join("\n");
  return `# Facts Coverage Ratio

Generated: ${report.generated_at}

This report measures how many compact evidence fact values appear in the model
answer body. It is intended for V3.1/V3.2 comparison, not as a standalone
semantic judge.

## Gate

- Pass: ${report.gate.pass}
- Evaluated answers: ${report.gate.evaluated_answer_count}
- Average coverage ratio: ${report.gate.avg_coverage_ratio}
- Baseline average coverage ratio: ${report.gate.baseline_avg_coverage_ratio ?? "n/a"}
- Average drop: ${report.gate.average_drop ?? "n/a"}
- Max allowed average drop: ${report.gate.max_average_drop}
- Answer source: ${report.gate.answer_source}

## Lowest Coverage Rows

| Query | Intent | Coverage | Uncovered Sample |
|---|---|---:|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = measureFactsCoverage(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
  if (options.strict && !report.gate.pass) process.exit(1);
}
