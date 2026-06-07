#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultExistingPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const defaultReportJsonPath = path.join(repoRoot, "reports/new_records_validation_v0.json");
const defaultReportMdPath = path.join(repoRoot, "reports/NEW_RECORDS_VALIDATION_v0.md");

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`${filePath}:${index + 1}: invalid JSON: ${error.message}`);
    }
  });
}

function parseArgs(args) {
  const parsed = { existingPath: defaultExistingPath, strict: false };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    if (arg === "--existing") parsed.existingPath = path.resolve(args[++index]);
    else if (arg === "--strict") parsed.strict = true;
  }
  parsed.newRecordsPath = positional[0] ? path.resolve(positional[0]) : null;
  return parsed;
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
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

function placeholderLike(value) {
  return !hasValue(value) || /^(placeholder|todo|tbd|unknown title)$/i.test(String(value).trim());
}

function isMethodContext(record) {
  return record.object_type === "method_context"
    || record.topology?.publication_role === "method_context"
    || hasValue(record.method_context);
}

function addIssue(issues, severity, code, recordId, field, detail) {
  issues.push({ severity, code, record_id: recordId || "(missing)", field, detail });
}

export function validateNewRecords(newRecordsPath, {
  existingPath = defaultExistingPath
} = {}) {
  if (!newRecordsPath) throw new Error("newRecordsPath is required");
  const existing = readJsonl(existingPath);
  const incoming = readJsonl(newRecordsPath);
  const existingIds = new Set(existing.map((record) => record.record_id).filter(hasValue));
  const seenIncoming = new Set();
  const issues = [];

  for (const record of incoming) {
    const id = record.record_id;
    if (!hasValue(id)) addIssue(issues, "fail", "N001_missing_record_id", id, "record_id", "record_id is required");
    if (existingIds.has(id)) addIssue(issues, "fail", "N002_duplicate_existing_record_id", id, "record_id", "already exists in fixture");
    if (seenIncoming.has(id)) addIssue(issues, "fail", "N003_duplicate_incoming_record_id", id, "record_id", "duplicate in new-record batch");
    if (hasValue(id)) seenIncoming.add(id);

    for (const field of ["title", "source", "rights", "date_text", "image_state", "topology"]) {
      if (!hasValue(record[field])) addIssue(issues, "fail", "N004_missing_baseline_field", id, field, "baseline field is required before merge");
    }
    if (placeholderLike(record.title)) addIssue(issues, "fail", "N005_placeholder_title", id, "title", "title is empty or placeholder-like");
    if (!validUrl(record.source?.url)) addIssue(issues, "fail", "N006_invalid_source_url", id, "source.url", `value=${record.source?.url}`);
    if (!hasValue(record.rights?.state) || !hasValue(record.rights?.label)) {
      addIssue(issues, "fail", "N007_rights_incomplete", id, "rights", "rights.state and rights.label are required");
    }
    if (!hasValue(record.image_state?.code)) addIssue(issues, "fail", "N008_image_state_code_missing", id, "image_state.code", "image_state.code is required");
    if (String(record.creator || "").trim().toLowerCase() === "unknown") {
      addIssue(issues, "warn", "N101_creator_unknown", id, "creator", "allowed but answers must not invent attribution");
    }
    if (String(record.rights?.state || "").trim().toLowerCase() === "unknown") {
      addIssue(issues, "warn", "N102_rights_unknown", id, "rights.state", "new record should not enter expansion without rights caveat");
    }

    if (isMethodContext(record)) {
      if (record.object_type !== "method_context") addIssue(issues, "fail", "N009_method_object_type_invalid", id, "object_type", "method context requires object_type=method_context");
      if (record.rights?.state !== "research_fixture") addIssue(issues, "fail", "N010_method_rights_invalid", id, "rights.state", "method context requires rights.state=research_fixture");
      if (record.image_state?.code !== "IMG00") addIssue(issues, "fail", "N011_method_image_state_invalid", id, "image_state.code", "method context requires image_state.code=IMG00");
      if (record.topology?.publication_role !== "method_context") addIssue(issues, "fail", "N012_method_topology_invalid", id, "topology.publication_role", "method context requires topology.publication_role=method_context");
      if (!hasValue(record.method_context)) addIssue(issues, "fail", "N013_method_context_missing", id, "method_context", "method_context object is required");
    } else if (!hasValue(record.notes?.compact) && !hasValue(record.notes?.raw)) {
      addIssue(issues, "warn", "N103_no_compact_or_raw_note", id, "notes", "record has no compact/raw note for retrieval text");
    }
  }

  const unknownRightsCount = incoming.filter((record) => String(record.rights?.state || "").trim().toLowerCase() === "unknown").length;
  if (incoming.length > 0 && unknownRightsCount / incoming.length > 0.2) {
    addIssue(issues, "warn", "N104_batch_rights_unknown_over_20_percent", "(batch)", "rights.state", `${unknownRightsCount}/${incoming.length} incoming records`);
  }

  return {
    new_record_count: incoming.length,
    fail_count: issues.filter((issue) => issue.severity === "fail").length,
    warn_count: issues.filter((issue) => issue.severity === "warn").length,
    issues
  };
}

function markdown(result, newRecordsPath) {
  const rows = result.issues.length === 0
    ? "| none | none | none | none | none |"
    : result.issues.map((issue) => `| ${issue.severity} | ${issue.code} | ${issue.record_id} | ${issue.field} | ${issue.detail} |`).join("\n");
  return `# New Records Validation v0

Generated: ${new Date().toISOString()}

Input: ${path.relative(repoRoot, newRecordsPath)}

This check validates proposed evidence records before they are merged into the
gold fixture. It is a pre-merge gate for the 200-query expansion.

## Summary

- New records checked: ${result.new_record_count}
- Fail findings: ${result.fail_count}
- Warning findings: ${result.warn_count}

## Findings

| Severity | Code | Record | Field | Detail |
|---|---|---|---|---|
${rows}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.newRecordsPath) {
    console.error("Usage: node scripts/validate_new_records.mjs <new_records.jsonl> [--existing fixtures/gold/records.jsonl] [--strict]");
    process.exit(1);
  }
  const result = validateNewRecords(args.newRecordsPath, { existingPath: args.existingPath });
  fs.writeFileSync(defaultReportJsonPath, JSON.stringify({
    _provenance: {
      step: "validate_new_records",
      timestamp: new Date().toISOString(),
      new_records_path: path.relative(repoRoot, args.newRecordsPath),
      existing_path: path.relative(repoRoot, args.existingPath)
    },
    ...result
  }, null, 2) + "\n");
  fs.writeFileSync(defaultReportMdPath, markdown(result, args.newRecordsPath));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, defaultReportMdPath),
    new_record_count: result.new_record_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count
  }, null, 2));
  if (args.strict && result.fail_count > 0) process.exitCode = 1;
}
