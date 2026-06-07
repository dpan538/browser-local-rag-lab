#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const auditPath = path.join(repoRoot, "reports/gold_label_audit_v0.json");
const sufficiencyPath = path.join(repoRoot, "reports/retrieval_sufficiency_v0.json");
const labelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const jsonOutPath = path.join(repoRoot, "reports/QUALITY_METRICS_v0.json");
const mdOutPath = path.join(repoRoot, "reports/QUALITY_METRICS_v0.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function pct(value) {
  return Number((value * 100).toFixed(1));
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function groupBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "unknown";
    acc[value] ||= [];
    acc[value].push(row);
    return acc;
  }, {});
}

function difficulty(label) {
  const base = {
    archive_orientation: 1,
    casual_archive_help: 1,
    current_object_explanation: 1,
    source_rights_question: 2,
    no_evidence_refusal: 1,
    more_context: 3,
    method_process_question: 3,
    region_period_recommendation: 4,
    comparison: 4,
    first_earliest_claim: 5
  }[label.intent] ?? 3;
  const evidenceCount = label.gold_evidence_ids.length;
  const evidencePenalty = evidenceCount === 0 ? 1 : evidenceCount > 4 ? 2 : 0;
  const requiredPenalty = label.required_fields.length === 0 && !label.refusal_expected ? 3 : 0;
  return Math.min(10, base + evidencePenalty + requiredPenalty);
}

const audit = readJson(auditPath);
const sufficiency = readJson(sufficiencyPath);
const labels = readJsonl(labelsPath);
const labelCount = labels.length || 1;
const evidenceCounts = labels.map((label) => label.gold_evidence_ids.length);
const byIntent = groupBy(labels, "intent");
const requiredFieldMissingByIntent = Object.fromEntries(
  Object.entries(byIntent).map(([intent, rows]) => [
    intent,
    pct(rows.filter((label) => label.required_fields.length === 0 && !label.refusal_expected).length / rows.length)
  ])
);

const topSufficiency = sufficiency.summary
  .map((row) => ({
    variant_id: row.variant_id,
    sufficiency_rate: row.sufficiency_rate,
    evidence_coverage_rate: row.evidence_coverage_rate,
    required_fields_rate: row.required_fields_rate,
    avg_prompt_tokens_est: row.avg_prompt_tokens_est
  }))
  .sort((a, b) => b.sufficiency_rate - a.sufficiency_rate || a.avg_prompt_tokens_est - b.avg_prompt_tokens_est);

const difficultyRows = labels
  .map((label) => ({
    query_id: label.query_id,
    intent: label.intent,
    difficulty: difficulty(label),
    evidence_count: label.gold_evidence_ids.length,
    refusal_expected: label.refusal_expected
  }))
  .sort((a, b) => b.difficulty - a.difficulty || a.query_id.localeCompare(b.query_id));

const emptyRetrievalRows = sufficiency.rows.filter((row) => row.intent === "no_evidence_refusal");
const emptyRetrievalIntegrity = emptyRetrievalRows.length === 0
  ? null
  : pct(emptyRetrievalRows.filter((row) => Number(row.candidate_count) === 0 && row.empty_retrieval_correct === true).length / emptyRetrievalRows.length);
const emptyRetrievalFailures = emptyRetrievalRows
  .filter((row) => Number(row.candidate_count) !== 0 || row.empty_retrieval_correct !== true)
  .map((row) => ({
    query_id: row.query_id,
    variant_id: row.variant_id,
    candidate_count: Number(row.candidate_count),
    retrieved_ids: row.retrieved_ids
  }));

const metrics = {
  generated_at: new Date().toISOString(),
  label_count: labelCount,
  stable_by_rule_rate: pct(audit.summary.stable_by_rule / labelCount),
  fail_rate: pct(audit.summary.fail_count / labelCount),
  review_queue_rate: pct(audit.summary.needs_human_review / labelCount),
  warning_rate: pct(audit.summary.warn_count / labelCount),
  anomaly_count: audit.summary.anomaly_count,
  anomaly_fail_count: audit.summary.anomaly_fail_count || 0,
  rule_config_fail_count: audit.summary.rule_config_fail_count || 0,
  empty_retrieval_integrity: emptyRetrievalIntegrity,
  empty_retrieval_failure_count: emptyRetrievalFailures.length,
  average_evidence_count: Number((evidenceCounts.reduce((sum, count) => sum + count, 0) / labelCount).toFixed(2)),
  median_evidence_count: median(evidenceCounts),
  required_field_missing_by_intent: requiredFieldMissingByIntent,
  top_sufficiency_variants: topSufficiency,
  highest_difficulty_labels: difficultyRows.slice(0, 10),
  empty_retrieval_failures: emptyRetrievalFailures
};

fs.writeFileSync(jsonOutPath, JSON.stringify(metrics, null, 2) + "\n");

fs.writeFileSync(mdOutPath, `# Quality Metrics v0

Generated: ${metrics.generated_at}

This report summarizes label-contract health and retrieval-sufficiency behavior.
It does not evaluate generated model answers.

## Label Health

- Labels: ${metrics.label_count}
- Stable-by-rule rate: ${metrics.stable_by_rule_rate}%
- Fail rate: ${metrics.fail_rate}%
- Review queue rate: ${metrics.review_queue_rate}%
- Warning rate: ${metrics.warning_rate}%
- Anomalies: ${metrics.anomaly_count}
- Anomaly fail findings: ${metrics.anomaly_fail_count}
- Rule config fail findings: ${metrics.rule_config_fail_count}
- Empty retrieval integrity: ${metrics.empty_retrieval_integrity === null ? "N/A" : `${metrics.empty_retrieval_integrity}%`}
- Empty retrieval failures: ${metrics.empty_retrieval_failure_count}
- Average evidence ids per label: ${metrics.average_evidence_count}
- Median evidence ids per label: ${metrics.median_evidence_count}

## Required-Field Missing Rate By Intent

| Intent | Missing rate |
|---|---:|
${Object.entries(metrics.required_field_missing_by_intent).map(([intent, rate]) => `| ${intent} | ${rate}% |`).join("\n")}

## Sufficiency Variants

| Variant | Sufficiency | Evidence coverage | Required fields | Avg tokens |
|---|---:|---:|---:|---:|
${metrics.top_sufficiency_variants.map((row) => `| ${row.variant_id} | ${row.sufficiency_rate} | ${row.evidence_coverage_rate} | ${row.required_fields_rate} | ${row.avg_prompt_tokens_est} |`).join("\n")}

## Highest Difficulty Labels

| Query | Intent | Difficulty | Evidence ids | Refusal |
|---|---|---:|---:|---|
${metrics.highest_difficulty_labels.map((row) => `| ${row.query_id} | ${row.intent} | ${row.difficulty} | ${row.evidence_count} | ${row.refusal_expected ? "yes" : "no"} |`).join("\n")}
`);

console.log(JSON.stringify({
  report: path.relative(repoRoot, mdOutPath),
  stable_by_rule_rate: metrics.stable_by_rule_rate,
  fail_rate: metrics.fail_rate,
  review_queue_rate: metrics.review_queue_rate,
  best_variant: metrics.top_sufficiency_variants[0]?.variant_id
}, null, 2));
