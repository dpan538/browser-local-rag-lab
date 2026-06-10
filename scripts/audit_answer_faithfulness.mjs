#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency_pilot50_v31_evidence_prune_tag_injection_answers.jsonl"),
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  jsonOutPath: null,
  mdOutPath: null,
  suspiciousRatioThreshold: 0.10,
  strict: false,
  includeDeterministic: false,
  rawModel: false
};

const COMMON_CAPITALIZED = new Set([
  "a", "an", "and", "answer", "archive", "based", "because", "do", "evidence", "i", "if", "in",
  "it", "keep", "no", "not", "of", "on", "or", "publication", "query", "record", "records",
  "role", "roles", "source", "start", "surface", "the", "this", "these", "those", "to", "type",
  "types", "use", "user", "users", "with", "world", "you", "sources", "therefore", "thus"
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
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--suspicious-ratio-threshold") parsed.suspiciousRatioThreshold = Number(args[++index]);
    else if (arg === "--strict") parsed.strict = true;
    else if (arg === "--include-deterministic") parsed.includeDeterministic = true;
    else if (arg === "--raw-model") parsed.rawModel = true;
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

function stripModelNoise(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "")
    .trim();
}

function answerBody(row, rawModel = false) {
  const text = rawModel
    ? (row.raw_answer_text || row.model_answer_text || row.answer_text || row.generated_text || "")
    : (row.answer_text || row.generated_text || row.model_answer_text || row.raw_answer_text || "");
  return stripModelNoise(text);
}

function flattenValues(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => flattenValues(item));
  if (typeof value === "object") return Object.values(value).flatMap((item) => flattenValues(item));
  return [];
}

function evidenceText(records) {
  const allowedFields = [
    "record_id", "object_id", "title", "creator", "date_text", "region", "object_type", "medium",
    "source", "rights", "rights_interpretation", "image_state", "topology", "method_context"
  ];
  const values = [];
  for (const record of records) {
    for (const field of allowedFields) values.push(...flattenValues(record?.[field]));
  }
  return values.join(" ");
}

function dateEvidenceText(records, queryText) {
  const values = [];
  for (const record of records) {
    values.push(record?.date_text);
    values.push(record?.title);
    values.push(record?.notes?.compact);
  }
  values.push(queryText || "");
  return values.filter(Boolean).join(" ");
}

function knownDateTokens(records, queryText) {
  const haystack = dateEvidenceText(records, queryText);
  return new Set((haystack.match(/\b(?:circa\s+)?\d{4}(?:s|-\d{2}(?:-\d{2})?)?\b/gi) || []).map((value) => normalize(value)));
}

function dateIsKnown(date, knownDates) {
  const normalized = normalize(date);
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

function hasAllowedEntity(term, allowedText) {
  const normalizedTerm = normalize(term);
  if (normalizedTerm.length < 3) return true;
  if (COMMON_CAPITALIZED.has(normalizedTerm)) return true;
  const mapped = ADJECTIVE_TO_REGION.get(normalizedTerm);
  if (mapped && allowedText.includes(mapped)) return true;
  const tokens = normalizedTerm.split(/\s+/).filter(Boolean);
  if (tokens.every((token) => COMMON_CAPITALIZED.has(token))) return true;
  if (tokens.filter((token) => !COMMON_CAPITALIZED.has(token)).every((token) => allowedText.includes(token))) return true;
  return allowedText.includes(normalizedTerm);
}

function candidateEntities(text) {
  const matches = String(text).match(/\b[\p{Lu}][\p{L}\d&'’.-]*(?:\s+[\p{Lu}][\p{L}\d&'’.-]*){0,4}/gu) || [];
  return [...new Set(matches.map((term) => term.replace(/\s+/g, " ").trim()).filter(Boolean))];
}

function auditFaithfulness({ labelsPath, recordsPath, answersPath, queriesPath, includeDeterministic = false, suspiciousRatioThreshold = 0.10, rawModel = false }) {
  const labels = readJsonl(labelsPath);
  const recordsById = new Map(readJsonl(recordsPath).map((record) => [record.record_id || record.id, record]));
  const answersById = new Map(readJsonl(answersPath).map((answer) => [idOf(answer), answer]));
  const queriesById = fs.existsSync(queriesPath)
    ? new Map(readJsonl(queriesPath).map((query) => [idOf(query), query]))
    : new Map();

  const findings = [];
  let evaluated = 0;

  for (const label of labels) {
    const queryId = idOf(label);
    const answer = answersById.get(queryId);
    if (!answer) continue;
    if (!includeDeterministic && (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency")) continue;
    if (label.refusal_expected) continue;

    const body = answerBody(answer, rawModel);
    if (!body) continue;
    evaluated += 1;

    const query = queriesById.get(queryId);
    const retrievedIds = String(answer.retrieved_ids || "")
      .split("|")
      .map((evidenceId) => evidenceId.trim())
      .filter(Boolean);
    const evidenceIds = retrievedIds.length > 0 ? retrievedIds : (label.gold_evidence_ids || []);
    const evidenceRecords = evidenceIds.map((evidenceId) => recordsById.get(evidenceId)).filter(Boolean);
    const allowedText = normalize(`${evidenceText(evidenceRecords)} ${query?.query_text || query?.text || ""}`);
    const knownDates = knownDateTokens(evidenceRecords, query?.query_text || query?.text || "");

    const suspiciousDates = [...new Set(body.match(/\b(?:circa\s+)?\d{4}(?:s|-\d{2}(?:-\d{2})?)?\b/gi) || [])]
      .filter((date) => !dateIsKnown(date, knownDates))
      .map((value) => ({ type: "date_not_in_evidence", value }));

    const suspiciousEntities = candidateEntities(body)
      .filter((term) => !hasAllowedEntity(term, allowedText))
      .map((value) => ({ type: "possible_name_or_place", value }));

    const suspiciousItems = [...suspiciousDates, ...suspiciousEntities];
    if (suspiciousItems.length > 0) {
      findings.push({
        query_id: queryId,
        intent: label.intent,
        date_issue_count: suspiciousDates.length,
        entity_issue_count: suspiciousEntities.length,
        suspicious_items: suspiciousItems,
        answer_body: body
      });
    }
  }

  const dateHallucinationCount = findings.reduce((sum, finding) => sum + finding.date_issue_count, 0);
  const suspiciousAnswerCount = findings.length;
  const suspiciousAnswerRatio = evaluated > 0 ? suspiciousAnswerCount / evaluated : 0;
  const pass = dateHallucinationCount === 0 && suspiciousAnswerRatio <= suspiciousRatioThreshold;

  return {
    generated_at: new Date().toISOString(),
    inputs: {
      labelsPath: path.relative(repoRoot, labelsPath),
      recordsPath: path.relative(repoRoot, recordsPath),
      answersPath: path.relative(repoRoot, answersPath),
      queriesPath: path.relative(repoRoot, queriesPath)
    },
    gate: {
      pass,
      evaluated_answer_count: evaluated,
      suspicious_answer_count: suspiciousAnswerCount,
      suspicious_answer_ratio: Number(suspiciousAnswerRatio.toFixed(4)),
      suspicious_ratio_threshold: suspiciousRatioThreshold,
      date_hallucination_count: dateHallucinationCount,
      answer_source: rawModel ? "raw_model_text" : "delivered_answer_text"
    },
    findings
  };
}

function markdown(report) {
  const rows = report.findings.length === 0
    ? "| none | none | 0 | 0 | none |"
    : report.findings.map((finding) => {
      const items = finding.suspicious_items.map((item) => `${item.type}: ${item.value}`).join("; ");
      return `| ${finding.query_id} | ${finding.intent} | ${finding.date_issue_count} | ${finding.entity_issue_count} | ${items.replaceAll("\n", " ")} |`;
    }).join("\n");
  return `# V3.1 Answer Faithfulness Check

Generated: ${report.generated_at}

This check reviews Qwen-generated prose after removing injected \`EVIDENCE TAGS\`.
Deterministic hybrid rows and expected-refusal rows are excluded by default.

## Gate

- Pass: ${report.gate.pass}
- Evaluated Qwen answer bodies: ${report.gate.evaluated_answer_count}
- Suspicious answer count: ${report.gate.suspicious_answer_count}
- Suspicious answer ratio: ${report.gate.suspicious_answer_ratio}
- Suspicious ratio threshold: ${report.gate.suspicious_ratio_threshold}
- Date hallucination count: ${report.gate.date_hallucination_count}

## Findings

| Query | Intent | Date Issues | Entity Issues | Items |
|---|---|---:|---:|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = auditFaithfulness(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
  if (options.strict && !report.gate.pass) process.exit(1);
}

export { auditFaithfulness };
