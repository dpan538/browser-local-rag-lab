#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const goldDir = path.join(repoRoot, "fixtures/gold");
const reportPath = path.join(repoRoot, "reports/GOLD_LABEL_AUDIT_v0.md");
const jsonPath = path.join(repoRoot, "reports/gold_label_audit_v0.json");

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function expectedLaneForIntent(intent) {
  const map = {
    archive_orientation: "help",
    casual_archive_help: "help",
    current_object_explanation: "fast_answer",
    source_rights_question: "source_rights",
    first_earliest_claim: "research_answer",
    comparison: "research_answer",
    region_period_recommendation: "research_answer",
    method_process_question: "research_answer",
    more_context: "research_answer",
    no_evidence_refusal: "refusal_more_context"
  };
  return map[intent] || "research_answer";
}

function requiredFieldsForIntent(intent) {
  const map = {
    archive_orientation: ["topology"],
    casual_archive_help: ["topology"],
    current_object_explanation: ["record_id", "title", "date_text", "region", "source"],
    source_rights_question: ["record_id", "title", "source", "rights", "image_state"],
    first_earliest_claim: ["record_id", "title", "date_text", "source"],
    comparison: ["record_id", "title", "source"],
    region_period_recommendation: ["record_id", "title", "date_text", "region", "source"],
    method_process_question: ["method_context"],
    more_context: ["record_id", "title", "topology"],
    no_evidence_refusal: []
  };
  return map[intent] || ["record_id", "title"];
}

function arrayIncludesAll(actual, expected) {
  const set = new Set(actual);
  return expected.every((item) => set.has(item));
}

function classify(label, query, recordsById) {
  const findings = [];
  const expectedLane = expectedLaneForIntent(label.intent);

  if (!query) {
    findings.push({ severity: "fail", code: "missing_query", detail: label.query_id });
  } else if (query.intent !== label.intent) {
    findings.push({ severity: "fail", code: "intent_mismatch", detail: `query=${query.intent} label=${label.intent}` });
  }

  if (label.gold_lane !== expectedLane) {
    findings.push({ severity: "warn", code: "lane_unexpected", detail: `expected ${expectedLane}` });
  }

  const expectedFields = requiredFieldsForIntent(label.intent);
  if (!arrayIncludesAll(label.required_fields, expectedFields)) {
    findings.push({ severity: "warn", code: "required_fields_incomplete", detail: `expected ${expectedFields.join(",")}` });
  }

  if (!arrayIncludesAll(label.must_not_invent_fields, ["title", "creator", "date", "source", "rights"])) {
    findings.push({ severity: "fail", code: "must_not_invent_core_missing", detail: "title, creator, date, source, rights must be protected" });
  }

  if (label.intent === "source_rights_question" && !arrayIncludesAll(label.must_not_invent_fields, ["reuse_permission", "public_domain_status"])) {
    findings.push({ severity: "warn", code: "rights_noninvent_fields_missing", detail: "rights questions should protect reuse_permission and public_domain_status" });
  }

  if (label.intent === "first_earliest_claim" && !label.refusal_expected) {
    findings.push({ severity: "warn", code: "chronology_not_refusal_seed", detail: "first/earliest claims need human chronology review before answerable" });
  }

  if (label.intent === "no_evidence_refusal" && !label.refusal_expected) {
    findings.push({ severity: "fail", code: "no_evidence_not_refusal", detail: "no-evidence query should refuse" });
  }

  if (label.sufficient_context && label.refusal_expected) {
    findings.push({ severity: "warn", code: "sufficient_but_refusal", detail: "possible only for policy refusal; review manually" });
  }

  if (!label.sufficient_context && !label.refusal_expected) {
    findings.push({ severity: "warn", code: "insufficient_without_refusal", detail: "should usually ask for context or refuse" });
  }

  for (const id of label.gold_evidence_ids) {
    if (!recordsById.has(id)) {
      findings.push({ severity: "fail", code: "missing_gold_evidence_record", detail: id });
    }
  }

  const needsHuman = [
    "first_earliest_claim",
    "comparison",
    "region_period_recommendation",
    "method_process_question",
    "more_context"
  ].includes(label.intent);
  const stableByRule = findings.every((finding) => finding.severity !== "fail")
    && !needsHuman
    && label.review_state === "seed_auto_needs_human_review";

  return {
    query_id: label.query_id,
    intent: label.intent,
    gold_lane: label.gold_lane,
    stable_by_rule: stableByRule,
    needs_human_review: needsHuman || findings.length > 0,
    fail_count: findings.filter((finding) => finding.severity === "fail").length,
    warn_count: findings.filter((finding) => finding.severity === "warn").length,
    findings
  };
}

const records = readJsonl(path.join(goldDir, "records.jsonl"));
const queries = new Map(readJsonl(path.join(goldDir, "queries.jsonl")).map((query) => [query.query_id, query]));
const labels = readJsonl(path.join(goldDir, "labels.jsonl"));
const recordsById = new Set(records.map((record) => record.record_id));
const audits = labels.map((label) => classify(label, queries.get(label.query_id), recordsById));

const byIntent = audits.reduce((acc, audit) => {
  acc[audit.intent] ||= { total: 0, stable_by_rule: 0, needs_human_review: 0, fails: 0, warnings: 0 };
  acc[audit.intent].total += 1;
  if (audit.stable_by_rule) acc[audit.intent].stable_by_rule += 1;
  if (audit.needs_human_review) acc[audit.intent].needs_human_review += 1;
  acc[audit.intent].fails += audit.fail_count;
  acc[audit.intent].warnings += audit.warn_count;
  return acc;
}, {});

const summary = {
  label_count: audits.length,
  stable_by_rule: audits.filter((audit) => audit.stable_by_rule).length,
  needs_human_review: audits.filter((audit) => audit.needs_human_review).length,
  fail_count: audits.reduce((sum, audit) => sum + audit.fail_count, 0),
  warn_count: audits.reduce((sum, audit) => sum + audit.warn_count, 0),
  by_intent: Object.fromEntries(Object.entries(byIntent).sort(([a], [b]) => a.localeCompare(b)))
};

fs.writeFileSync(jsonPath, JSON.stringify({ generated_at: new Date().toISOString(), summary, audits }, null, 2) + "\n");

const findingRows = audits
  .filter((audit) => audit.findings.length > 0 || audit.needs_human_review)
  .map((audit) => `| ${audit.query_id} | ${audit.intent} | ${audit.gold_lane} | ${audit.stable_by_rule ? "yes" : "no"} | ${audit.needs_human_review ? "yes" : "no"} | ${audit.findings.map((finding) => `${finding.severity}:${finding.code}`).join("; ") || "method review"} |`);

fs.writeFileSync(reportPath, `# Gold Label Audit v0

Generated: ${new Date().toISOString()}

This audit checks label consistency against the adjudication guide. It does not
judge generated model answers.

## Summary

- Labels: ${summary.label_count}
- Stable by rule: ${summary.stable_by_rule}
- Needs human/method review: ${summary.needs_human_review}
- Fail findings: ${summary.fail_count}
- Warning findings: ${summary.warn_count}

## By Intent

| Intent | Total | Stable by rule | Needs review | Fails | Warnings |
|---|---:|---:|---:|---:|---:|
${Object.entries(summary.by_intent).map(([intent, row]) => `| ${intent} | ${row.total} | ${row.stable_by_rule} | ${row.needs_human_review} | ${row.fails} | ${row.warnings} |`).join("\n")}

## Review Queue

| Query | Intent | Lane | Stable by rule | Needs review | Findings |
|---|---|---|---|---|---|
${findingRows.join("\n")}

## Interpretation

- Stable-by-rule labels can be promoted after a quick spot check.
- Review-queue labels need method review, not blind preference testing.
- First/earliest, comparison, region-period, method, and more-context questions
  should remain non-final until their evidence sufficiency is manually checked.
`);

console.log(JSON.stringify({ summary, report: path.relative(repoRoot, reportPath) }, null, 2));
