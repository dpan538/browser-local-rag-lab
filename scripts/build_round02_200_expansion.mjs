#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  REQUIRED_FIELDS_BY_INTENT,
  expectedMustNotInventFields
} from "./audit_rules.mjs";
import { splitQueriesToBatches } from "./split_queries_to_batches.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const goldDir = path.join(repoRoot, "fixtures/gold");
const outDir = path.join(repoRoot, "fixtures/expansion/round02_200");
const reportJsonPath = path.join(repoRoot, "reports/round02_200_expansion_summary.json");
const reportMdPath = path.join(repoRoot, "reports/ROUND_02_200_EXPANSION_SUMMARY.md");
const overusedSeedId = "SURF-GAX1970R001";

const targetCounts = {
  archive_orientation: 16,
  casual_archive_help: 16,
  current_object_explanation: 28,
  source_rights_question: 24,
  comparison: 28,
  region_period_recommendation: 24,
  method_process_question: 16,
  more_context: 18,
  first_earliest_claim: 15,
  no_evidence_refusal: 15
};

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function recordHasField(record, field) {
  const readers = {
    record_id: (item) => hasValue(item.record_id),
    title: (item) => hasValue(item.title),
    creator: (item) => hasValue(item.creator),
    date: (item) => hasValue(item.date_text) || hasValue(item.date_start) || hasValue(item.date_end),
    date_text: (item) => hasValue(item.date_text),
    region: (item) => hasValue(item.region),
    source: (item) => hasValue(item.source?.name) || hasValue(item.source?.url),
    rights: (item) => hasValue(item.rights?.state) || hasValue(item.rights?.label),
    image_state: (item) => hasValue(item.image_state?.code),
    reuse_permission: (item) => hasValue(item.rights_interpretation?.reuse_permission),
    public_domain_status: (item) => hasValue(item.rights_interpretation?.public_domain_status),
    topology: (item) => hasValue(item.topology),
    method_context: (item) => hasValue(item.method_context),
    first_or_earliest_claim: (item) => hasValue(item.first_or_earliest_claim)
  };
  return (readers[field] || ((item) => hasValue(item[field])))(record);
}

function evidenceSatisfies(records, fields) {
  if (fields.length === 0) return true;
  return records.some((record) => fields.every((field) => recordHasField(record, field)));
}

function intentCounts(rows) {
  return rows.reduce((acc, row) => {
    acc[row.intent] = (acc[row.intent] || 0) + 1;
    return acc;
  }, {});
}

function chooseLane(intent, refusalExpected) {
  if (refusalExpected) return "refusal_more_context";
  if (intent === "archive_orientation" || intent === "casual_archive_help") return "help";
  if (intent === "current_object_explanation") return "fast_answer";
  if (intent === "source_rights_question") return "source_rights";
  return "research_answer";
}

function labelFor(query, intent, evidenceIds, recordsById, refusalExpected = false) {
  const requiredFields = refusalExpected ? [] : (REQUIRED_FIELDS_BY_INTENT[intent] || []);
  const evidenceRecords = evidenceIds.map((id) => recordsById.get(id)).filter(Boolean);
  const sufficient = !refusalExpected && evidenceSatisfies(evidenceRecords, requiredFields);
  return {
    query_id: query.query_id,
    intent,
    gold_lane: chooseLane(intent, refusalExpected),
    sufficient_context: !refusalExpected && sufficient,
    refusal_expected: refusalExpected,
    gold_evidence_ids: evidenceIds,
    required_fields: requiredFields,
    must_not_invent_fields: expectedMustNotInventFields(intent),
    allowed_guidance: !refusalExpected,
    gold_answer_slots: requiredFields.filter((field) => !["method_context", "topology"].includes(field)),
    review_state: "expansion_candidate_needs_human_review",
    notes: "Round 02 200-query expansion candidate generated from existing fixture records; review before paper claims."
  };
}

function queryRow(queryId, queryText, intent, lane, activeObjectId = null, requiresEvidence = true) {
  return {
    query_id: queryId,
    query_text: queryText,
    intent,
    active_object_id: activeObjectId,
    expected_lane: lane,
    requires_evidence: requiresEvidence
  };
}

function cycle(items) {
  let index = 0;
  return () => {
    const item = items[index % items.length];
    index += 1;
    return item;
  };
}

function pairCycle(items) {
  let index = 0;
  return () => {
    const first = items[index % items.length];
    const second = items[(index + 7) % items.length];
    index += 1;
    return first.record_id === second.record_id ? [first, items[(index + 11) % items.length]] : [first, second];
  };
}

function addExpansionRow(state, intent, queryText, evidenceIds, options = {}) {
  const idNumber = state.nextId;
  state.nextId += 1;
  const queryId = `BQ${String(idNumber).padStart(3, "0")}`;
  const refusalExpected = Boolean(options.refusalExpected);
  const lane = chooseLane(intent, refusalExpected);
  const query = queryRow(queryId, queryText, intent, lane, options.activeObjectId || null, evidenceIds.length > 0);
  state.queries.push(query);
  state.labels.push(labelFor(query, intent, evidenceIds, state.recordsById, refusalExpected));
}

function buildExpansion() {
  const records = readJsonl(path.join(goldDir, "records.jsonl"));
  const baselineQueries = readJsonl(path.join(goldDir, "queries.jsonl"));
  const baselineLabels = readJsonl(path.join(goldDir, "labels.jsonl"));
  const recordsById = new Map(records.map((record) => [record.record_id, record]));
  const methodRecords = records.filter((record) => record.object_type === "method_context" || hasValue(record.method_context));
  const objectRecords = records
    .filter((record) => !methodRecords.includes(record))
    .filter((record) => record.record_id !== overusedSeedId)
    .filter((record) => ["record_id", "title", "date_text", "region", "source", "rights", "image_state", "reuse_permission", "public_domain_status", "topology"].every((field) => recordHasField(record, field)));
  const chronologyRefusalRecords = [];
  const nextObject = cycle(objectRecords);
  const nextPair = pairCycle(objectRecords);
  const nextMethod = cycle(methodRecords);
  const state = {
    nextId: 31,
    queries: [...baselineQueries],
    labels: [...baselineLabels],
    recordsById
  };
  const currentCounts = intentCounts(baselineLabels);

  const need = (intent) => targetCounts[intent] - (currentCounts[intent] || 0);

  for (let index = 0; index < need("archive_orientation"); index += 1) {
    const [a, b] = nextPair();
    addExpansionRow(state, "archive_orientation", `How should I orient myself between ${a.region} and ${b.region} records in this archive?`, [a.record_id, b.record_id], { activeObjectId: null });
  }
  for (let index = 0; index < need("casual_archive_help"); index += 1) {
    const record = nextObject();
    addExpansionRow(state, "casual_archive_help", `I found ${record.record_id}; what is a simple next step?`, [record.record_id], { activeObjectId: record.record_id });
  }
  for (let index = 0; index < need("current_object_explanation"); index += 1) {
    const record = nextObject();
    addExpansionRow(state, "current_object_explanation", `Explain ${record.record_id} using only source-linked evidence.`, [record.record_id], { activeObjectId: record.record_id });
  }
  for (let index = 0; index < need("source_rights_question"); index += 1) {
    const record = nextObject();
    addExpansionRow(state, "source_rights_question", `What source and rights information is attached to ${record.record_id}?`, [record.record_id], { activeObjectId: record.record_id });
  }
  for (let index = 0; index < need("comparison"); index += 1) {
    const [a, b] = nextPair();
    addExpansionRow(state, "comparison", `Compare ${a.record_id} and ${b.record_id} as graphic communication evidence.`, [a.record_id, b.record_id]);
  }
  for (let index = 0; index < need("region_period_recommendation"); index += 1) {
    const [a, b] = nextPair();
    addExpansionRow(state, "region_period_recommendation", `Recommend a research route through ${a.region} and nearby period evidence.`, [a.record_id, b.record_id]);
  }
  for (let index = 0; index < need("method_process_question"); index += 1) {
    const method = nextMethod();
    addExpansionRow(state, "method_process_question", "How should the browser-local RAG lab decide whether to answer or refuse?", [method.record_id]);
  }
  for (let index = 0; index < need("more_context"); index += 1) {
    const [a, b] = nextPair();
    addExpansionRow(state, "more_context", `What related context should I inspect around ${a.record_id}?`, [a.record_id, b.record_id], { activeObjectId: a.record_id });
  }
  for (let index = 0; index < need("first_earliest_claim"); index += 1) {
    addExpansionRow(state, "first_earliest_claim", `Which item is the first or earliest example for invented claim ${index + 1}?`, chronologyRefusalRecords, { refusalExpected: true });
  }
  for (let index = 0; index < need("no_evidence_refusal"); index += 1) {
    addExpansionRow(state, "no_evidence_refusal", `Can you confirm the rights or influence claim for fictional archive object EXP-ABSENT-${index + 1}?`, [], { refusalExpected: true });
  }

  return { records, baselineQueries, baselineLabels, queries: state.queries, labels: state.labels };
}

function validateExpansion({ labels, records }) {
  const recordsById = new Map(records.map((record) => [record.record_id, record]));
  const issues = [];
  for (const label of labels) {
    const recordsForLabel = (label.gold_evidence_ids || []).map((id) => recordsById.get(id)).filter(Boolean);
    if (!label.refusal_expected && !evidenceSatisfies(recordsForLabel, label.required_fields || [])) {
      issues.push({ severity: "fail", query_id: label.query_id, code: "X001_required_fields_not_supported", intent: label.intent });
    }
    for (const id of label.gold_evidence_ids || []) {
      if (!recordsById.has(id)) issues.push({ severity: "fail", query_id: label.query_id, code: "X002_missing_evidence_id", evidence_id: id });
    }
  }
  const counts = {};
  for (const label of labels) {
    for (const id of label.gold_evidence_ids || []) counts[id] = (counts[id] || 0) + 1;
  }
  for (const [id, count] of Object.entries(counts)) {
    if (count / labels.length >= 0.3) issues.push({ severity: "warn", code: "X101_evidence_overuse", evidence_id: id, ratio: count / labels.length });
  }
  return issues;
}

function markdown(summary) {
  const intentRows = Object.entries(summary.intent_distribution)
    .map(([intent, count]) => `| ${intent} | ${count} |`)
    .join("\n");
  const issueRows = summary.issues.length === 0
    ? "| none | none | none |"
    : summary.issues.map((issue) => `| ${issue.severity} | ${issue.code} | ${issue.query_id || issue.evidence_id || "batch"} |`).join("\n");
  return `# Round 02 200-Query Expansion Summary

Generated: ${summary.generated_at}

This expansion creates a candidate 200-query fixture for the research lab. It
does not overwrite the 30-query gold baseline and does not add new evidence
records. Generated model answers remain experiment outputs only.

## Summary

- Total queries: ${summary.query_count}
- Total labels: ${summary.label_count}
- New expansion queries: ${summary.new_query_count}
- Records reused: ${summary.record_count}
- Batches: ${summary.batch_count}
- Validation fail findings: ${summary.fail_count}
- Validation warning findings: ${summary.warn_count}
- Overused seed evidence ${overusedSeedId}: ${summary.overused_seed_count}/${summary.label_count} (${summary.overused_seed_percent}%)

## Intent Distribution

| Intent | Count |
|---|---:|
${intentRows}

## Validation Issues

| Severity | Code | Query/Record |
|---|---|---|
${issueRows}

## Files

- \`fixtures/expansion/round02_200/queries.jsonl\`
- \`fixtures/expansion/round02_200/labels.jsonl\`
- \`fixtures/expansion/round02_200/records.jsonl\`
- \`fixtures/expansion/round02_200/batches.json\`
- \`fixtures/expansion/round02_200/README.md\`
`;
}

function run() {
  const expansion = buildExpansion();
  const issues = validateExpansion(expansion);
  const newQueries = expansion.queries.filter((query) => Number(query.query_id.replace("BQ", "")) >= 31);
  const batches = splitQueriesToBatches(newQueries, {
    batchSize: 50,
    intentDistribution: Object.fromEntries(Object.entries(targetCounts).map(([intent, count]) => [intent, count / 200]))
  });
  fs.mkdirSync(outDir, { recursive: true });
  writeJsonl(path.join(outDir, "queries.jsonl"), expansion.queries);
  writeJsonl(path.join(outDir, "labels.jsonl"), expansion.labels);
  writeJsonl(path.join(outDir, "records.jsonl"), expansion.records);
  fs.writeFileSync(path.join(outDir, "batches.json"), JSON.stringify({ generated_at: new Date().toISOString(), batches }, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "README.md"), `# Round 02 200-Query Expansion Fixture

This is a research-only candidate expansion fixture. It preserves the 30-query
gold baseline and appends BQ031-BQ200 as expansion candidates.

The new rows use existing fixture evidence only. They require review before
paper claims and must not be treated as product Assistant data.
`);
  const seedCount = expansion.labels.filter((label) => (label.gold_evidence_ids || []).includes(overusedSeedId)).length;
  const summary = {
    generated_at: new Date().toISOString(),
    query_count: expansion.queries.length,
    label_count: expansion.labels.length,
    new_query_count: newQueries.length,
    record_count: expansion.records.length,
    batch_count: batches.length,
    intent_distribution: intentCounts(expansion.labels),
    overused_seed_id: overusedSeedId,
    overused_seed_count: seedCount,
    overused_seed_percent: Number(((seedCount / expansion.labels.length) * 100).toFixed(1)),
    fail_count: issues.filter((issue) => issue.severity === "fail").length,
    warn_count: issues.filter((issue) => issue.severity === "warn").length,
    issues
  };
  fs.writeFileSync(reportJsonPath, JSON.stringify(summary, null, 2) + "\n");
  fs.writeFileSync(reportMdPath, markdown(summary));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, reportMdPath),
    query_count: summary.query_count,
    new_query_count: summary.new_query_count,
    batch_count: summary.batch_count,
    fail_count: summary.fail_count,
    warn_count: summary.warn_count,
    overused_seed_percent: summary.overused_seed_percent
  }, null, 2));
  if (summary.fail_count > 0) process.exitCode = 1;
}

run();
