#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency_pilot50_v31_evidence_prune_tag_injection_answers.jsonl"),
  jsonOutPath: null,
  mdOutPath: null,
  strict: false,
  includeDeterministic: false,
  offTopicThreshold: 0.05,
  tooShortWordThreshold: 4,
  offTopicRatioThreshold: 0.05,
  tooShortRatioThreshold: 0.05
};

const STOPWORDS = new Set([
  "about", "above", "after", "again", "against", "all", "also", "and", "any", "are", "archive",
  "because", "been", "before", "being", "between", "both", "but", "can", "could", "does", "each",
  "for", "from", "give", "has", "have", "how", "into", "its", "may", "more", "new", "not", "one",
  "only", "page", "please", "query", "record", "records", "should", "show", "source", "than", "that",
  "the", "their", "them", "then", "there", "these", "this", "those", "through", "use", "using", "was",
  "what", "when", "where", "which", "while", "with", "would", "you", "your"
]);

const INTENT_ANCHORS = {
  archive_orientation: ["archive", "folder", "folders", "organized", "topology", "view", "start", "source", "records"],
  casual_archive_help: ["archive", "folder", "folders", "start", "view", "record", "records", "source", "research", "design", "communication"],
  current_object_explanation: ["record", "document", "object", "title", "date", "region", "source"],
  comparison: ["compare", "comparison", "while", "whereas", "both", "difference", "records", "evidence", "primary", "secondary"],
  region_period_recommendation: ["recommend", "route", "region", "date", "period", "record", "records"],
  method_process_question: ["method", "evidence", "metadata", "source", "rights", "fields"],
  more_context: ["context", "evidence", "record", "records", "source"],
  first_earliest_claim: ["evidence", "chronology", "first", "earliest"]
};

function parseArgs(args) {
  const parsed = { ...defaults };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--off-topic-threshold") parsed.offTopicThreshold = Number(args[++index]);
    else if (arg === "--too-short-word-threshold") parsed.tooShortWordThreshold = Number(args[++index]);
    else if (arg === "--off-topic-ratio-threshold") parsed.offTopicRatioThreshold = Number(args[++index]);
    else if (arg === "--too-short-ratio-threshold") parsed.tooShortRatioThreshold = Number(args[++index]);
    else if (arg === "--strict") parsed.strict = true;
    else if (arg === "--include-deterministic") parsed.includeDeterministic = true;
    else positional.push(arg);
  }
  if (positional[0]) parsed.queriesPath = path.resolve(positional[0]);
  if (positional[1]) parsed.labelsPath = path.resolve(positional[1]);
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

function stripModelNoise(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "")
    .trim();
}

function answerBody(row) {
  return stripModelNoise(row.raw_answer_text || row.answer_text || row.generated_text || "");
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

function jaccard(leftTokens, rightTokens) {
  const left = new Set(leftTokens);
  const right = new Set(rightTokens);
  if (left.size === 0) return right.size === 0 ? 1 : 0;
  const intersection = [...left].filter((word) => right.has(word)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function scoreUsability({
  queriesPath,
  labelsPath,
  answersPath,
  includeDeterministic = false,
  offTopicThreshold = 0.05,
  tooShortWordThreshold = 4,
  offTopicRatioThreshold = 0.05,
  tooShortRatioThreshold = 0.05
}) {
  const queriesById = new Map(readJsonl(queriesPath).map((query) => [idOf(query), query]));
  const labelsById = new Map(readJsonl(labelsPath).map((label) => [idOf(label), label]));
  const answers = readJsonl(answersPath);
  const rows = [];

  for (const answer of answers) {
    const queryId = idOf(answer);
    const label = labelsById.get(queryId);
    if (!label || label.refusal_expected) continue;
    if (!includeDeterministic && (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency")) continue;
    const query = queriesById.get(queryId);
    const body = answerBody(answer);
    if (!body) continue;
    const queryTokens = tokenize(query?.query_text || query?.text || "");
    const answerTokens = tokenize(body);
    const similarity = jaccard(queryTokens, answerTokens);
    const answerTokenSet = new Set(answerTokens);
    const anchorHits = (INTENT_ANCHORS[label.intent] || []).filter((anchor) => answerTokenSet.has(anchor));
    const tooShort = answerTokens.length < tooShortWordThreshold;
    const offTopic = similarity < offTopicThreshold && queryTokens.length > 0 && anchorHits.length === 0;
    rows.push({
      query_id: queryId,
      intent: label.intent,
      answer_word_count: answerTokens.length,
      query_keyword_count: queryTokens.length,
      jaccard_similarity: Number(similarity.toFixed(4)),
      intent_anchor_hits: anchorHits,
      too_short: tooShort,
      off_topic: offTopic,
      answer_body: body
    });
  }

  const tooShortCount = rows.filter((row) => row.too_short).length;
  const offTopicCount = rows.filter((row) => row.off_topic).length;
  const tooShortRatio = rows.length ? tooShortCount / rows.length : 0;
  const offTopicRatio = rows.length ? offTopicCount / rows.length : 0;
  const pass = tooShortRatio <= tooShortRatioThreshold && offTopicRatio <= offTopicRatioThreshold;

  return {
    generated_at: new Date().toISOString(),
    inputs: {
      queriesPath: path.relative(repoRoot, queriesPath),
      labelsPath: path.relative(repoRoot, labelsPath),
      answersPath: path.relative(repoRoot, answersPath)
    },
    gate: {
      pass,
      evaluated_answer_count: rows.length,
      too_short_count: tooShortCount,
      too_short_ratio: Number(tooShortRatio.toFixed(4)),
      too_short_ratio_threshold: tooShortRatioThreshold,
      off_topic_count: offTopicCount,
      off_topic_ratio: Number(offTopicRatio.toFixed(4)),
      off_topic_ratio_threshold: offTopicRatioThreshold,
      off_topic_similarity_threshold: offTopicThreshold,
      too_short_word_threshold: tooShortWordThreshold
    },
    rows
  };
}

function markdown(report) {
  const flagged = report.rows.filter((row) => row.too_short || row.off_topic);
  const rows = flagged.length === 0
    ? "| none | none | 0 | 0 | false | false |"
    : flagged.map((row) => `| ${row.query_id} | ${row.intent} | ${row.answer_word_count} | ${row.jaccard_similarity} | ${row.too_short} | ${row.off_topic} |`).join("\n");
  return `# V3.1 Answer Usability Check

Generated: ${report.generated_at}

This check reviews Qwen-generated prose after removing injected \`EVIDENCE TAGS\`.
It is a fast screen for extremely short or obviously off-topic answer bodies, not a
replacement for human semantic review.

## Gate

- Pass: ${report.gate.pass}
- Evaluated Qwen answer bodies: ${report.gate.evaluated_answer_count}
- Too-short count: ${report.gate.too_short_count}
- Too-short ratio: ${report.gate.too_short_ratio}
- Too-short ratio threshold: ${report.gate.too_short_ratio_threshold}
- Off-topic count: ${report.gate.off_topic_count}
- Off-topic ratio: ${report.gate.off_topic_ratio}
- Off-topic ratio threshold: ${report.gate.off_topic_ratio_threshold}

## Flagged Rows

| Query | Intent | Answer Words | Query/Answer Jaccard | Too Short | Off Topic |
|---|---|---:|---:|---|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = scoreUsability(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
  if (options.strict && !report.gate.pass) process.exit(1);
}

export { scoreUsability };
