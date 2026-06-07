#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const recordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const labelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const reportJsonPath = path.join(repoRoot, "reports/evidence_health_v0.json");
const reportMdPath = path.join(repoRoot, "reports/EVIDENCE_HEALTH_v0.md");

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

function citedEvidenceIds(labels) {
  const ids = new Set();
  for (const label of labels) {
    for (const id of label.gold_evidence_ids || []) ids.add(id);
  }
  return [...ids].sort();
}

export function checkEvidenceHealth(recordsFile = recordsPath, labelsFile = labelsPath) {
  const records = readJsonl(recordsFile);
  const labels = readJsonl(labelsFile);
  const recordsById = new Map(records.map((record) => [record.record_id, record]));
  const issues = [];

  for (const id of citedEvidenceIds(labels)) {
    const record = recordsById.get(id);
    if (!record) {
      addIssue(issues, "fail", "E001_missing_cited_record", id, "gold_evidence_id does not resolve to a record");
      continue;
    }

    if (!hasValue(record.title) || /^placeholder\b/i.test(record.title)) {
      addIssue(issues, "fail", "E002_invalid_title", id, "title is missing or placeholder-like");
    }
    if (!hasValue(record.source?.name) || !hasValue(record.source?.url)) {
      addIssue(issues, "fail", "E003_source_incomplete", id, "source.name and source.url are required for cited evidence");
    }
    if (!hasValue(record.rights?.state) && !hasValue(record.rights?.label)) {
      addIssue(issues, "fail", "E004_rights_missing", id, "rights.state or rights.label is required for cited evidence");
    }
    if (!hasValue(record.image_state?.code)) {
      addIssue(issues, "fail", "E005_image_state_missing", id, "image_state.code is required even when no image is displayed");
    }
    if (!hasValue(record.notes?.compact) && !hasValue(record.notes?.raw) && !hasValue(record.method_context)) {
      addIssue(issues, "fail", "E006_no_text_or_method_context", id, "cited evidence needs compact/raw text or method_context");
    }

    if (!hasValue(record.creator) || String(record.creator).trim().toLowerCase() === "unknown") {
      addIssue(issues, "warn", "E101_creator_unknown", id, "creator is unknown; answers must avoid inventing attribution");
    }
    if (String(record.rights?.state || "").toLowerCase().includes("review")) {
      addIssue(issues, "warn", "E102_rights_review_required", id, "rights state requires conservative interpretation");
    }
    if (String(record.region || "").toLowerCase().includes("unresolved")) {
      addIssue(issues, "warn", "E103_region_unresolved", id, "region is unresolved; route answers should not overclaim geography");
    }
  }

  return {
    checked_record_count: citedEvidenceIds(labels).length,
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
  fs.writeFileSync(reportMdPath, `# Evidence Health v0

Generated: ${new Date().toISOString()}

This scan checks cited gold evidence records for structural health. It cannot
prove source metadata is historically correct; it catches missing, placeholder,
or high-risk fields before generation.

## Summary

- Cited records checked: ${result.checked_record_count}
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
  const result = checkEvidenceHealth(positional[0] || recordsPath, positional[1] || labelsPath);
  writeReports(result);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, reportMdPath),
    checked_record_count: result.checked_record_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count
  }, null, 2));
  if (process.argv.includes("--strict") && result.fail_count > 0) process.exitCode = 1;
}
