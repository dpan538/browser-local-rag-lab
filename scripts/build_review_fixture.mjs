#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateGenerationContract } from "./validate_generation_contract.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultQueriesPath = path.join(repoRoot, "fixtures/gold/queries.jsonl");
const defaultLabelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const defaultRecordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const defaultAnswersPath = path.join(repoRoot, "reports/webllm_round_02_answers.jsonl");
const defaultReviewSheetPath = path.join(repoRoot, "reports/quality_review_sheet_round_02.json");
const defaultOutPath = path.join(repoRoot, "reports/review_fixture_round_02.jsonl");
const defaultMdPath = path.join(repoRoot, "reports/REVIEW_FIXTURE_ROUND_02.md");

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

function parseArgs(args) {
  const parsed = {
    queriesPath: defaultQueriesPath,
    labelsPath: defaultLabelsPath,
    recordsPath: defaultRecordsPath,
    answersPath: defaultAnswersPath,
    reviewSheetPath: defaultReviewSheetPath,
    outPath: defaultOutPath,
    mdPath: defaultMdPath
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--out") parsed.outPath = path.resolve(args[++index]);
    else if (arg === "--review-sheet") parsed.reviewSheetPath = path.resolve(args[++index]);
  }
  return parsed;
}

export function buildReviewFixture({
  queriesPath = defaultQueriesPath,
  labelsPath = defaultLabelsPath,
  recordsPath = defaultRecordsPath,
  answersPath = defaultAnswersPath,
  reviewSheetPath = defaultReviewSheetPath
} = {}) {
  const queries = new Map(readJsonl(queriesPath).map((query) => [query.query_id, query]));
  const labels = new Map(readJsonl(labelsPath).map((label) => [label.query_id, label]));
  const records = new Map(readJsonl(recordsPath).map((record) => [record.record_id, record]));
  const answers = readJsonl(answersPath);
  const reviewSheet = fs.existsSync(reviewSheetPath)
    ? new Map((readJson(reviewSheetPath).rows || []).map((row) => [row.query_id, row]))
    : new Map();
  const contract = validateGenerationContract({ queriesPath, labelsPath, recordsPath, answersPath });
  const findingsByQuery = groupedFindings(contract);

  return answers.map((answer) => {
    const queryId = answer.query_id || answer.id;
    const label = labels.get(queryId);
    const query = queries.get(queryId);
    const evidenceRecords = (label?.gold_evidence_ids || []).map((id) => records.get(id)).filter(Boolean);
    const sheetRow = reviewSheet.get(queryId);
    const fieldVisibility = Object.fromEntries(
      (sheetRow?.field_statuses || []).map((item) => [item.field, item.status])
    );
    const evidenceValues = Object.fromEntries(
      (label?.required_fields || []).map((field) => [
        field,
        [...new Set(evidenceRecords.flatMap((record) => fieldValues(record, field)))]
      ])
    );
    const contractFindings = findingsByQuery[queryId] || [];
    return {
      query_id: queryId,
      query_text: query?.query_text || "",
      intent: label?.intent || answer.intent || "unknown",
      lane: label?.gold_lane || answer.lane || "unknown",
      refusal_expected: label?.refusal_expected ?? null,
      required_fields: label?.required_fields || [],
      must_not_invent_fields: label?.must_not_invent_fields || [],
      evidence_ids: label?.gold_evidence_ids || [],
      evidence_values: evidenceValues,
      field_visibility: fieldVisibility,
      all_required_fields_visible: sheetRow?.all_required_fields_visible ?? false,
      priority: sheetRow?.priority || "unknown",
      suggested_review_decision: sheetRow?.suggested_review_decision || "unknown",
      hard_fail: contractFindings.some((finding) => finding.severity === "fail"),
      contract_findings: contractFindings,
      generated_answer: answer.answer_text || "",
      locked_source_answer_row: {
        producer: answer.producer,
        variant_id: answer.variant_id,
        generation_status: answer.generation_status,
        prompt_tokens_est: answer.prompt_tokens_est,
        ttft_ms: answer.ttft_ms,
        total_latency_ms: answer.total_latency_ms,
        tokens_per_second: answer.tokens_per_second
      },
      reviewer_decision: "pending",
      reviewer_notes: ""
    };
  });
}

function markdown(rows, outPath) {
  const counts = rows.reduce((acc, row) => {
    acc[row.priority] = (acc[row.priority] || 0) + 1;
    acc[row.suggested_review_decision] = (acc[row.suggested_review_decision] || 0) + 1;
    if (row.hard_fail) acc.hard_fail = (acc.hard_fail || 0) + 1;
    return acc;
  }, {});
  return `# Review Fixture Round 02

Generated: ${new Date().toISOString()}

Fixture: ${path.relative(repoRoot, outPath)}

This fixture is the editable review artifact. Reviewers should edit only
\`reviewer_decision\` and \`reviewer_notes\`; all evidence, answer, and contract
fields are generated context.

## Summary

- Rows: ${rows.length}
- Hard-fail rows: ${counts.hard_fail || 0}
- High-priority rows: ${counts.high || 0}
- Low-priority rows: ${counts.low || 0}
- Reviewed candidates: ${counts.reviewed_candidate || 0}
- Field-visibility review rows: ${counts.needs_field_visibility_review || 0}

## Allowed Decisions

- \`accept\`
- \`accept_with_notes\`
- \`reject\`
- \`needs_regeneration\`
- \`pending\`
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const rows = buildReviewFixture(args);
  writeJsonl(args.outPath, rows);
  fs.writeFileSync(args.mdPath, markdown(rows, args.outPath));
  console.log(JSON.stringify({
    fixture: path.relative(repoRoot, args.outPath),
    report: path.relative(repoRoot, args.mdPath),
    rows: rows.length,
    pending: rows.filter((row) => row.reviewer_decision === "pending").length,
    high_priority: rows.filter((row) => row.priority === "high").length
  }, null, 2));
}
