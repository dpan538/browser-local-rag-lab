#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v32_guarded_prose_budgeted_generation_answers.jsonl"),
  jsonOutPath: null,
  mdOutPath: null,
  strict: false,
  includeDeterministic: false,
  rawModel: false,
  missingHedgeRatioThreshold: 0.05
};

const ABSOLUTE_RE = /\b(all|every|never|always|certainly|definitely|proves?)\b/gi;
const INFERENCE_RE = /\b(therefore|thus|implies|consequently|as a result)\b/gi;
const FIRST_CLAIM_RE = /\b(first|earliest|original)\b/gi;
const REQUIRED_HEDGE_RE = /^based on these records,/i;

function parseArgs(args) {
  const parsed = { ...defaults };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--missing-hedge-ratio-threshold") parsed.missingHedgeRatioThreshold = Number(args[++index]);
    else if (arg === "--include-deterministic") parsed.includeDeterministic = true;
    else if (arg === "--raw-model") parsed.rawModel = true;
    else if (arg === "--strict") parsed.strict = true;
    else positional.push(arg);
  }
  if (positional[0]) parsed.answersPath = path.resolve(positional[0]);
  if (positional[1]) parsed.labelsPath = path.resolve(positional[1]);
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

function answerBody(row, rawModel = false) {
  const text = rawModel
    ? (row.raw_answer_text || row.model_answer_text || row.answer_text || row.generated_text || "")
    : (row.answer_text || row.generated_text || row.model_answer_text || row.raw_answer_text || "");
  return stripTags(text);
}

function uniqueMatches(text, regex) {
  regex.lastIndex = 0;
  return [...new Set(String(text || "").match(regex) || [])].map((value) => value.toLowerCase());
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function flatten(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => flatten(item));
  if (typeof value === "object") return Object.values(value).flatMap((item) => flatten(item));
  return [];
}

function hasChronologyProof(records) {
  return records.some((record) => {
    return record?.chronology_proof === true ||
      Boolean(record?.first_or_earliest_claim) ||
      flatten(record).some((value) => /\bchronology proof\b/i.test(value));
  });
}

function bodyWithoutQuotedEvidenceValues(body, records) {
  let masked = String(body || "");
  const values = [...new Set(records.flatMap((record) => flatten(record))
    .filter((value) => {
      const text = String(value || "").trim();
      return text.length >= 4 && /\S\s+\S/.test(text);
    }))]
    .sort((a, b) => String(b).length - String(a).length);

  for (const value of values) {
    const text = String(value).trim();
    if (!text) continue;
    masked = masked.replace(new RegExp(escapeRegExp(text), "gi"), " ");
  }
  return masked;
}

function sentenceHasEvidenceOverlap(sentence, evidenceValue, minOverlap = 5) {
  const sentenceTokens = new Set(tokenize(sentence));
  const evidenceTokens = tokenize(evidenceValue);
  let overlap = 0;
  for (const token of evidenceTokens) {
    if (sentenceTokens.has(token)) overlap += 1;
    if (overlap >= minOverlap) return true;
  }
  return false;
}

function termIsEvidenceQuote(body, records, term) {
  const termRe = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
  const sentences = String(body || "")
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => termRe.test(sentence));
  if (sentences.length === 0) return false;
  const evidenceValues = [...new Set(records.flatMap((record) => flatten(record))
    .map((value) => String(value || "").trim())
    .filter((value) => value.length >= 12 && termRe.test(value)))];
  return sentences.some((sentence) => evidenceValues.some((value) => sentenceHasEvidenceOverlap(sentence, value)));
}

function absoluteMatches(body, unquotedBody, records) {
  return uniqueMatches(unquotedBody, ABSOLUTE_RE)
    .filter((match) => !termIsEvidenceQuote(body, records, match));
}

function firstClaimMatches(text) {
  return uniqueMatches(text, FIRST_CLAIM_RE).filter((match) => {
    if (match === "first" && /\b(listed\s+first|first\s+(when|if|where|available))\b/i.test(text)) return false;
    return !new RegExp(`\\b${match}\\s+(record|evidence|item|line|one|two)\\b`, "i").test(text);
  });
}

export function checkGuardrailCompliance(options) {
  const labelsById = new Map(readJsonl(options.labelsPath).map((label) => [idOf(label), label]));
  const recordsById = fs.existsSync(options.recordsPath)
    ? new Map(readJsonl(options.recordsPath).map((record) => [record.record_id || record.id, record]))
    : new Map();
  const answers = readJsonl(options.answersPath);

  const findings = [];
  let evaluated = 0;
  let absoluteViolationCount = 0;
  let inferenceViolationCount = 0;
  let firstClaimViolationCount = 0;
  let missingHedgeCount = 0;

  for (const answer of answers) {
    const queryId = idOf(answer);
    const label = labelsById.get(queryId);
    if (!label || label.refusal_expected) continue;
    if (!options.includeDeterministic && (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency")) continue;
    const body = answerBody(answer, options.rawModel);
    if (!body) continue;
    evaluated += 1;

    const retrievedIds = String(answer.retrieved_ids || "")
      .split("|")
      .map((id) => id.trim())
      .filter(Boolean);
    const evidenceIds = retrievedIds.length > 0 ? retrievedIds : (label.gold_evidence_ids || []);
    const records = evidenceIds.map((id) => recordsById.get(id)).filter(Boolean);
    const unquotedBody = bodyWithoutQuotedEvidenceValues(body, records);
    const absolute = absoluteMatches(body, unquotedBody, records);
    const inference = uniqueMatches(unquotedBody, INFERENCE_RE);
    const firstClaim = hasChronologyProof(records) ? [] : firstClaimMatches(unquotedBody);
    const missingHedge = !REQUIRED_HEDGE_RE.test(body);

    if (absolute.length) absoluteViolationCount += 1;
    if (inference.length) inferenceViolationCount += 1;
    if (firstClaim.length) firstClaimViolationCount += 1;
    if (missingHedge) missingHedgeCount += 1;
    if (absolute.length || inference.length || firstClaim.length || missingHedge) {
      findings.push({
        query_id: queryId,
        intent: label.intent,
        absolute_terms: absolute,
        inference_terms: inference,
        first_claim_terms: firstClaim,
        missing_hedge: missingHedge,
        answer_body: body
      });
    }
  }

  const missingHedgeRatio = evaluated ? missingHedgeCount / evaluated : 0;
  const pass = absoluteViolationCount === 0 &&
    inferenceViolationCount === 0 &&
    firstClaimViolationCount === 0 &&
    missingHedgeRatio <= options.missingHedgeRatioThreshold;

  return {
    generated_at: new Date().toISOString(),
    inputs: {
      labelsPath: path.relative(repoRoot, options.labelsPath),
      recordsPath: path.relative(repoRoot, options.recordsPath),
      answersPath: path.relative(repoRoot, options.answersPath)
    },
    gate: {
      pass,
      evaluated_answer_count: evaluated,
      absolute_violation_count: absoluteViolationCount,
      inference_violation_count: inferenceViolationCount,
      first_claim_violation_count: firstClaimViolationCount,
      missing_hedge_count: missingHedgeCount,
      missing_hedge_ratio: Number(missingHedgeRatio.toFixed(4)),
      missing_hedge_ratio_threshold: options.missingHedgeRatioThreshold,
      answer_source: options.rawModel ? "raw_model_text" : "delivered_answer_text"
    },
    findings
  };
}

function markdown(report) {
  const rows = report.findings.length === 0
    ? "| none | none | none | none | none | no |"
    : report.findings.map((finding) => `| ${finding.query_id} | ${finding.intent} | ${finding.absolute_terms.join("; ") || "none"} | ${finding.inference_terms.join("; ") || "none"} | ${finding.first_claim_terms.join("; ") || "none"} | ${finding.missing_hedge ? "yes" : "no"} |`).join("\n");
  return `# Guardrail Compliance Check

Generated: ${report.generated_at}

This check verifies V3.2 guarded prose rules on delivered answer bodies by
default. Use \`--raw-model\` to audit model text before browser post-processing.

## Gate

- Pass: ${report.gate.pass}
- Evaluated answers: ${report.gate.evaluated_answer_count}
- Absolute term violations: ${report.gate.absolute_violation_count}
- Inference term violations: ${report.gate.inference_violation_count}
- First-claim violations: ${report.gate.first_claim_violation_count}
- Missing hedge ratio: ${report.gate.missing_hedge_ratio}
- Answer source: ${report.gate.answer_source}

## Findings

| Query | Intent | Absolute Terms | Inference Terms | First-Claim Terms | Missing Hedge |
|---|---|---|---|---|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = checkGuardrailCompliance(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
  if (options.strict && !report.gate.pass) process.exit(1);
}
