#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultFixturePath = path.join(repoRoot, "reports/review_fixture_round_02.jsonl");
const defaultOutPath = path.join(repoRoot, "reports/reviewed_answers_round_02.jsonl");
const defaultReportPath = path.join(repoRoot, "reports/REVIEW_DECISIONS_ROUND_02.md");
const allowedDecisions = new Set(["accept", "accept_with_notes", "reject", "needs_regeneration", "pending"]);

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function parseArgs(args) {
  const parsed = { fixturePath: defaultFixturePath, outPath: defaultOutPath, reportPath: defaultReportPath, strict: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--fixture") parsed.fixturePath = path.resolve(args[++index]);
    else if (arg === "--out") parsed.outPath = path.resolve(args[++index]);
    else if (arg === "--strict") parsed.strict = true;
  }
  return parsed;
}

function validateRow(row) {
  const issues = [];
  if (!allowedDecisions.has(row.reviewer_decision)) {
    issues.push({ severity: "fail", code: "R001_invalid_reviewer_decision", detail: row.reviewer_decision });
  }
  if (row.reviewer_decision === "pending") {
    issues.push({ severity: "warn", code: "R101_pending_review", detail: "reviewer_decision is pending" });
  }
  if (row.hard_fail && ["accept", "accept_with_notes"].includes(row.reviewer_decision)) {
    issues.push({ severity: "fail", code: "R002_hard_fail_accepted", detail: "hard-fail rows cannot be accepted" });
  }
  if (row.suggested_review_decision === "needs_field_visibility_review"
      && row.reviewer_decision === "accept"
      && !String(row.reviewer_notes || "").trim()) {
    issues.push({ severity: "warn", code: "R102_visibility_issue_accepted_without_notes", detail: "add reviewer_notes or use accept_with_notes" });
  }
  return issues;
}

export function applyReviewDecisions({
  fixturePath = defaultFixturePath,
  outPath = defaultOutPath
} = {}) {
  const rows = readJsonl(fixturePath);
  const findings = [];
  const reviewedRows = rows.map((row) => {
    const rowIssues = validateRow(row);
    for (const issue of rowIssues) findings.push({ query_id: row.query_id, ...issue });
    return {
      query_id: row.query_id,
      intent: row.intent,
      lane: row.lane,
      refusal_expected: row.refusal_expected,
      reviewer_decision: row.reviewer_decision,
      reviewer_notes: row.reviewer_notes,
      hard_fail: row.hard_fail,
      priority: row.priority,
      suggested_review_decision: row.suggested_review_decision,
      generated_answer: row.generated_answer,
      evidence_ids: row.evidence_ids,
      contract_findings: row.contract_findings,
      locked_source_answer_row: row.locked_source_answer_row
    };
  });
  writeJsonl(outPath, reviewedRows);
  return {
    rows: rows.length,
    pending_count: rows.filter((row) => row.reviewer_decision === "pending").length,
    accepted_count: rows.filter((row) => row.reviewer_decision === "accept" || row.reviewer_decision === "accept_with_notes").length,
    rejected_count: rows.filter((row) => row.reviewer_decision === "reject").length,
    needs_regeneration_count: rows.filter((row) => row.reviewer_decision === "needs_regeneration").length,
    fail_count: findings.filter((item) => item.severity === "fail").length,
    warn_count: findings.filter((item) => item.severity === "warn").length,
    findings
  };
}

function markdown(result, fixturePath, outPath) {
  const rows = result.findings.length === 0
    ? "| none | none | none | none |"
    : result.findings.map((item) => `| ${item.severity} | ${item.query_id} | ${item.code} | ${item.detail} |`).join("\n");
  return `# Review Decisions Round 02

Generated: ${new Date().toISOString()}

- Fixture: ${path.relative(repoRoot, fixturePath)}
- Reviewed answers: ${path.relative(repoRoot, outPath)}

## Summary

- Rows: ${result.rows}
- Pending: ${result.pending_count}
- Accepted: ${result.accepted_count}
- Rejected: ${result.rejected_count}
- Needs regeneration: ${result.needs_regeneration_count}
- Fail findings: ${result.fail_count}
- Warning findings: ${result.warn_count}

## Findings

| Severity | Query | Code | Detail |
|---|---|---|---|
${rows}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const result = applyReviewDecisions(args);
  fs.writeFileSync(args.reportPath, markdown(result, args.fixturePath, args.outPath));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, args.reportPath),
    reviewed_answers: path.relative(repoRoot, args.outPath),
    rows: result.rows,
    pending_count: result.pending_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count
  }, null, 2));
  if (args.strict && (result.fail_count > 0 || result.pending_count > 0)) process.exitCode = 1;
}
