#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function auditRows(report) {
  return report.audits || report.details || [];
}

function rowId(row) {
  return row.query_id || row.id;
}

function rowState(row) {
  return row.final_state || row.finalState;
}

function severityRank(state) {
  const ranks = {
    STABLE_BY_RULE: 0,
    NEEDS_HUMAN_REVIEW: 1,
    FAIL: 2
  };
  return ranks[state] ?? 3;
}

export function compareAuditReports(beforePath, afterPath) {
  const before = readJson(beforePath);
  const after = readJson(afterPath);
  const beforeMap = new Map(auditRows(before).map((row) => [rowId(row), row]));
  const afterMap = new Map(auditRows(after).map((row) => [rowId(row), row]));
  const regressions = [];
  const improvements = [];

  for (const [id, beforeRow] of beforeMap.entries()) {
    const afterRow = afterMap.get(id);
    if (!afterRow) {
      regressions.push({ query_id: id, before: rowState(beforeRow), after: "MISSING" });
      continue;
    }
    const beforeState = rowState(beforeRow);
    const afterState = rowState(afterRow);
    if (severityRank(afterState) > severityRank(beforeState)) {
      regressions.push({ query_id: id, before: beforeState, after: afterState });
    } else if (severityRank(afterState) < severityRank(beforeState)) {
      improvements.push({ query_id: id, before: beforeState, after: afterState });
    }
  }

  return {
    before_count: beforeMap.size,
    after_count: afterMap.size,
    regression_count: regressions.length,
    improvement_count: improvements.length,
    regressions,
    improvements
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [beforePath, afterPath] = process.argv.slice(2);
  if (!beforePath || !afterPath) {
    console.error("Usage: node scripts/regression_test.mjs <before_audit.json> <after_audit.json>");
    process.exit(1);
  }
  const result = compareAuditReports(beforePath, afterPath);
  console.log(JSON.stringify(result, null, 2));
  if (result.regression_count > 0) process.exitCode = 1;
}
