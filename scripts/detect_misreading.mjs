#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v31_safe_body_answers.jsonl"),
  jsonOutPath: null,
  mdOutPath: null,
  strict: false,
  includeDeterministic: false,
  rawModel: false,
  promptLeakThreshold: 0,
  negationMismatchRatioThreshold: 0.03,
  overconfidenceRatioThreshold: 0.15,
  inferenceRatioThreshold: 0.15
};

const OVERCONFIDENCE_RE = /\b(all|every|none|always|never|certainly|definitely|undoubtedly|without question|guarantees?|proves?|must|only)\b/gi;
const INFERENCE_RE = /\b(therefore|thus|implies|consequently|as a result|this means|suggests that|shows that|indicates that)\b/gi;
const NEGATION_RE = /\b(not|no|without|exclude|excluding|except|never|cannot|can't|isn't|aren't|don't|doesn't)\b/i;
const REFUSAL_RE = /\b(cannot answer|evidence is insufficient|no evidence|not enough evidence|unable to answer)\b/i;
const PROMPT_LEAK_RE = /\b(EVIDENCE VALUES\s*(?:\(|:)|Evidence value order|OUTPUT FORMAT|Output: Write|Record\s+\d+:|Do not write|The system will append|Replace \?\?\?|QUERY:|INSTRUCTION:)\b/i;

const QUERY_SCOPE_TERMS = new Set(["all", "every", "none", "always", "never", "only"]);

function parseArgs(args) {
  const parsed = { ...defaults };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--prompt-leak-threshold") parsed.promptLeakThreshold = Number(args[++index]);
    else if (arg === "--negation-mismatch-ratio-threshold") parsed.negationMismatchRatioThreshold = Number(args[++index]);
    else if (arg === "--overconfidence-ratio-threshold") parsed.overconfidenceRatioThreshold = Number(args[++index]);
    else if (arg === "--inference-ratio-threshold") parsed.inferenceRatioThreshold = Number(args[++index]);
    else if (arg === "--include-deterministic") parsed.includeDeterministic = true;
    else if (arg === "--raw-model") parsed.rawModel = true;
    else if (arg === "--strict") parsed.strict = true;
    else positional.push(arg);
  }
  if (positional[0]) parsed.queriesPath = path.resolve(positional[0]);
  if (positional[1]) parsed.labelsPath = path.resolve(positional[1]);
  if (positional[2]) parsed.recordsPath = path.resolve(positional[2]);
  if (positional[3]) parsed.answersPath = path.resolve(positional[3]);
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

function flatten(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => flatten(item));
  if (typeof value === "object") return Object.values(value).flatMap((item) => flatten(item));
  return [];
}

function evidenceText(records) {
  return records.flatMap((record) => [
    record?.title,
    record?.creator,
    record?.date_text,
    record?.region,
    record?.rights,
    record?.source,
    record?.topology,
    record?.method_context,
    record?.notes
  ].flatMap((value) => flatten(value))).join(" ");
}

function uniqueMatches(text, regex) {
  return [...new Set(String(text || "").match(regex) || [])].map((value) => value.toLowerCase());
}

function scopeTerms(text) {
  return uniqueMatches(text, OVERCONFIDENCE_RE).filter((term) => QUERY_SCOPE_TERMS.has(term));
}

function detectNegationMismatch(queryText, answerText) {
  if (!NEGATION_RE.test(queryText)) return false;
  if (NEGATION_RE.test(answerText) || REFUSAL_RE.test(answerText)) return false;
  return true;
}

function detectUnwarrantedInference(answerText, evidenceTextValue) {
  const answerTerms = uniqueMatches(answerText, INFERENCE_RE);
  if (answerTerms.length === 0) return [];
  const evidenceTerms = uniqueMatches(evidenceTextValue, INFERENCE_RE);
  return answerTerms.filter((term) => !evidenceTerms.includes(term));
}

function detectOverconfidence(queryText, answerText, evidenceTextValue) {
  const answerTerms = uniqueMatches(answerText, OVERCONFIDENCE_RE);
  if (answerTerms.length === 0) return [];
  const queryScope = new Set(scopeTerms(queryText));
  const evidenceScope = new Set(scopeTerms(evidenceTextValue));
  return answerTerms.filter((term) => {
    if (term === "only" && /\bonly (the|these|this|that) evidence\b/i.test(answerText)) return false;
    if (queryScope.has(term) || evidenceScope.has(term)) return false;
    return true;
  });
}

export function detectMisreading(options) {
  const queriesById = new Map(readJsonl(options.queriesPath).map((query) => [idOf(query), query]));
  const labelsById = new Map(readJsonl(options.labelsPath).map((label) => [idOf(label), label]));
  const recordsById = new Map(readJsonl(options.recordsPath).map((record) => [record.record_id || record.id, record]));
  const answers = readJsonl(options.answersPath);

  const findings = [];
  let evaluated = 0;
  let promptLeakCount = 0;
  let negationMismatchCount = 0;
  let overconfidenceCount = 0;
  let inferenceCount = 0;

  for (const answer of answers) {
    const queryId = idOf(answer);
    const label = labelsById.get(queryId);
    if (!label || label.refusal_expected) continue;
    if (!options.includeDeterministic && (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency")) continue;
    const body = answerBody(answer, options.rawModel);
    if (!body) continue;
    evaluated += 1;

    const query = queriesById.get(queryId);
    const queryText = query?.query_text || query?.text || "";
    const retrievedIds = String(answer.retrieved_ids || "")
      .split("|")
      .map((id) => id.trim())
      .filter(Boolean);
    const evidenceIds = retrievedIds.length > 0 ? retrievedIds : (label.gold_evidence_ids || []);
    const evidenceRecords = evidenceIds.map((id) => recordsById.get(id)).filter(Boolean);
    const evidenceTextValue = evidenceText(evidenceRecords);

    const promptLeak = PROMPT_LEAK_RE.test(body);
    const negationMismatch = detectNegationMismatch(queryText, body);
    const overconfidence = detectOverconfidence(queryText, body, evidenceTextValue);
    const inference = detectUnwarrantedInference(body, evidenceTextValue);

    if (promptLeak) promptLeakCount += 1;
    if (negationMismatch) negationMismatchCount += 1;
    if (overconfidence.length > 0) overconfidenceCount += 1;
    if (inference.length > 0) inferenceCount += 1;

    if (promptLeak || negationMismatch || overconfidence.length || inference.length) {
      findings.push({
        query_id: queryId,
        intent: label.intent,
        prompt_leak: promptLeak,
        possible_negation_misread: negationMismatch,
        overconfidence_terms: overconfidence,
        unwarranted_inference_terms: inference,
        answer_body: body
      });
    }
  }

  const negationMismatchRatio = evaluated ? negationMismatchCount / evaluated : 0;
  const overconfidenceRatio = evaluated ? overconfidenceCount / evaluated : 0;
  const inferenceRatio = evaluated ? inferenceCount / evaluated : 0;
  const pass = promptLeakCount <= options.promptLeakThreshold &&
    negationMismatchRatio <= options.negationMismatchRatioThreshold &&
    overconfidenceRatio <= options.overconfidenceRatioThreshold &&
    inferenceRatio <= options.inferenceRatioThreshold;

  return {
    generated_at: new Date().toISOString(),
    inputs: {
      queriesPath: path.relative(repoRoot, options.queriesPath),
      labelsPath: path.relative(repoRoot, options.labelsPath),
      recordsPath: path.relative(repoRoot, options.recordsPath),
      answersPath: path.relative(repoRoot, options.answersPath)
    },
    gate: {
      pass,
      evaluated_answer_count: evaluated,
      prompt_leak_count: promptLeakCount,
      prompt_leak_threshold: options.promptLeakThreshold,
      negation_mismatch_count: negationMismatchCount,
      negation_mismatch_ratio: Number(negationMismatchRatio.toFixed(4)),
      negation_mismatch_ratio_threshold: options.negationMismatchRatioThreshold,
      overconfidence_answer_count: overconfidenceCount,
      overconfidence_ratio: Number(overconfidenceRatio.toFixed(4)),
      overconfidence_ratio_threshold: options.overconfidenceRatioThreshold,
      unwarranted_inference_answer_count: inferenceCount,
      unwarranted_inference_ratio: Number(inferenceRatio.toFixed(4)),
      unwarranted_inference_ratio_threshold: options.inferenceRatioThreshold,
      answer_source: options.rawModel ? "raw_model_text" : "delivered_answer_text"
    },
    findings
  };
}

function markdown(report) {
  const rows = report.findings.length === 0
    ? "| none | none | no | no | none | none |"
    : report.findings.map((finding) => `| ${finding.query_id} | ${finding.intent} | ${finding.prompt_leak ? "yes" : "no"} | ${finding.possible_negation_misread ? "yes" : "no"} | ${finding.overconfidence_terms.join("; ") || "none"} | ${finding.unwarranted_inference_terms.join("; ") || "none"} |`).join("\n");
  return `# Misreading And Overconfidence Check

Generated: ${report.generated_at}

This check scans delivered answer prose after removing injected \`EVIDENCE TAGS\`.
It catches prompt leakage, likely negation mismatches, absolute language, and
inference markers that are not present in the evidence.

## Gate

- Pass: ${report.gate.pass}
- Evaluated answers: ${report.gate.evaluated_answer_count}
- Prompt leaks: ${report.gate.prompt_leak_count}
- Negation mismatch ratio: ${report.gate.negation_mismatch_ratio}
- Overconfidence ratio: ${report.gate.overconfidence_ratio}
- Unwarranted inference ratio: ${report.gate.unwarranted_inference_ratio}
- Answer source: ${report.gate.answer_source}

## Findings

| Query | Intent | Prompt Leak | Negation Mismatch | Overconfidence Terms | Inference Terms |
|---|---|---|---|---|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = detectMisreading(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
  if (options.strict && !report.gate.pass) process.exit(1);
}
