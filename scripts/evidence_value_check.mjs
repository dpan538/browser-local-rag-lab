#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const recordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const labelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const reportJsonPath = path.join(repoRoot, "reports/evidence_value_check_v0.json");
const reportMdPath = path.join(repoRoot, "reports/EVIDENCE_VALUE_CHECK_v0.md");

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

function validDateText(value) {
  if (!hasValue(value)) return false;
  const text = String(value).trim().toLowerCase();
  return /^(\d{4})(-\d{2})?(-\d{2})?\.?$/.test(text)
    || /^\d{4}-\d{4}$/.test(text)
    || /^\d{4}\/\d{2}$/.test(text)
    || /^c\.?\s?\d{4}\.?$/.test(text)
    || /^ca\.?\s+\d{4}$/.test(text)
    || /^ca\.?\s+\d{4};\s+\d{4}s;\s+\d{4}s$/.test(text)
    || /^circa\s+\d{4}\.?$/.test(text)
    || /^\[between\s+\d{4}\s+and\s+\d{4}\]$/.test(text)
    || /^\[ca\.?\s+\d{4}\]$/.test(text);
}

function validUrl(value) {
  if (!hasValue(value)) return false;
  try {
    const url = new URL(String(value));
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function addIssue(issues, severity, code, recordId, field, detail) {
  issues.push({ severity, code, record_id: recordId, field, detail });
}

function citedIds(labels) {
  return new Set(labels.flatMap((label) => label.gold_evidence_ids || []));
}

export function checkEvidenceValues(recordsFile = recordsPath, labelsFile = labelsPath) {
  const records = readJsonl(recordsFile);
  const labels = readJsonl(labelsFile);
  const cited = citedIds(labels);
  const issues = [];
  const idCounts = new Map();

  for (const record of records) {
    const id = record.record_id || record.id;
    idCounts.set(id, (idCounts.get(id) || 0) + 1);
  }

  for (const [id, count] of idCounts.entries()) {
    if (!hasValue(id)) {
      addIssue(issues, "fail", "V001_missing_record_id", "(missing)", "record_id", "record id is empty");
    } else if (count > 1) {
      addIssue(issues, "fail", "V002_duplicate_record_id", id, "record_id", `appears ${count} times`);
    }
  }

  for (const record of records) {
    const id = record.record_id || record.id;
    if (!cited.has(id)) continue;

    if (!validDateText(record.date_text)) {
      addIssue(issues, "warn", "V101_suspicious_date_text", id, "date_text", `value=${record.date_text}`);
    }
    if (!validUrl(record.source?.url)) {
      addIssue(issues, "fail", "V003_invalid_source_url", id, "source.url", `value=${record.source?.url}`);
    }
    if (!hasValue(record.title) || /^placeholder\b/i.test(String(record.title).trim())) {
      addIssue(issues, "fail", "V004_invalid_title", id, "title", "title is empty or placeholder-like");
    }
    if (hasValue(record.image_state?.code) && !/^IMG\d{2}$/.test(record.image_state.code)) {
      addIssue(issues, "warn", "V102_nonstandard_image_state_code", id, "image_state.code", `value=${record.image_state.code}`);
    }
  }

  return {
    checked_record_count: cited.size,
    fail_count: issues.filter((issue) => issue.severity === "fail").length,
    warn_count: issues.filter((issue) => issue.severity === "warn").length,
    issues
  };
}

function writeReports(result) {
  fs.writeFileSync(reportJsonPath, JSON.stringify({ generated_at: new Date().toISOString(), ...result }, null, 2) + "\n");
  const rows = result.issues.length === 0
    ? "| none | none | none | none | none |"
    : result.issues.map((issue) => `| ${issue.severity} | ${issue.code} | ${issue.record_id} | ${issue.field} | ${issue.detail} |`).join("\n");
  fs.writeFileSync(reportMdPath, `# Evidence Value Check v0

Generated: ${new Date().toISOString()}

This scan checks value-level validity for cited evidence fields. It complements
the evidence health scan by checking parseable date text, URL shape, title
placeholders, image-state code shape, and record-id uniqueness.

## Summary

- Cited records checked: ${result.checked_record_count}
- Fail findings: ${result.fail_count}
- Warning findings: ${result.warn_count}

## Issues

| Severity | Code | Record | Field | Detail |
|---|---|---|---|---|
${rows}
`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const result = checkEvidenceValues(positional[0] || recordsPath, positional[1] || labelsPath);
  writeReports(result);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, reportMdPath),
    checked_record_count: result.checked_record_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count
  }, null, 2));
  if (process.argv.includes("--strict") && result.fail_count > 0) process.exitCode = 1;
}
