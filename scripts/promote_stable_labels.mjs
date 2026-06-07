#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultLabelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const defaultAuditPath = path.join(repoRoot, "reports/gold_label_audit_v0.json");
const defaultJsonOutPath = path.join(repoRoot, "reports/label_promotion_dry_run_round_02.json");
const defaultMdOutPath = path.join(repoRoot, "reports/LABEL_PROMOTION_DRY_RUN_ROUND_02.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function parseArgs(args) {
  const parsed = { execute: false, state: "stable_rule_reviewed" };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--execute") {
      parsed.execute = true;
      continue;
    }
    if (arg === "--state") {
      parsed.state = args[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--labels") {
      parsed.labelsPath = args[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--audit") {
      parsed.auditPath = args[index + 1];
      index += 1;
    }
  }
  return parsed;
}

function auditMap(audit) {
  return new Map((audit.audits || []).map((entry) => [entry.query_id, entry]));
}

function promotable(label, auditEntry) {
  if (!auditEntry) return false;
  if (label.review_state !== "seed_auto_needs_human_review") return false;
  if (auditEntry.final_state !== "STABLE_BY_RULE") return false;
  if (auditEntry.fail_count !== 0 || auditEntry.warn_count !== 0) return false;
  if ((auditEntry.findings || []).length > 0) return false;
  return true;
}

export function promoteStableLabels({
  labelsPath = defaultLabelsPath,
  auditPath = defaultAuditPath,
  execute = false,
  state = "stable_rule_reviewed"
} = {}) {
  const labels = readJsonl(labelsPath);
  const audit = readJson(auditPath);
  const auditsByQuery = auditMap(audit);
  const promoted = [];
  const blocked = [];
  const nextLabels = labels.map((label) => {
    const entry = auditsByQuery.get(label.query_id);
    if (!promotable(label, entry)) {
      blocked.push({
        query_id: label.query_id,
        current_review_state: label.review_state || "unknown",
        audit_state: entry?.final_state || "missing",
        fail_count: entry?.fail_count ?? null,
        warn_count: entry?.warn_count ?? null,
        reason: label.review_state !== "seed_auto_needs_human_review"
          ? "review_state_not_seed_auto"
          : entry?.final_state !== "STABLE_BY_RULE"
            ? "audit_not_stable_by_rule"
            : entry?.fail_count !== 0 || entry?.warn_count !== 0 || (entry?.findings || []).length > 0
              ? "audit_has_findings"
              : "not_promotable"
      });
      return label;
    }
    promoted.push(label.query_id);
    return {
      ...label,
      review_state: state,
      review_state_basis: state === "human_reviewed"
        ? "manually confirmed after stable-rule audit"
        : "stable-rule audit auto-promotion candidate; human semantic answer review still separate"
    };
  });

  if (execute) writeJsonl(labelsPath, nextLabels);

  return {
    _provenance: {
      step: "promote_stable_labels",
      timestamp: new Date().toISOString(),
      labels_path: path.relative(repoRoot, labelsPath),
      audit_path: path.relative(repoRoot, auditPath),
      execute,
      target_state: state
    },
    total: labels.length,
    promoted_count: promoted.length,
    blocked_count: blocked.length,
    promoted,
    blocked
  };
}

function markdown(result) {
  const promotedRows = result.promoted.length === 0
    ? "| none |"
    : result.promoted.map((id) => `| ${id} |`).join("\n");
  const blockedRows = result.blocked.slice(0, 20)
    .map((row) => `| ${row.query_id} | ${row.current_review_state} | ${row.audit_state} | ${row.reason} |`)
    .join("\n") || "| none | none | none | none |";

  return `# Label Promotion Dry Run Round 02

Generated: ${result._provenance.timestamp}

This report identifies seed labels that can be promoted based on the deterministic
gold-label audit. Promotion does not review generated model answers and does not
turn generated answers into archive evidence.

## Summary

- Execute mode: ${result._provenance.execute ? "yes" : "no"}
- Target state: ${result._provenance.target_state}
- Labels checked: ${result.total}
- Promotable labels: ${result.promoted_count}
- Blocked labels: ${result.blocked_count}

## Promotable Labels

| Query |
|---|
${promotedRows}

## Blocked Labels, First 20

| Query | Current state | Audit state | Reason |
|---|---|---|---|
${blockedRows}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const result = promoteStableLabels({
    labelsPath: args.labelsPath ? path.resolve(args.labelsPath) : defaultLabelsPath,
    auditPath: args.auditPath ? path.resolve(args.auditPath) : defaultAuditPath,
    execute: args.execute,
    state: args.state
  });
  fs.writeFileSync(defaultJsonOutPath, JSON.stringify(result, null, 2) + "\n");
  fs.writeFileSync(defaultMdOutPath, markdown(result));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, defaultMdOutPath),
    execute: result._provenance.execute,
    target_state: result._provenance.target_state,
    promoted_count: result.promoted_count,
    blocked_count: result.blocked_count
  }, null, 2));
}
