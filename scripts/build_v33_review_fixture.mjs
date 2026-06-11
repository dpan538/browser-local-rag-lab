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
  roundJsonPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v33_postprocessed_prose.json"),
  hallucinationPath: path.join(repoRoot, "reports/hallucination_v33_300.json"),
  usabilityPath: path.join(repoRoot, "reports/quality_usability_v33_300.json"),
  factsPath: path.join(repoRoot, "reports/facts_coverage_v33_300.json"),
  misreadingPath: path.join(repoRoot, "reports/misreading_v33_300.json"),
  readabilityPath: path.join(repoRoot, "reports/readability_v33_300.json"),
  sampleSize: 80,
  jsonOutPath: path.join(repoRoot, "reports/review_fixture_v33_300_stratified.json"),
  mdOutPath: path.join(repoRoot, "reports/QUALITY_REVIEW_PROTOCOL_V33.md")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--round-json") parsed.roundJsonPath = path.resolve(args[++index]);
    else if (arg === "--sample-size") parsed.sampleSize = Number(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function answerBody(answerText) {
  return String(answerText || "").replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "").trim();
}

function stringifyValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function fieldValues(records, fields) {
  const values = {};
  for (const field of fields || []) {
    values[field] = [...new Set(records.map((record) => stringifyValue(record?.[field])).filter(Boolean))];
  }
  return values;
}

function flagMapFromQuality(options) {
  const flags = new Map();
  const add = (queryId, flag) => {
    if (!queryId) return;
    if (!flags.has(queryId)) flags.set(queryId, []);
    flags.get(queryId).push(flag);
  };
  const hallucination = readJson(options.hallucinationPath, {});
  for (const finding of hallucination.findings || []) {
    if (finding.unsupported_dates?.length) add(finding.query_id, "unsupported_date_screen");
    if (finding.unsupported_entities?.length) add(finding.query_id, "unsupported_entity_screen");
    if (finding.unsupported_triples?.length) add(finding.query_id, "unsupported_triple_screen");
  }
  const usability = readJson(options.usabilityPath, {});
  for (const row of usability.rows || []) {
    if (row.too_short) add(row.query_id, "too_short_screen");
    if (row.off_topic) add(row.query_id, "off_topic_screen");
  }
  const facts = readJson(options.factsPath, {});
  const lowFacts = [...(facts.rows || [])].sort((a, b) => (a.coverage_ratio || 0) - (b.coverage_ratio || 0)).slice(0, 12);
  for (const row of lowFacts) add(row.query_id, "low_facts_coverage_tail");
  const misreading = readJson(options.misreadingPath, {});
  for (const finding of misreading.findings || []) add(finding.query_id, "misreading_screen");
  const readability = readJson(options.readabilityPath, {});
  for (const row of readability.rows || []) {
    if (row.flags?.length) add(row.query_id, "readability_screen");
  }
  const round = readJson(options.roundJsonPath, { results: [] });
  const latencyTail = [...(round.results || [])]
    .filter((row) => row.generation_status === "completed" && row.deterministic !== true)
    .sort((a, b) => (b.total_latency_ms || 0) - (a.total_latency_ms || 0))
    .slice(0, 12);
  for (const row of latencyTail) add(row.query_id, "latency_tail");
  return flags;
}

function selectRows(labels, sampleSize, flags) {
  const selectedIds = new Set();
  const selected = [];
  const labelById = new Map(labels.map((label) => [rowId(label), label]));
  for (const queryId of [...flags.keys()].sort()) {
    const label = labelById.get(queryId);
    if (label && !selectedIds.has(queryId)) {
      selectedIds.add(queryId);
      selected.push(label);
    }
  }
  const byIntent = new Map();
  for (const label of labels) {
    if (selectedIds.has(rowId(label))) continue;
    if (!byIntent.has(label.intent)) byIntent.set(label.intent, []);
    byIntent.get(label.intent).push(label);
  }
  for (const rows of byIntent.values()) rows.sort((a, b) => deterministicHash(rowId(a)) - deterministicHash(rowId(b)));
  const intents = [...byIntent.keys()].sort();
  for (const intent of intents) {
    if (selected.length >= sampleSize) break;
    const row = byIntent.get(intent).shift();
    if (row) {
      selectedIds.add(rowId(row));
      selected.push(row);
    }
  }
  let cursor = 0;
  while (selected.length < sampleSize && intents.some((intent) => byIntent.get(intent)?.length)) {
    const intent = intents[cursor % intents.length];
    const row = byIntent.get(intent)?.shift();
    if (row) {
      selectedIds.add(rowId(row));
      selected.push(row);
    }
    cursor += 1;
  }
  return selected.slice(0, sampleSize);
}

function buildFixture(options) {
  const queries = readJsonl(options.queriesPath);
  const labels = readJsonl(options.labelsPath);
  const records = readJsonl(options.recordsPath);
  const answers = readJsonl(options.answersPath);
  const round = readJson(options.roundJsonPath, { results: [] });
  const flags = flagMapFromQuality(options);
  const queryById = new Map(queries.map((query) => [rowId(query), query]));
  const recordById = new Map(records.map((record) => [record.record_id || record.id, record]));
  const answerById = new Map(answers.map((answer) => [rowId(answer), answer]));
  const runtimeById = new Map((round.results || []).map((row) => [row.query_id, row]));
  const selected = selectRows(labels, options.sampleSize, flags);
  const rows = selected.map((label, index) => {
    const id = rowId(label);
    const query = queryById.get(id) || {};
    const answer = answerById.get(id) || {};
    const runtime = runtimeById.get(id) || {};
    const evidence = (label.gold_evidence_ids || []).map((evidenceId) => recordById.get(evidenceId)).filter(Boolean);
    return {
      review_id: `V33-HR-${String(index + 1).padStart(3, "0")}`,
      query_id: id,
      query_text: query.query_text || query.text || "",
      intent: label.intent,
      lane: label.gold_lane,
      refusal_expected: label.refusal_expected === true,
      deterministic: answer.deterministic === true || runtime.deterministic === true,
      automated_flags: flags.get(id) || [],
      latency_ms: runtime.total_latency_ms ?? answer.total_latency_ms ?? null,
      generated_answer: answer.answer_text || "",
      answer_body: answerBody(answer.answer_text),
      raw_answer_text: runtime.raw_answer_text || answer.raw_answer_text || "",
      model_answer_text: runtime.model_answer_text || "",
      postprocess_actions: runtime.postprocess_actions || [],
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
    condition_id: "v3.3_contract_top3_300_delivered",
    sample_size: rows.length,
    sample_strategy: "flag-first deterministic stratified sample: includes automated quality flags, latency tail, low facts-coverage tail, then fills by intent",
    editable_fields: ["reviewer_decision", "reviewer_faithfulness", "reviewer_usability", "reviewer_notes", "adjudication_state"],
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
  const flagCounts = payload.rows.flatMap((row) => row.automated_flags).reduce((acc, flag) => {
    acc[flag] = (acc[flag] || 0) + 1;
    return acc;
  }, {});
  const intentRows = Object.entries(intentCounts).sort().map(([intent, count]) => `| ${intent} | ${count} |`).join("\n");
  const flagRows = Object.entries(flagCounts).sort().map(([flag, count]) => `| ${flag} | ${count} |`).join("\n") || "| none | 0 |";
  return `# V3.3 Human Review Protocol

Generated: ${payload.generated_at}

This fixture supports human semantic review for
\`${payload.condition_id}\`. It samples final delivered answers, preserves raw
model text where available, and marks automated quality flags so reviewers can
focus on the rows most likely to need judgment.

## Sample

- Sample size: ${payload.sample_size}
- Strategy: ${payload.sample_strategy}

| Intent | Sampled rows |
|---|---:|
${intentRows}

## Included Automated Flags

| Flag | Rows |
|---|---:|
${flagRows}

## Reviewer Fields

Reviewers should only edit:

- \`reviewer_decision\`: \`accept\`, \`reject\`, or \`needs_adjudication\`
- \`reviewer_faithfulness\`: \`faithful\`, \`minor_issue\`, or \`unfaithful\`
- \`reviewer_usability\`: \`usable\`, \`partial\`, or \`unusable\`
- \`reviewer_notes\`: short free-text explanation
- \`adjudication_state\`: \`unreviewed\`, \`reviewed\`, or \`adjudicated\`

## Rubric

Accept an answer only if:

1. It answers the query or refuses when refusal is expected.
2. Its factual claims are supported by the listed evidence values.
3. It does not introduce unsupported dates, regions, rights states, creators,
   first/earliest claims, or source assertions.
4. It is usable archive-facing prose, not merely a field dump.
5. It does not treat generated text as archive evidence.

Mark \`needs_adjudication\` when the answer is contract-valid but semantically
ambiguous, too terse, or dependent on domain judgment.

## Paper Use

This fixture is a review input, not a completed human evaluation. Paper claims
should distinguish automated gate results from human-review outcomes until the
editable fields are filled and summarized.
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const payload = buildFixture(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify({
    rows: payload.rows.length,
    json: path.relative(repoRoot, defaults.jsonOutPath),
    md: path.relative(repoRoot, defaults.mdOutPath)
  }, null, 2));
}
