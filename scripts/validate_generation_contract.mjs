#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultQueriesPath = path.join(repoRoot, "fixtures/gold/queries.jsonl");
const defaultLabelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const defaultRecordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const defaultReportJsonPath = path.join(repoRoot, "reports/generation_contract_v0.json");
const defaultReportMdPath = path.join(repoRoot, "reports/GENERATION_CONTRACT_v0.md");

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
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

function answerText(row) {
  return String(row.answer_text ?? row.generated_text ?? row.output_text ?? row.answer ?? "");
}

function answerRefuses(text) {
  const normalizedText = normalize(text);
  return normalizedText.startsWith("i cannot answer this question because the evidence is insufficient");
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

function evidenceValues(records, fields) {
  const values = new Map();
  for (const field of fields) {
    values.set(field, [...new Set(records.flatMap((record) => fieldValues(record, field)))]);
  }
  return values;
}

function evidenceTagsSection(text) {
  const match = String(text).match(/EVIDENCE TAGS:\s*\n([\s\S]*)/i);
  return match ? match[1] : null;
}

function extractFieldAssertionFromText(text, field) {
  const pattern = new RegExp(`^\\s*${field.replaceAll("_", "[_ -]?")}\\s*[:：]\\s*(.+?)\\s*$`, "gim");
  const matches = [...String(text).matchAll(pattern)];
  return matches.length > 0 ? matches.at(-1)[1].trim() : null;
}

function extractFieldAssertion(text, field) {
  const tags = evidenceTagsSection(text);
  if (tags) {
    const taggedAssertion = extractFieldAssertionFromText(tags, field);
    if (taggedAssertion) return taggedAssertion;
  }
  return extractFieldAssertionFromText(text, field);
}

function extractTaggedAssertion(text, tags) {
  for (const tag of tags) {
    const pattern = new RegExp(`${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[:：]\\s*(.+?)(?:\\n|$)`, "i");
    const match = String(text).match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function answerMentionsAnyValue(text, values) {
  const haystack = normalize(text);
  return values.some((value) => {
    const needle = normalize(value);
    return needle.length >= 3 && haystack.includes(needle);
  });
}

function answerAssertsField(text, field) {
  return extractFieldAssertion(text, field) !== null;
}

function addViolation(violations, severity, queryId, code, field, detail) {
  violations.push({ severity, query_id: queryId, code, field, detail });
}

function validateSourceRightsTags(violations, label, text, valuesByField) {
  if (label.intent !== "source_rights_question" || label.refusal_expected) return;
  const tagChecks = [
    { field: "rights", tags: ["RIGHTS", "rights"] },
    { field: "reuse_permission", tags: ["REUSE", "reuse_permission"] },
    { field: "public_domain_status", tags: ["PUBLIC_DOMAIN", "public_domain_status"] }
  ];
  for (const check of tagChecks) {
    const values = valuesByField.get(check.field) || [];
    if (values.length === 0) continue;
    const asserted = extractTaggedAssertion(text, check.tags);
    if (!asserted) {
      addViolation(violations, "fail", label.query_id, "G006_source_rights_tag_missing", check.field, `missing tags=${check.tags.join("/")}`);
      continue;
    }
    if (!answerMentionsAnyValue(asserted, values)) {
      addViolation(violations, "fail", label.query_id, "G007_source_rights_tag_mismatch", check.field, `asserted="${asserted}"`);
    }
  }
}

export function validateGenerationContract({
  queriesPath = defaultQueriesPath,
  labelsPath = defaultLabelsPath,
  recordsPath = defaultRecordsPath,
  answersPath,
  requireAllAnswers = true,
  allowedQueryIds = null
}) {
  if (!answersPath) throw new Error("answersPath is required");
  const queries = new Map(readJsonl(queriesPath).map((query) => [query.query_id, query]));
  const allowed = allowedQueryIds ? new Set(allowedQueryIds) : null;
  const labels = readJsonl(labelsPath).filter((label) => !allowed || allowed.has(label.query_id));
  const recordsById = new Map(readJsonl(recordsPath).map((record) => [record.record_id, record]));
  const answers = new Map(readJsonl(answersPath).map((row) => [row.query_id || row.id, row]));
  const violations = [];

  for (const label of labels) {
    const query = queries.get(label.query_id);
    const answerRow = answers.get(label.query_id);
    if (!answerRow) {
      if (requireAllAnswers) {
        addViolation(violations, "fail", label.query_id, "G001_missing_answer", "answer", "no generated answer row found");
      }
      continue;
    }

    const text = answerText(answerRow);
    const evidenceRecords = (label.gold_evidence_ids || []).map((id) => recordsById.get(id)).filter(Boolean);
    const protectedFields = [...new Set([...(label.required_fields || []), ...(label.must_not_invent_fields || [])])];
    const valuesByField = evidenceValues(evidenceRecords, protectedFields);

    if (label.refusal_expected) {
      if (!answerRefuses(text)) {
        addViolation(violations, "fail", label.query_id, "G002_refusal_missing", "refusal", "label expects refusal or request for narrower context");
      }
      for (const field of protectedFields) {
        if (answerAssertsField(text, field) || answerMentionsAnyValue(text, valuesByField.get(field) || [])) {
          addViolation(violations, "fail", label.query_id, "G003_refusal_contains_protected_field", field, "refusal answer includes protected field/value");
        }
      }
      continue;
    }

    if (answerRefuses(text)) {
      addViolation(violations, "fail", label.query_id, "G004_answerable_refused", "refusal", "answerable label produced a refusal");
    }

    for (const field of label.required_fields || []) {
      const values = valuesByField.get(field) || [];
      if (values.length > 0 && !answerMentionsAnyValue(text, values)) {
        addViolation(violations, "warn", label.query_id, "G101_required_field_value_not_observed", field, "answer does not visibly include an evidence value for this required field");
      }
    }

    for (const field of label.must_not_invent_fields || []) {
      const asserted = extractFieldAssertion(text, field);
      if (!asserted) continue;
      const values = valuesByField.get(field) || [];
      if (!answerMentionsAnyValue(asserted, values)) {
        addViolation(violations, "fail", label.query_id, "G005_unverified_field_assertion", field, `asserted="${asserted}"`);
      }
    }

    validateSourceRightsTags(violations, label, text, valuesByField);

    if (query?.expected_lane && answerRow.lane && answerRow.lane !== query.expected_lane) {
      addViolation(violations, "warn", label.query_id, "G102_lane_mismatch", "lane", `expected=${query.expected_lane}; answer=${answerRow.lane}`);
    }
  }

  return {
    answer_count: answers.size,
    label_count: labels.length,
    fail_count: violations.filter((violation) => violation.severity === "fail").length,
    warn_count: violations.filter((violation) => violation.severity === "warn").length,
    violations
  };
}

function writeReports(result, answersPath) {
  fs.writeFileSync(defaultReportJsonPath, JSON.stringify({ generated_at: new Date().toISOString(), answers_path: answersPath, ...result }, null, 2) + "\n");
  const rows = result.violations.length === 0
    ? "| none | none | none | none | none |"
    : result.violations.map((violation) => `| ${violation.severity} | ${violation.query_id} | ${violation.code} | ${violation.field} | ${violation.detail} |`).join("\n");
  fs.writeFileSync(defaultReportMdPath, `# Generation Contract v0

Generated: ${new Date().toISOString()}

This report checks generated answers against gold label contracts. It is a
post-generation faithfulness gate, not a replacement for expert reading.

## Summary

- Answers checked: ${result.answer_count}
- Labels expected: ${result.label_count}
- Fail findings: ${result.fail_count}
- Warning findings: ${result.warn_count}

## Findings

| Severity | Query | Code | Field | Detail |
|---|---|---|---|---|
${rows}
`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const answersPath = process.argv[2];
  if (!answersPath) {
    console.error("Usage: node scripts/validate_generation_contract.mjs <answers.jsonl> [--strict]");
    process.exit(1);
  }
  const result = validateGenerationContract({ answersPath });
  writeReports(result, answersPath);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, defaultReportMdPath),
    answer_count: result.answer_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count
  }, null, 2));
  if (process.argv.includes("--strict") && result.fail_count > 0) process.exitCode = 1;
}
