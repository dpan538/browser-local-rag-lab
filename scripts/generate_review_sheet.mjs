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
const defaultJsonOutPath = path.join(repoRoot, "reports/quality_review_sheet_round_02.json");
const defaultMdOutPath = path.join(repoRoot, "reports/QUALITY_REVIEW_SHEET_ROUND_02.md");

function parseArgs(args) {
  const parsed = {
    queriesPath: defaultQueriesPath,
    labelsPath: defaultLabelsPath,
    recordsPath: defaultRecordsPath,
    answersPath: defaultAnswersPath,
    jsonOutPath: defaultJsonOutPath,
    mdOutPath: defaultMdOutPath
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
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

function answerMentionsAnyValue(answer, values) {
  const haystack = normalize(answer);
  return values.some((value) => {
    const needle = normalize(value);
    return needle.length >= 3 && haystack.includes(needle);
  });
}

function groupViolations(violations) {
  return violations.reduce((acc, item) => {
    acc[item.query_id] ||= [];
    acc[item.query_id].push(item);
    return acc;
  }, {});
}

function statusForField(answer, records, field) {
  const values = [...new Set(records.flatMap((record) => fieldValues(record, field)))];
  if (values.length === 0) return { status: "NO_EVIDENCE_VALUE", values };
  if (answerMentionsAnyValue(answer, values)) return { status: "OBSERVED", values };
  return { status: "MISSING_OR_IMPLICIT", values };
}

function reviewDecision(label, findings, fieldStatuses) {
  if (findings.some((item) => item.severity === "fail")) return "hard_fail_reject";
  if (fieldStatuses.some((item) => item.status === "MISSING_OR_IMPLICIT")) return "needs_field_visibility_review";
  return "reviewed_candidate";
}

function priorityForDecision(decision) {
  if (decision === "hard_fail_reject") return "blocker";
  if (decision === "needs_field_visibility_review") return "high";
  return "low";
}

function buildReviewSheet({
  queriesPath = defaultQueriesPath,
  labelsPath = defaultLabelsPath,
  recordsPath = defaultRecordsPath,
  answersPath = defaultAnswersPath
} = {}) {
  const queries = new Map(readJsonl(queriesPath).map((query) => [query.query_id, query]));
  const labels = readJsonl(labelsPath);
  const records = new Map(readJsonl(recordsPath).map((record) => [record.record_id, record]));
  const answers = new Map(readJsonl(answersPath).map((answer) => [answer.query_id || answer.id, answer]));
  const contract = validateGenerationContract({ queriesPath, labelsPath, recordsPath, answersPath });
  const findingsByQuery = groupViolations(contract.violations);

  return labels.map((label) => {
    const answerRow = answers.get(label.query_id);
    const answerText = String(answerRow?.answer_text || "");
    const evidenceRecords = (label.gold_evidence_ids || []).map((id) => records.get(id)).filter(Boolean);
    const fieldStatuses = (label.required_fields || []).map((field) => ({
      field,
      ...statusForField(answerText, evidenceRecords, field)
    }));
    const findings = findingsByQuery[label.query_id] || [];
    const suggestedReviewDecision = reviewDecision(label, findings, fieldStatuses);
    const allRequiredFieldsVisible = fieldStatuses.every((item) => item.status === "OBSERVED");
    return {
      query_id: label.query_id,
      query_text: queries.get(label.query_id)?.query_text || "",
      intent: label.intent,
      lane: label.gold_lane,
      refusal_expected: label.refusal_expected,
      label_review_state: label.review_state || "unknown",
      evidence_ids: label.gold_evidence_ids || [],
      field_statuses: fieldStatuses,
      all_required_fields_visible: allRequiredFieldsVisible,
      contract_findings: findings,
      answer_excerpt: answerText.slice(0, 600),
      suggested_review_decision: suggestedReviewDecision,
      priority: priorityForDecision(suggestedReviewDecision),
      reviewer_decision: "",
      reviewer_notes: ""
    };
  });
}

function markdown(sheet, answersPath) {
  const counts = sheet.reduce((acc, row) => {
    acc[row.suggested_review_decision] = (acc[row.suggested_review_decision] || 0) + 1;
    acc[`priority_${row.priority}`] = (acc[`priority_${row.priority}`] || 0) + 1;
    return acc;
  }, {});
  const warningRows = sheet
    .filter((row) => row.contract_findings.length > 0 || row.field_statuses.some((field) => field.status !== "OBSERVED"))
    .map((row) => {
      const fields = row.field_statuses
        .filter((field) => field.status !== "OBSERVED")
        .map((field) => `${field.field}:${field.status}`)
        .join("; ") || "none";
      const findings = row.contract_findings.map((item) => `${item.severity}:${item.code}:${item.field}`).join("; ") || "none";
      return `| ${row.query_id} | ${row.intent} | ${row.refusal_expected ? "yes" : "no"} | ${row.priority} | ${row.suggested_review_decision} | ${fields} | ${findings} |`;
    })
    .join("\n") || "| none | none | none | none | none | none | none |";

  return `# Quality Review Sheet Round 02

Generated: ${new Date().toISOString()}

Answers: ${path.relative(repoRoot, answersPath)}

This sheet is a reviewer aid. It does not turn generated answers into archive
evidence. It checks which required evidence values are visibly present in the
Round 02 answer text and records contract findings for human adjudication.

## Summary

- Rows: ${sheet.length}
- hard_fail_reject: ${counts.hard_fail_reject || 0}
- needs_field_visibility_review: ${counts.needs_field_visibility_review || 0}
- reviewed_candidate: ${counts.reviewed_candidate || 0}
- high priority rows: ${counts.priority_high || 0}
- low priority rows: ${counts.priority_low || 0}

## Rows Requiring Attention

| Query | Intent | Refusal | Priority | Suggested decision | Field status | Contract findings |
|---|---|---|---|---|---|---|
${warningRows}

## Reviewer Protocol

1. Hard failures are automatic rejects.
2. Refusal-expected answers must not provide factual claims beyond the
   insufficient-evidence statement.
3. Required fields may be accepted only if the answer visibly carries the
   evidence value or the reviewer records why implicit wording is sufficient.
4. A row becomes paper-usable only after \`reviewer_decision\` is filled in a
   reviewed answer fixture.
`;
}

export function writeReviewSheet(options = {}) {
  const answersPath = options.answersPath || defaultAnswersPath;
  const jsonOutPath = options.jsonOutPath || defaultJsonOutPath;
  const mdOutPath = options.mdOutPath || defaultMdOutPath;
  const sheet = buildReviewSheet({ ...options, answersPath });
  const reviewSummary = sheet.reduce((acc, row) => {
    acc[row.suggested_review_decision] = (acc[row.suggested_review_decision] || 0) + 1;
    acc[`priority_${row.priority}`] = (acc[`priority_${row.priority}`] || 0) + 1;
    return acc;
  }, {});
  fs.writeFileSync(jsonOutPath, JSON.stringify({
    _provenance: {
      step: "round02_quality_review_sheet",
      timestamp: new Date().toISOString(),
      answers_path: path.relative(repoRoot, answersPath)
    },
    review_summary: reviewSummary,
    rows: sheet
  }, null, 2) + "\n");
  fs.writeFileSync(mdOutPath, markdown(sheet, answersPath));
  return { json: path.relative(repoRoot, jsonOutPath), report: path.relative(repoRoot, mdOutPath), rows: sheet.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const summary = writeReviewSheet(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify(summary, null, 2));
}
