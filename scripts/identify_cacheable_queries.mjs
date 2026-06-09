#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency_pilot50_v31_evidence_prune_tag_injection_answers.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  jsonOutPath: null,
  mdOutPath: null
};

function parseArgs(args) {
  const parsed = { ...defaults };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else positional.push(arg);
  }
  if (positional[0]) parsed.answersPath = path.resolve(positional[0]);
  if (positional[1]) parsed.labelsPath = path.resolve(positional[1]);
  if (positional[2]) parsed.queriesPath = path.resolve(positional[2]);
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
    .trim()
    .replace(/\s+/g, " ");
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenSet(text) {
  return new Set(normalize(text).split(/\s+/).filter((token) => token.length > 2));
}

function jaccard(left, right) {
  if (left.size === 0) return right.size === 0 ? 1 : 0;
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function findCacheableQueries({ answersPath, labelsPath, queriesPath }) {
  const answers = readJsonl(answersPath);
  const labelsById = new Map(readJsonl(labelsPath).map((label) => [idOf(label), label]));
  const queriesById = fs.existsSync(queriesPath)
    ? new Map(readJsonl(queriesPath).map((query) => [idOf(query), query]))
    : new Map();

  const groups = new Map();
  for (const answer of answers) {
    const queryId = idOf(answer);
    const label = labelsById.get(queryId);
    if (!label || label.refusal_expected) continue;
    if (answer.deterministic === true || answer.latency_bucket === "hybrid_system_latency") continue;
    const evidenceKey = JSON.stringify([...(label.gold_evidence_ids || [])].sort());
    if (!groups.has(evidenceKey)) groups.set(evidenceKey, []);
    const query = queriesById.get(queryId);
    groups.get(evidenceKey).push({
      query_id: queryId,
      intent: label.intent,
      query_text: query?.query_text || query?.text || "",
      answer_body: stripModelNoise(answer.raw_answer_text || answer.answer_text || answer.generated_text || "")
    });
  }

  const candidates = [];
  for (const [evidenceKey, rows] of groups.entries()) {
    if (rows.length < 2) continue;
    const bodies = rows.map((row) => row.answer_body);
    const uniqueBodies = [...new Set(bodies)];
    const querySimilarities = [];
    for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
        querySimilarities.push(jaccard(tokenSet(rows[leftIndex].query_text), tokenSet(rows[rightIndex].query_text)));
      }
    }
    const avgQuerySimilarity = querySimilarities.length
      ? querySimilarities.reduce((sum, value) => sum + value, 0) / querySimilarities.length
      : 0;
    candidates.push({
      evidence_ids: JSON.parse(evidenceKey),
      query_count: rows.length,
      intents: [...new Set(rows.map((row) => row.intent))],
      identical_answer_bodies: uniqueBodies.length === 1,
      unique_answer_body_count: uniqueBodies.length,
      avg_query_similarity: Number(avgQuerySimilarity.toFixed(4)),
      cacheability: uniqueBodies.length === 1 ? "exact_answer_cache_candidate" : avgQuerySimilarity >= 0.5 ? "template_cache_review_candidate" : "not_obvious",
      query_ids: rows.map((row) => row.query_id),
      answer_preview: uniqueBodies[0]?.slice(0, 180) || ""
    });
  }

  const useful = candidates.filter((candidate) => candidate.cacheability !== "not_obvious");
  return {
    generated_at: new Date().toISOString(),
    inputs: {
      answersPath: path.relative(repoRoot, answersPath),
      labelsPath: path.relative(repoRoot, labelsPath),
      queriesPath: path.relative(repoRoot, queriesPath)
    },
    group_count: groups.size,
    repeated_evidence_group_count: candidates.length,
    cacheable_candidate_count: useful.length,
    candidates: candidates.sort((left, right) => {
      if (left.cacheability === right.cacheability) return right.query_count - left.query_count;
      return left.cacheability.localeCompare(right.cacheability);
    })
  };
}

function markdown(report) {
  const rows = report.candidates.length === 0
    ? "| none | 0 | none | none |"
    : report.candidates.map((candidate) => `| ${candidate.evidence_ids.join(" + ")} | ${candidate.query_count} | ${candidate.cacheability} | ${candidate.query_ids.join(", ")} |`).join("\n");
  return `# V3.1 Cacheable Query Probe

Generated: ${report.generated_at}

This probe looks only at non-deterministic Qwen rows. It groups answers by
\`gold_evidence_ids\` to identify whether any remaining model-generation lanes
could later be handled by exact answer caching or template caching.

## Summary

- Evidence groups: ${report.group_count}
- Repeated evidence groups: ${report.repeated_evidence_group_count}
- Cacheable candidates: ${report.cacheable_candidate_count}

## Groups

| Evidence IDs | Query Count | Cacheability | Queries |
|---|---:|---|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = findCacheableQueries(options);
  if (options.jsonOutPath) fs.writeFileSync(options.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  if (options.mdOutPath) fs.writeFileSync(options.mdOutPath, markdown(report));
  if (!options.jsonOutPath && !options.mdOutPath) console.log(JSON.stringify(report, null, 2));
}

export { findCacheableQueries };
