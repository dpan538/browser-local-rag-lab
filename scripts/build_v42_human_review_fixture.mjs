#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v33_postprocessed_prose_answers.jsonl"),
  sampleSize: 50,
  jsonOutPath: path.join(repoRoot, "reports/v42_human_review_fixture.json"),
  mdOutPath: path.join(repoRoot, "reports/V42_HUMAN_REVIEW_RUBRIC.md")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--sample-size") parsed.sampleSize = Number(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function rowId(row) {
  return row.query_id || row.id;
}

function deterministicHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function groupedSample(labels, sampleSize) {
  const byIntent = new Map();
  for (const label of labels) {
    if (!byIntent.has(label.intent)) byIntent.set(label.intent, []);
    byIntent.get(label.intent).push(label);
  }
  for (const rows of byIntent.values()) {
    rows.sort((a, b) => deterministicHash(rowId(a)) - deterministicHash(rowId(b)));
  }
  const intents = [...byIntent.keys()].sort();
  const selected = [];
  for (const intent of intents) {
    const row = byIntent.get(intent).shift();
    if (row) selected.push(row);
  }
  let cursor = 0;
  while (selected.length < sampleSize && intents.some((intent) => byIntent.get(intent)?.length)) {
    const intent = intents[cursor % intents.length];
    const row = byIntent.get(intent)?.shift();
    if (row) selected.push(row);
    cursor += 1;
  }
  return selected.slice(0, sampleSize);
}

function fieldValues(records, fields) {
  const values = {};
  for (const field of fields || []) {
    values[field] = [...new Set(records.map((record) => record?.[field]).filter((value) => value !== undefined && value !== null).map(String))];
  }
  return values;
}

function answerBody(answerText) {
  return String(answerText || "").replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "").trim();
}

function buildFixture(options) {
  const queries = readJsonl(options.queriesPath);
  const labels = readJsonl(options.labelsPath);
  const records = readJsonl(options.recordsPath);
  const answers = readJsonl(options.answersPath);
  const queryById = new Map(queries.map((query) => [rowId(query), query]));
  const recordById = new Map(records.map((record) => [record.record_id || record.id, record]));
  const answerById = new Map(answers.map((answer) => [rowId(answer), answer]));
  const selected = groupedSample(labels, options.sampleSize);
  const rows = selected.map((label, index) => {
    const query = queryById.get(rowId(label)) || {};
    const answer = answerById.get(rowId(label)) || {};
    const evidence = (label.gold_evidence_ids || []).map((id) => recordById.get(id)).filter(Boolean);
    return {
      review_id: `HR-${String(index + 1).padStart(3, "0")}`,
      query_id: rowId(label),
      query_text: query.query_text || query.text || "",
      intent: label.intent,
      lane: label.gold_lane,
      refusal_expected: label.refusal_expected === true,
      deterministic: answer.deterministic === true,
      generated_answer: answer.answer_text || "",
      answer_body: answerBody(answer.answer_text),
      required_fields: label.required_fields || [],
      evidence_values: fieldValues(evidence, label.required_fields || []),
      gold_evidence_ids: label.gold_evidence_ids || [],
      reviewer_decision: "pending",
      reviewer_faithfulness: "pending",
      reviewer_usability: "pending",
      reviewer_notes: "",
      adjudication_state: "unreviewed"
    };
  });
  const payload = {
    generated_at: new Date().toISOString(),
    sample_size: rows.length,
    sample_strategy: "deterministic stratified sample by intent, with at least one row per intent when available",
    rubric_version: "v42_human_review_rubric_v1",
    rows
  };
  fs.writeFileSync(options.jsonOutPath, `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, markdown(payload));
  return payload;
}

function markdown(payload) {
  const intentCounts = payload.rows.reduce((acc, row) => {
    acc[row.intent] = (acc[row.intent] || 0) + 1;
    return acc;
  }, {});
  const counts = Object.entries(intentCounts).sort().map(([intent, count]) => `| ${intent} | ${count} |`).join("\n");
  return `# V4.2 Human Review Rubric

Generated: ${payload.generated_at}

This fixture supports a lightweight human review of the final V3.3 300-query
answer set. It does not change labels, evidence, or generated answers.

## Sample

- Sample size: ${payload.sample_size}
- Strategy: ${payload.sample_strategy}

| Intent | Sampled rows |
|---|---:|
${counts}

## Reviewer Fields

Reviewers should only edit:

- \`reviewer_decision\`: \`accept\`, \`reject\`, or \`needs_adjudication\`
- \`reviewer_faithfulness\`: \`faithful\`, \`minor_issue\`, or \`unfaithful\`
- \`reviewer_usability\`: \`usable\`, \`partial\`, or \`unusable\`
- \`reviewer_notes\`: short free-text explanation

## Rubric

Accept an answer only if:

1. It answers the query or refuses when refusal is expected.
2. Its factual claims are supported by the listed evidence values.
3. It does not introduce unsupported dates, regions, rights states, creators,
   first/earliest claims, or source assertions.
4. It is usable as archive-facing prose, not merely a field dump.

Mark \`needs_adjudication\` when the answer is contract-valid but semantically
ambiguous, too vague, or dependent on domain judgment.

## Inter-Rater Plan

For a paper-ready review, two reviewers should independently fill the fixture.
Agreement can be reported as percent agreement and, if both reviewers use the
same categorical labels, Cohen's kappa.
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const payload = buildFixture(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify({
    rows: payload.rows.length,
    json: path.relative(repoRoot, defaults.jsonOutPath),
    md: path.relative(repoRoot, defaults.mdOutPath)
  }, null, 2));
}

