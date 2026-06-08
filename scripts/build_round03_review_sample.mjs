#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateGenerationContract } from "./validate_generation_contract.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

const defaults = {
  queriesPath: path.join(repoRoot, "fixtures/expansion/round02_200/queries.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round02_200/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round02_200/records.jsonl"),
  answersPath: path.join(repoRoot, "reports/webllm_round_02_200_gold_only_iab_full200_answers.jsonl"),
  performanceJsonPath: path.join(repoRoot, "reports/performance_stratification_round_02_200_gold_only_iab_full200.json"),
  sampleOutPath: path.join(repoRoot, "reports/review_fixture_round_03_quality_sample.jsonl"),
  summaryJsonPath: path.join(repoRoot, "reports/review_fixture_round_03_quality_sample_summary.json"),
  protocolMdPath: path.join(repoRoot, "reports/QUALITY_REVIEW_PROTOCOL_ROUND_03.md"),
  summaryMdPath: path.join(repoRoot, "reports/QUALITY_REVIEW_SUMMARY_ROUND_03.md"),
  targetCount: 50
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--performance-json") parsed.performanceJsonPath = path.resolve(args[++index]);
    else if (arg === "--sample-out") parsed.sampleOutPath = path.resolve(args[++index]);
    else if (arg === "--summary-json") parsed.summaryJsonPath = path.resolve(args[++index]);
    else if (arg === "--protocol-md") parsed.protocolMdPath = path.resolve(args[++index]);
    else if (arg === "--summary-md") parsed.summaryMdPath = path.resolve(args[++index]);
    else if (arg === "--target-count") parsed.targetCount = Number(args[++index]);
  }
  return parsed;
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function fieldValues(record, field) {
  const valuesByField = {
    record_id: [record.record_id],
    title: [record.title],
    creator: [record.creator],
    date: [record.date_text, record.date_start, record.date_end],
    date_text: [record.date_text],
    region: [record.region],
    source: [record.source?.name, record.source?.url],
    rights: [record.rights?.state, record.rights?.label],
    image_state: [record.image_state?.code, record.image_state?.display_mode],
    reuse_permission: [record.rights_interpretation?.reuse_permission],
    public_domain_status: [record.rights_interpretation?.public_domain_status],
    first_or_earliest_claim: [record.first_or_earliest_claim],
    topology: [
      record.topology?.surface_type,
      record.topology?.publication_role,
      ...(record.topology?.folder_titles || [])
    ],
    method_context: Object.values(record.method_context || {})
  };
  return (valuesByField[field] || [record[field]])
    .flat()
    .filter(hasValue)
    .map((value) => String(value));
}

function groupedFindings(contract) {
  return contract.violations.reduce((acc, item) => {
    acc[item.query_id] ||= [];
    acc[item.query_id].push(item);
    return acc;
  }, {});
}

function selectionReason(label, perfRow, rankBySlow) {
  if (label.intent === "first_earliest_claim") return "all_first_earliest_claim";
  if (label.intent === "no_evidence_refusal") return "all_no_evidence_refusal";
  if (rankBySlow.has(label.query_id)) return "latency_tail_sample";
  if (label.intent === "comparison") return "comparison_sample";
  if (label.intent === "region_period_recommendation") return "region_period_sample";
  if (label.intent === "more_context") return "more_context_sample";
  return "coverage_sample";
}

function sortCandidate(a, b, perfById) {
  const priority = {
    first_earliest_claim: 1,
    no_evidence_refusal: 1,
    comparison: 2,
    region_period_recommendation: 2,
    more_context: 2,
    source_rights_question: 3,
    current_object_explanation: 4,
    method_process_question: 5,
    archive_orientation: 6,
    casual_archive_help: 6
  };
  return (priority[a.intent] || 9) - (priority[b.intent] || 9) ||
    ((perfById.get(b.query_id)?.total_latency_ms || 0) - (perfById.get(a.query_id)?.total_latency_ms || 0)) ||
    a.query_id.localeCompare(b.query_id);
}

function selectSample(labels, perfById, targetCount) {
  const selected = new Map();
  const slowIds = new Set([...perfById.values()]
    .sort((a, b) => b.total_latency_ms - a.total_latency_ms)
    .slice(0, 10)
    .map((row) => row.query_id));

  const addWhere = (predicate, limit = Infinity) => {
    let count = 0;
    for (const label of labels.filter(predicate).sort((a, b) => sortCandidate(a, b, perfById))) {
      if (selected.size >= targetCount || count >= limit) break;
      if (!selected.has(label.query_id)) {
        selected.set(label.query_id, label);
        count += 1;
      }
    }
  };

  addWhere((label) => label.intent === "first_earliest_claim");
  addWhere((label) => label.intent === "no_evidence_refusal");
  addWhere((label) => slowIds.has(label.query_id), 8);
  addWhere((label) => label.intent === "comparison", 6);
  addWhere((label) => label.intent === "region_period_recommendation", 6);
  addWhere((label) => label.intent === "more_context", 5);
  addWhere(() => true);

  return {
    labels: [...selected.values()].slice(0, targetCount),
    slowIds
  };
}

export function buildRound03ReviewSample({
  queriesPath = defaults.queriesPath,
  labelsPath = defaults.labelsPath,
  recordsPath = defaults.recordsPath,
  answersPath = defaults.answersPath,
  performanceJsonPath = defaults.performanceJsonPath,
  targetCount = defaults.targetCount
} = {}) {
  const queries = new Map(readJsonl(queriesPath).map((query) => [query.query_id, query]));
  const labels = readJsonl(labelsPath);
  const records = new Map(readJsonl(recordsPath).map((record) => [record.record_id, record]));
  const answers = new Map(readJsonl(answersPath).map((answer) => [answer.query_id || answer.id, answer]));
  const performance = readJson(performanceJsonPath);
  const perfById = new Map((performance.rows || []).map((row) => [row.query_id, row]));
  const contract = validateGenerationContract({ queriesPath, labelsPath, recordsPath, answersPath });
  const findingsByQuery = groupedFindings(contract);
  const selection = selectSample(labels, perfById, targetCount);

  const rows = selection.labels.map((label) => {
    const query = queries.get(label.query_id);
    const answer = answers.get(label.query_id);
    const perf = perfById.get(label.query_id);
    const evidenceRecords = (label.gold_evidence_ids || []).map((id) => records.get(id)).filter(Boolean);
    const evidenceValues = Object.fromEntries((label.required_fields || []).map((field) => [
      field,
      [...new Set(evidenceRecords.flatMap((record) => fieldValues(record, field)))]
    ]));
    return {
      query_id: label.query_id,
      query_text: query?.query_text || "",
      intent: label.intent,
      lane: label.gold_lane,
      refusal_expected: label.refusal_expected,
      selection_reason: selectionReason(label, perf, selection.slowIds),
      required_fields: label.required_fields || [],
      must_not_invent_fields: label.must_not_invent_fields || [],
      evidence_ids: label.gold_evidence_ids || [],
      evidence_values: evidenceValues,
      generated_answer: answer?.answer_text || "",
      runtime_metrics: {
        prompt_tokens_est: answer?.prompt_tokens_est ?? perf?.prompt_tokens_est ?? null,
        ttft_ms: answer?.ttft_ms ?? perf?.ttft_ms ?? null,
        total_latency_ms: answer?.total_latency_ms ?? perf?.total_latency_ms ?? null,
        tokens_per_second: answer?.tokens_per_second ?? perf?.tokens_per_second ?? null
      },
      contract_findings: findingsByQuery[label.query_id] || [],
      reviewer_scores: {
        faithfulness: null,
        no_invented_title_date_source_rights: null,
        refusal_correctness: null,
        useful_research_guidance: null,
        not_merely_repeating_search: null,
        lane_appropriateness: null
      },
      reviewer_decision: "pending",
      reviewer_notes: ""
    };
  });

  const byReason = rows.reduce((acc, row) => {
    acc[row.selection_reason] = (acc[row.selection_reason] || 0) + 1;
    return acc;
  }, {});
  const byIntent = rows.reduce((acc, row) => {
    acc[row.intent] = (acc[row.intent] || 0) + 1;
    return acc;
  }, {});

  return {
    _provenance: {
      step: "build_round03_review_sample",
      timestamp: new Date().toISOString(),
      answers_path: path.relative(repoRoot, answersPath),
      performance_json_path: path.relative(repoRoot, performanceJsonPath),
      research_only: true
    },
    target_count: targetCount,
    sample_count: rows.length,
    by_reason: byReason,
    by_intent: byIntent,
    rows
  };
}

function protocolMarkdown(summary, sampleOutPath) {
  return `# Quality Review Protocol Round 03

Generated: ${summary._provenance.timestamp}

Fixture: ${path.relative(repoRoot, sampleOutPath)}

This protocol reviews generated experiment outputs only. It does not convert AI
answers into archive evidence.

## Sample Scope

- Target rows: ${summary.target_count}
- Sample rows: ${summary.sample_count}
- Source answers: ${summary._provenance.answers_path}

## Reviewer Scores

Use 0, 1, or 2 for each score:

- 0 = fails the criterion
- 1 = acceptable with notes
- 2 = clearly satisfies the criterion

Score fields:

- faithfulness
- no_invented_title_date_source_rights
- refusal_correctness
- useful_research_guidance
- not_merely_repeating_search
- lane_appropriateness

## Hard Rules

- If refusal_expected is true and the answer provides unsupported facts, reject.
- If an answer invents title, date, source, rights, reuse permission, or public
  domain status, reject.
- If the answer is contract-compliant but not useful, use accept_with_notes or
  needs_regeneration rather than changing the label.

## Allowed Decisions

- accept
- accept_with_notes
- reject
- needs_regeneration
- pending
`;
}

function summaryMarkdown(summary, sampleOutPath) {
  const reasonRows = Object.entries(summary.by_reason).map(([reason, count]) => `| ${reason} | ${count} |`).join("\n") || "| none | 0 |";
  const intentRows = Object.entries(summary.by_intent).map(([intent, count]) => `| ${intent} | ${count} |`).join("\n") || "| none | 0 |";
  return `# Quality Review Summary Round 03

Generated: ${summary._provenance.timestamp}

Fixture: ${path.relative(repoRoot, sampleOutPath)}

## Summary

- Sample rows: ${summary.sample_count}
- Reviewer decision state: pending

## By Selection Reason

| Reason | Count |
|---|---:|
${reasonRows}

## By Intent

| Intent | Count |
|---|---:|
${intentRows}

## Next Step

Fill reviewer_scores, reviewer_decision, and reviewer_notes in the fixture.
After review, summarize accepted, accepted_with_notes, rejected, and
needs_regeneration rows before making semantic quality claims.
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const summary = buildRound03ReviewSample(args);
  writeJsonl(args.sampleOutPath, summary.rows);
  fs.writeFileSync(args.summaryJsonPath, JSON.stringify(summary, null, 2) + "\n");
  fs.writeFileSync(args.protocolMdPath, protocolMarkdown(summary, args.sampleOutPath));
  fs.writeFileSync(args.summaryMdPath, summaryMarkdown(summary, args.sampleOutPath));
  console.log(JSON.stringify({
    fixture: path.relative(repoRoot, args.sampleOutPath),
    summary_json: path.relative(repoRoot, args.summaryJsonPath),
    protocol: path.relative(repoRoot, args.protocolMdPath),
    summary: path.relative(repoRoot, args.summaryMdPath),
    rows: summary.sample_count
  }, null, 2));
}
