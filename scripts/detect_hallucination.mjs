#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v31_safe_body_answers.jsonl"),
  jsonOutPath: null,
  mdOutPath: null,
  strict: false,
  includeDeterministic: false,
  rawModel: false,
  unsupportedTripleRatioThreshold: 0.05,
  unsupportedEntityRatioThreshold: 0.10
};

const GENERIC_SUBJECTS = new Set(["this", "this record", "the record", "record", "it", "the archive", "the answer"]);
const COMMON_TERMS = new Set([
  "a", "an", "and", "answer", "archive", "based", "both", "compare", "evidence", "exact",
  "field", "fields", "listed", "record", "records", "related", "route", "source", "source-linked",
  "the", "this", "use", "using", "with", "surface", "publication", "recommendation", "reasoning",
  "conclusion", "keep", "sources", "these", "therefore", "users"
]);

const ADJECTIVE_TO_REGION = new Map([
  ["french", "france"],
  ["russian", "russia"],
  ["soviet", "soviet union"],
  ["american", "united states"],
  ["mexican", "mexico"],
  ["chilean", "chile"],
  ["indian", "india"],
  ["south indian", "india"],
  ["caribbean", "caribbean"]
]);

function parseArgs(args) {
  const parsed = { ...defaults };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--unsupported-triple-ratio-threshold") parsed.unsupportedTripleRatioThreshold = Number(args[++index]);
    else if (arg === "--unsupported-entity-ratio-threshold") parsed.unsupportedEntityRatioThreshold = Number(args[++index]);
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

function normalize(text) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stripTags(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "")
    .trim();
}

function answerBody(row, rawModel = false) {
  const text = rawModel
    ? (row.raw_answer_text || row.model_answer_text || row.answer_text || row.generated_text || "")
    : (row.answer_text || row.generated_text || row.model_answer_text || row.raw_answer_text || "");
  return stripTags(text);
}

function flatten(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => flatten(item));
  if (typeof value === "object") return Object.values(value).flatMap((item) => flatten(item));
  return [];
}

function evidenceText(records) {
  const fields = [
    "title", "creator", "date_text", "region", "object_type", "medium",
    "source", "rights", "rights_interpretation", "image_state", "topology", "method_context", "notes"
  ];
  return records.flatMap((record) => fields.flatMap((field) => flatten(record?.[field]))).join(" ");
}

function dateEvidenceText(records, queryText) {
  return records.flatMap((record) => [record?.date_text, record?.title, record?.notes?.compact])
    .concat(queryText || "")
    .filter(Boolean)
    .join(" ");
}

function knownDateTokens(records, queryText) {
  return new Set((dateEvidenceText(records, queryText).match(/\b(?:circa\s+)?\d{4}(?:s|-\d{2}(?:-\d{2})?)?\b/gi) || [])
    .map((value) => normalize(value)));
}

function dateIsSupported(value, knownDates) {
  const normalized = normalize(value);
  if (knownDates.has(normalized)) return true;
  const yearMatch = normalized.match(/\b(\d{4})s?\b/);
  if (!yearMatch) return false;
  const year = Number(yearMatch[1]);
  if (!Number.isFinite(year)) return false;
  if (normalized.endsWith("s")) {
    const decadeStart = Math.floor(year / 10) * 10;
    return [...knownDates].some((known) => {
      const knownYear = Number(known.match(/\b(\d{4})\b/)?.[1]);
      return Number.isFinite(knownYear) && knownYear >= decadeStart && knownYear < decadeStart + 10;
    });
  }
  return false;
}

function unsupportedDatesIn(text, knownDates) {
  return [...new Set(String(text || "").match(/\b(?:circa\s+)?\d{4}(?:s|-\d{2}(?:-\d{2})?)?\b/gi) || [])]
    .filter((date) => !dateIsSupported(date, knownDates));
}

function extractTriples(text) {
  const triples = [];
  const patterns = [
    /\b([A-Z][\p{L}\d&'’.-]*(?:\s+[A-Z][\p{L}\d&'’.-]*){0,4}|This record|The record|Record\s+\d+)\s+(is|was|has|contains|includes|depicts|shows|records|represents|dates to|comes from)\s+(.+?)(?:\.|;|$)/giu,
    /\b([A-Z][\p{L}\d&'’.-]*(?:\s+[A-Z][\p{L}\d&'’.-]*){0,4}|This record|The record|Record\s+\d+)\s+(in|at|on|from|by|around)\s+(.+?)(?:\.|;|$)/giu
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      triples.push({
        subject: match[1].trim(),
        relation: match[2].trim(),
        object: match[3].trim().slice(0, 180)
      });
    }
  }
  return triples;
}

function meaningfulTokens(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !COMMON_TERMS.has(token));
}

function tripleSupported(triple, allowedText) {
  const subjectNorm = normalize(triple.subject);
  if (GENERIC_SUBJECTS.has(subjectNorm) || /^record \d+$/.test(subjectNorm)) {
    return meaningfulTokens(triple.object).some((token) => allowedText.includes(token));
  }
  const subjectTokens = meaningfulTokens(triple.subject);
  const objectTokens = meaningfulTokens(triple.object);
  const subjectOk = subjectTokens.length === 0 || subjectTokens.some((token) => allowedText.includes(token));
  const objectOk = objectTokens.length === 0 || objectTokens.some((token) => allowedText.includes(token));
  return subjectOk && objectOk;
}

function entitySupported(term, allowedText) {
  const tokens = meaningfulTokens(term);
  if (tokens.length === 0) return true;
  const normalized = normalize(term);
  const mapped = ADJECTIVE_TO_REGION.get(normalized);
  if (mapped && allowedText.includes(mapped)) return true;
  return tokens.every((token) => allowedText.includes(token));
}

function candidateEntities(text) {
  return [...new Set(String(text).match(/\b[\p{Lu}][\p{L}\d&'’.-]*(?:\s+[\p{Lu}][\p{L}\d&'’.-]*){0,4}/gu) || [])]
    .map((term) => term.trim())
    .filter((term) => term && !GENERIC_SUBJECTS.has(normalize(term)));
}

function unsupportedEntitiesIn(text, allowedText) {
  return candidateEntities(text).filter((term) => !entitySupported(term, allowedText));
}

function tripleHasUnsupportedAnchor(triple, allowedText, knownDates) {
  const text = `${triple.subject} ${triple.object}`;
  return unsupportedDatesIn(text, knownDates).length > 0 || unsupportedEntitiesIn(text, allowedText).length > 0;
}

function classifyUnsupportedTriple(triple, allowedText, knownDates) {
  const text = `${triple.subject} ${triple.object}`;
  if (unsupportedDatesIn(text, knownDates).length > 0) return "wrong_date";
  if (unsupportedEntitiesIn(text, allowedText).length > 0) return "wrong_entity";
  return "wrong_relation";
}

export function detectHallucination(options) {
  const labels = readJsonl(options.labelsPath);
  const recordsById = new Map(readJsonl(options.recordsPath).map((record) => [record.record_id || record.id, record]));
  const queriesById = fs.existsSync(options.queriesPath)
    ? new Map(readJsonl(options.queriesPath).map((query) => [idOf(query), query]))
    : new Map();
  const answersById = new Map(readJsonl(options.answersPath).map((answer) => [idOf(answer), answer]));

  const findings = [];
  let evaluated = 0;
  let unsupportedTripleAnswers = 0;
  let unsupportedEntityAnswers = 0;
  let unsupportedDateCount = 0;

  for (const label of labels) {
    const queryId = idOf(label);
    const answer = answersById.get(queryId);
    if (!answer || label.refusal_expected) continue;
    if (!options.includeDeterministic && (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency")) continue;
    const body = answerBody(answer, options.rawModel);
    if (!body) continue;
    evaluated += 1;

    const retrievedIds = String(answer.retrieved_ids || "").split("|").map((id) => id.trim()).filter(Boolean);
    const evidenceIds = retrievedIds.length > 0 ? retrievedIds : (label.gold_evidence_ids || []);
    const evidenceRecords = evidenceIds.map((id) => recordsById.get(id)).filter(Boolean);
    const query = queriesById.get(queryId);
    const allowedText = normalize(`${evidenceText(evidenceRecords)} ${query?.query_text || query?.text || ""}`);
    const knownDates = knownDateTokens(evidenceRecords, query?.query_text || query?.text || "");

    const unsupportedDates = unsupportedDatesIn(body, knownDates);
    const unsupportedEntities = unsupportedEntitiesIn(body, allowedText);
    const unsupportedTriples = extractTriples(body)
      .filter((triple) => !tripleSupported(triple, allowedText))
      .filter((triple) => tripleHasUnsupportedAnchor(triple, allowedText, knownDates))
      .map((triple) => ({
        ...triple,
        type: classifyUnsupportedTriple(triple, allowedText, knownDates)
      }));

    unsupportedDateCount += unsupportedDates.length;
    if (unsupportedEntities.length > 0) unsupportedEntityAnswers += 1;
    if (unsupportedTriples.length > 0) unsupportedTripleAnswers += 1;
    if (unsupportedDates.length || unsupportedEntities.length || unsupportedTriples.length) {
      findings.push({
        query_id: queryId,
        intent: label.intent,
        unsupported_dates: unsupportedDates,
        unsupported_entities: unsupportedEntities,
        unsupported_triples: unsupportedTriples,
        answer_body: body
      });
    }
  }

  const unsupportedTripleRatio = evaluated ? unsupportedTripleAnswers / evaluated : 0;
  const unsupportedEntityRatio = evaluated ? unsupportedEntityAnswers / evaluated : 0;
  const pass = unsupportedDateCount === 0 &&
    unsupportedTripleRatio <= options.unsupportedTripleRatioThreshold &&
    unsupportedEntityRatio <= options.unsupportedEntityRatioThreshold;

  return {
    generated_at: new Date().toISOString(),
    inputs: {
      labelsPath: path.relative(repoRoot, options.labelsPath),
      recordsPath: path.relative(repoRoot, options.recordsPath),
      queriesPath: path.relative(repoRoot, options.queriesPath),
      answersPath: path.relative(repoRoot, options.answersPath)
    },
    gate: {
      pass,
      evaluated_answer_count: evaluated,
      unsupported_date_count: unsupportedDateCount,
      unsupported_triple_answer_count: unsupportedTripleAnswers,
      unsupported_triple_ratio: Number(unsupportedTripleRatio.toFixed(4)),
      unsupported_triple_ratio_threshold: options.unsupportedTripleRatioThreshold,
      unsupported_entity_answer_count: unsupportedEntityAnswers,
      unsupported_entity_ratio: Number(unsupportedEntityRatio.toFixed(4)),
      unsupported_entity_ratio_threshold: options.unsupportedEntityRatioThreshold,
      answer_source: options.rawModel ? "raw_model_text" : "delivered_answer_text"
    },
    findings
  };
}

function markdown(report) {
  const rows = report.findings.length === 0
    ? "| none | none | none | none | none |"
    : report.findings.map((finding) => `| ${finding.query_id} | ${finding.intent} | ${finding.unsupported_dates.join("; ") || "none"} | ${finding.unsupported_entities.join("; ") || "none"} | ${finding.unsupported_triples.map((triple) => `[${triple.type}] ${triple.subject} ${triple.relation} ${triple.object}`).join("; ") || "none"} |`).join("\n");
  return `# Hallucination And Unsupported Fact Check

Generated: ${report.generated_at}

This check reviews delivered answer prose after removing injected \`EVIDENCE TAGS\`.
It flags unsupported years, unsupported named terms, and simple unsupported
subject-relation-object assertions.

## Gate

- Pass: ${report.gate.pass}
- Evaluated answers: ${report.gate.evaluated_answer_count}
- Unsupported date count: ${report.gate.unsupported_date_count}
- Unsupported triple answer ratio: ${report.gate.unsupported_triple_ratio}
- Unsupported triple threshold: ${report.gate.unsupported_triple_ratio_threshold}
- Unsupported entity answer ratio: ${report.gate.unsupported_entity_ratio}
- Unsupported entity threshold: ${report.gate.unsupported_entity_ratio_threshold}
- Answer source: ${report.gate.answer_source}

## Findings

| Query | Intent | Unsupported Dates | Unsupported Entities | Unsupported Triples |
|---|---|---|---|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = detectHallucination(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
  if (options.strict && !report.gate.pass) process.exit(1);
}
