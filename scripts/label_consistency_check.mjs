#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const labelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const reportJsonPath = path.join(repoRoot, "reports/label_consistency_v0.json");
const reportMdPath = path.join(repoRoot, "reports/LABEL_CONSISTENCY_v0.md");

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function stableList(value) {
  return [...(value || [])].sort();
}

function signature(fields) {
  return JSON.stringify(stableList(fields));
}

function majoritySignature(labels, field) {
  const counts = new Map();
  for (const label of labels) {
    const key = signature(label[field]);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || "[]";
}

function groupKey(label) {
  return [
    label.intent,
    label.refusal_expected ? "refusal" : "answerable",
    label.gold_lane
  ].join("::");
}

function addFinding(findings, severity, queryId, group, field, detail) {
  findings.push({ severity, query_id: queryId, group, field, detail });
}

export function checkLabelConsistency(labelsFile = labelsPath) {
  const labels = readJsonl(labelsFile);
  const groups = new Map();
  for (const label of labels) {
    const key = groupKey(label);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(label);
  }

  const findings = [];
  for (const [group, rows] of groups.entries()) {
    if (rows.length < 2) continue;
    for (const field of ["required_fields", "must_not_invent_fields", "gold_answer_slots"]) {
      const majority = majoritySignature(rows, field);
      const majorityList = JSON.parse(majority);
      for (const label of rows) {
        const current = signature(label[field]);
        if (current === majority) continue;
        const currentList = stableList(label[field]);
        const missing = majorityList.filter((item) => !currentList.includes(item));
        const extra = currentList.filter((item) => !majorityList.includes(item));
        addFinding(
          findings,
          "warn",
          label.query_id,
          group,
          field,
          `missing=${missing.join("|") || "none"}; extra=${extra.join("|") || "none"}`
        );
      }
    }
  }

  return {
    label_count: labels.length,
    group_count: groups.size,
    fail_count: 0,
    warn_count: findings.length,
    findings
  };
}

function writeReports(result) {
  fs.writeFileSync(reportJsonPath, JSON.stringify({ generated_at: new Date().toISOString(), ...result }, null, 2) + "\n");
  const rows = result.findings.length === 0
    ? "| none | none | none | none |"
    : result.findings.map((finding) => `| ${finding.severity} | ${finding.query_id} | ${finding.group} | ${finding.field} | ${finding.detail} |`).join("\n");
  fs.writeFileSync(reportMdPath, `# Label Consistency v0

Generated: ${new Date().toISOString()}

This scan compares labels within the same intent/refusal/lane group. It flags
field-set drift that may be harmless for a seed fixture but risky at larger
scale.

## Summary

- Labels checked: ${result.label_count}
- Groups checked: ${result.group_count}
- Fail findings: ${result.fail_count}
- Warning findings: ${result.warn_count}

## Findings

| Severity | Query | Group | Field | Detail |
|---|---|---|---|---|
${rows}
`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const result = checkLabelConsistency(positional[0] || labelsPath);
  writeReports(result);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, reportMdPath),
    label_count: result.label_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count
  }, null, 2));
  if (process.argv.includes("--strict") && result.fail_count > 0) process.exitCode = 1;
}
