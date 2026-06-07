#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultLabelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const defaultAuditPath = path.join(repoRoot, "reports/gold_label_audit_v0.json");
const defaultContractPath = path.join(repoRoot, "reports/webllm_round_02.json");
const defaultReviewPath = path.join(repoRoot, "reports/quality_review_sheet_round_02.json");
const jsonOutPath = path.join(repoRoot, "reports/round02_200_scale_readiness.json");
const mdOutPath = path.join(repoRoot, "reports/ROUND_02_200_SCALE_READINESS.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function pct(value) {
  return Number((value * 100).toFixed(1));
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function evidenceReuse(labels) {
  const counts = new Map();
  for (const label of labels) {
    for (const id of label.gold_evidence_ids || []) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([evidence_id, count]) => ({ evidence_id, count, ratio: labels.length === 0 ? 0 : count / labels.length }))
    .sort((a, b) => b.count - a.count || a.evidence_id.localeCompare(b.evidence_id));
}

function contractSummary(roundJson) {
  const reportText = fs.existsSync(path.join(repoRoot, "reports/WEBLLM_ROUND_02.md"))
    ? fs.readFileSync(path.join(repoRoot, "reports/WEBLLM_ROUND_02.md"), "utf8")
    : "";
  const failMatch = reportText.match(/Fail findings:\s*(\d+)/);
  const warnMatch = reportText.match(/Warning findings:\s*(\d+)/);
  return {
    completed_count: (roundJson.results || []).filter((row) => row.generation_status === "completed").length,
    error_count: (roundJson.results || []).filter((row) => row.generation_status !== "completed").length,
    fail_count: failMatch ? Number(failMatch[1]) : null,
    warn_count: warnMatch ? Number(warnMatch[1]) : null
  };
}

export function assessScaleReadiness({
  targetCount = 200,
  labelsPath = defaultLabelsPath,
  auditPath = defaultAuditPath,
  contractPath = defaultContractPath,
  reviewPath = defaultReviewPath
} = {}) {
  const labels = readJsonl(labelsPath);
  const audit = fs.existsSync(auditPath) ? readJson(auditPath) : null;
  const round = fs.existsSync(contractPath) ? readJson(contractPath) : null;
  const review = fs.existsSync(reviewPath) ? readJson(reviewPath) : null;
  const reviewRows = review?.rows || [];
  const unreviewed = labels.filter((label) => label.review_state !== "reviewed");
  const reviewOpen = reviewRows.filter((row) => !row.reviewer_decision);
  const reuseRows = evidenceReuse(labels);
  const intentCounts = countBy(labels, "intent");
  const distributionWarnings = Object.entries(intentCounts)
    .filter(([, count]) => count / Math.max(1, labels.length) > 0.4)
    .map(([intent, count]) => ({
      code: "intent_over_40_percent",
      intent,
      count,
      ratio: count / labels.length
    }));
  const reuseWarnings = reuseRows
    .filter((row) => row.ratio > 0.3)
    .map((row) => ({
      code: row.ratio > 0.5 ? "evidence_overuse_fail" : "evidence_overuse_warn",
      ...row
    }));
  const contract = round ? contractSummary(round) : null;

  const blockers = [];
  if (!audit) blockers.push("missing_gold_label_audit_report");
  if (audit?.summary?.fail_count > 0) blockers.push("gold_label_audit_has_failures");
  if (audit?.summary?.needs_human_review > 0) blockers.push("gold_label_audit_has_review_queue");
  if (!round) blockers.push("missing_round02_runtime_report");
  if (contract && contract.error_count > 0) blockers.push("round02_runtime_errors_present");
  if (contract && contract.fail_count !== null && contract.fail_count > 0) blockers.push("round02_contract_failures_present");
  if (!review) blockers.push("missing_round02_quality_review_sheet");
  if (unreviewed.length > 0) blockers.push("gold_labels_not_human_reviewed");
  if (reviewOpen.length > 0) blockers.push("round02_answers_not_reviewed");
  if (distributionWarnings.length > 0) blockers.push("intent_distribution_warning_requires_review");
  if (reuseWarnings.some((warning) => warning.code === "evidence_overuse_fail")) blockers.push("evidence_overuse_fail_requires_review");

  const batchesNeeded = Math.ceil(Math.max(0, targetCount - labels.length) / 50);
  return {
    _provenance: {
      step: "round02_200_scale_readiness",
      timestamp: new Date().toISOString(),
      commit: gitCommit(),
      labels_path: path.relative(repoRoot, labelsPath),
      audit_path: path.relative(repoRoot, auditPath),
      round02_path: path.relative(repoRoot, contractPath),
      review_path: path.relative(repoRoot, reviewPath)
    },
    target_count: targetCount,
    current_label_count: labels.length,
    additional_labels_needed: Math.max(0, targetCount - labels.length),
    recommended_batch_size: 50,
    recommended_batches_needed: batchesNeeded,
    ready_for_200_expansion: blockers.length === 0,
    blockers,
    audit_summary: audit?.summary || null,
    round02_contract_summary: contract,
    unreviewed_label_count: unreviewed.length,
    open_review_row_count: reviewOpen.length,
    intent_distribution: Object.fromEntries(Object.entries(intentCounts).map(([intent, count]) => [intent, { count, percent: pct(count / labels.length) }])),
    distribution_warnings: distributionWarnings,
    evidence_reuse_top10: reuseRows.slice(0, 10),
    evidence_reuse_warnings: reuseWarnings
  };
}

function markdown(result) {
  const blockerRows = result.blockers.length === 0
    ? "| none |"
    : result.blockers.map((blocker) => `| ${blocker} |`).join("\n");
  const intentRows = Object.entries(result.intent_distribution)
    .map(([intent, item]) => `| ${intent} | ${item.count} | ${item.percent}% |`)
    .join("\n");
  const reuseRows = result.evidence_reuse_top10
    .map((row) => `| ${row.evidence_id} | ${row.count} | ${pct(row.ratio)}% |`)
    .join("\n") || "| none | 0 | 0% |";

  return `# Round 02 200-Query Scale Readiness

Generated: ${result._provenance.timestamp}

This gate decides whether the current 30-query Round 02 baseline is ready to
be expanded toward a 200-query benchmark. It is intentionally stricter than the
runtime contract: 0 generated-answer failures is necessary but not sufficient.

## Decision

- Ready for 200-query expansion: ${result.ready_for_200_expansion ? "yes" : "no"}
- Current labels: ${result.current_label_count}
- Target labels: ${result.target_count}
- Additional labels needed: ${result.additional_labels_needed}
- Recommended batch size: ${result.recommended_batch_size}
- Recommended batches needed: ${result.recommended_batches_needed}
- Unreviewed gold labels: ${result.unreviewed_label_count}
- Open answer review rows: ${result.open_review_row_count}

## Blockers

| Blocker |
|---|
${blockerRows}

## Round 02 Contract Summary

- Completed rows: ${result.round02_contract_summary?.completed_count ?? "n/a"}
- Runtime errors: ${result.round02_contract_summary?.error_count ?? "n/a"}
- Contract failures: ${result.round02_contract_summary?.fail_count ?? "n/a"}
- Contract warnings: ${result.round02_contract_summary?.warn_count ?? "n/a"}

## Intent Distribution

| Intent | Count | Percent |
|---|---:|---:|
${intentRows}

## Evidence Reuse Top 10

| Evidence id | Count | Percent of labels |
|---|---:|---:|
${reuseRows}

## Scale-Up Rule

Do not add 170 labels in one step. Expand in audited batches of up to 50
queries. Each batch must pass label audit, retrieval sufficiency, contract
validation, regression comparison against the prior baseline, and review-state
closure before it becomes part of the benchmark.
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const strict = process.argv.includes("--strict");
  const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
  const targetCount = targetArg ? Number(targetArg.split("=")[1]) : 200;
  const result = assessScaleReadiness({ targetCount });
  fs.writeFileSync(jsonOutPath, JSON.stringify(result, null, 2) + "\n");
  fs.writeFileSync(mdOutPath, markdown(result));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, mdOutPath),
    ready_for_200_expansion: result.ready_for_200_expansion,
    blockers: result.blockers,
    current_label_count: result.current_label_count,
    additional_labels_needed: result.additional_labels_needed
  }, null, 2));
  if (strict && !result.ready_for_200_expansion) process.exitCode = 1;
}
