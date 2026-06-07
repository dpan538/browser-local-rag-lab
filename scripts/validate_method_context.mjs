#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const recordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const labelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const reportJsonPath = path.join(repoRoot, "reports/method_context_audit_v0.json");
const reportMdPath = path.join(repoRoot, "reports/METHOD_CONTEXT_AUDIT_v0.md");

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function addIssue(issues, severity, code, recordId, detail) {
  issues.push({ severity, code, record_id: recordId, detail });
}

function isMethodRecord(record) {
  return record?.object_type === "method_context"
    || record?.topology?.publication_role === "method_context"
    || hasValue(record?.method_context);
}

export function validateMethodContext(recordsFile = recordsPath, labelsFile = labelsPath) {
  const records = readJsonl(recordsFile);
  const labels = readJsonl(labelsFile);
  const recordsById = new Map(records.map((record) => [record.record_id, record]));
  const issues = [];
  const methodGoldIds = new Set();

  for (const label of labels) {
    for (const id of label.gold_evidence_ids || []) {
      const record = recordsById.get(id);
      if (!record) continue;
      if (label.intent === "method_process_question") {
        methodGoldIds.add(id);
        if (!isMethodRecord(record)) {
          addIssue(issues, "fail", "M001_method_label_cites_non_method_record", id, `query=${label.query_id}`);
        }
      } else if (isMethodRecord(record)) {
        addIssue(issues, "fail", "M002_method_record_used_as_object_evidence", id, `query=${label.query_id}; intent=${label.intent}`);
      }
    }
  }

  for (const id of methodGoldIds) {
    const record = recordsById.get(id);
    if (!record) continue;
    if (record.object_type !== "method_context") {
      addIssue(issues, "fail", "M003_method_object_type_invalid", id, `object_type=${record.object_type}`);
    }
    if (record.topology?.publication_role !== "method_context") {
      addIssue(issues, "fail", "M004_method_topology_invalid", id, `publication_role=${record.topology?.publication_role}`);
    }
    if (!hasValue(record.method_context)) {
      addIssue(issues, "fail", "M005_method_context_missing", id, "method_context object is required");
    }
    if (record.rights?.state !== "research_fixture") {
      addIssue(issues, "fail", "M006_method_rights_state_invalid", id, `rights.state=${record.rights?.state}`);
    }
    if (record.image_state?.code !== "IMG00" || record.image_state?.has_image_frame !== false) {
      addIssue(issues, "fail", "M007_method_image_state_invalid", id, "method records must be text-only no-image evidence");
    }
    if (record.region !== "Research method") {
      addIssue(issues, "warn", "M101_method_region_nonstandard", id, `region=${record.region}`);
    }
  }

  return {
    method_record_count: methodGoldIds.size,
    fail_count: issues.filter((issue) => issue.severity === "fail").length,
    warn_count: issues.filter((issue) => issue.severity === "warn").length,
    issues
  };
}

function writeReports(result) {
  fs.writeFileSync(reportJsonPath, JSON.stringify({ generated_at: new Date().toISOString(), ...result }, null, 2) + "\n");
  const issueRows = result.issues.length === 0
    ? "| none | none | none | none |"
    : result.issues.map((issue) => `| ${issue.severity} | ${issue.code} | ${issue.record_id} | ${issue.detail} |`).join("\n");
  fs.writeFileSync(reportMdPath, `# Method Context Audit v0

Generated: ${new Date().toISOString()}

This scan ensures research-only method context is not mistaken for archive
object evidence. Method records may carry record ids, titles, source, and
rights metadata so they can move through the same packet machinery, but they
must remain explicitly typed as method context.

## Summary

- Method records cited by method labels: ${result.method_record_count}
- Fail findings: ${result.fail_count}
- Warning findings: ${result.warn_count}

## Issues

| Severity | Code | Record | Detail |
|---|---|---|---|
${issueRows}
`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const result = validateMethodContext(positional[0] || recordsPath, positional[1] || labelsPath);
  writeReports(result);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, reportMdPath),
    method_record_count: result.method_record_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count
  }, null, 2));
  if (process.argv.includes("--strict") && result.fail_count > 0) process.exitCode = 1;
}
