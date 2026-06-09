#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v32_guarded_prose_budgeted_generation_answers.jsonl"),
  jsonOutPath: null,
  mdOutPath: null,
  strict: false,
  includeDeterministic: false,
  rawModel: false,
  flagRatioThreshold: 0.02,
  minAvgSentenceWords: 4,
  maxAvgSentenceWords: 32,
  maxRepeatedTrigramCount: 2
};

function parseArgs(args) {
  const parsed = { ...defaults };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--flag-ratio-threshold") parsed.flagRatioThreshold = Number(args[++index]);
    else if (arg === "--min-avg-sentence-words") parsed.minAvgSentenceWords = Number(args[++index]);
    else if (arg === "--max-avg-sentence-words") parsed.maxAvgSentenceWords = Number(args[++index]);
    else if (arg === "--max-repeated-trigram-count") parsed.maxRepeatedTrigramCount = Number(args[++index]);
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

function words(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function sentenceStats(text) {
  const sentences = String(text || "")
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const counts = sentences.map((sentence) => words(sentence).length).filter((count) => count > 0);
  const avg = counts.length ? counts.reduce((sum, count) => sum + count, 0) / counts.length : 0;
  return { sentence_count: sentences.length, avg_sentence_words: Number(avg.toFixed(2)) };
}

function repeatedTrigrams(text) {
  const tokens = words(text);
  const counts = new Map();
  for (let index = 0; index < tokens.length - 2; index += 1) {
    const trigram = tokens.slice(index, index + 3).join(" ");
    counts.set(trigram, (counts.get(trigram) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([phrase, count]) => ({ phrase, count }));
}

export function checkReadability(options) {
  const labelsById = new Map(readJsonl(options.labelsPath).map((label) => [idOf(label), label]));
  const answers = readJsonl(options.answersPath);
  const rows = [];

  for (const answer of answers) {
    const queryId = idOf(answer);
    const label = labelsById.get(queryId);
    if (!label || label.refusal_expected) continue;
    if (!options.includeDeterministic && (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency")) continue;
    const body = answerBody(answer, options.rawModel);
    if (!body) continue;
    const stats = sentenceStats(body);
    const repeats = repeatedTrigrams(body);
    const flags = [];
    if (stats.avg_sentence_words < options.minAvgSentenceWords) flags.push("sentence_too_short");
    if (stats.avg_sentence_words > options.maxAvgSentenceWords) flags.push("sentence_too_long");
    if (repeats.some((item) => item.count > options.maxRepeatedTrigramCount)) flags.push("repetitive_trigram");
    if (/^based on these records,\s*based on these records,/i.test(body)) flags.push("duplicated_hedge");
    rows.push({
      query_id: queryId,
      intent: label.intent,
      ...stats,
      repeated_trigrams: repeats.slice(0, 5),
      flags,
      answer_body: body
    });
  }

  const flaggedRows = rows.filter((row) => row.flags.length > 0);
  const flagRatio = rows.length ? flaggedRows.length / rows.length : 0;
  const pass = flagRatio <= options.flagRatioThreshold;

  return {
    generated_at: new Date().toISOString(),
    inputs: {
      labelsPath: path.relative(repoRoot, options.labelsPath),
      answersPath: path.relative(repoRoot, options.answersPath)
    },
    gate: {
      pass,
      evaluated_answer_count: rows.length,
      flagged_count: flaggedRows.length,
      flagged_ratio: Number(flagRatio.toFixed(4)),
      flagged_ratio_threshold: options.flagRatioThreshold,
      answer_source: options.rawModel ? "raw_model_text" : "delivered_answer_text"
    },
    rows
  };
}

function markdown(report) {
  const flagged = report.rows.filter((row) => row.flags.length > 0);
  const rows = flagged.length === 0
    ? "| none | none | 0 | 0 | none |"
    : flagged.map((row) => `| ${row.query_id} | ${row.intent} | ${row.avg_sentence_words} | ${row.repeated_trigrams.map((item) => `${item.phrase} (${item.count})`).join("; ") || "none"} | ${row.flags.join("; ")} |`).join("\n");
  return `# Readability And Mechanicalness Check

Generated: ${report.generated_at}

This check screens for mechanical V3.2 failures: very short/long sentence
patterns, repeated 3-grams, and duplicated hedge text.

## Gate

- Pass: ${report.gate.pass}
- Evaluated answers: ${report.gate.evaluated_answer_count}
- Flagged count: ${report.gate.flagged_count}
- Flagged ratio: ${report.gate.flagged_ratio}
- Flagged ratio threshold: ${report.gate.flagged_ratio_threshold}
- Answer source: ${report.gate.answer_source}

## Flagged Rows

| Query | Intent | Avg Sentence Words | Repeated Trigrams | Flags |
|---|---|---:|---|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = checkReadability(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
  if (options.strict && !report.gate.pass) process.exit(1);
}
