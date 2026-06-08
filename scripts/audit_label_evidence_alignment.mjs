#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function splitIds(value) {
  return String(value || "").split("|").filter(Boolean);
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function fieldValues(record = {}, field) {
  const valuesByField = {
    record_id: [record.record_id],
    title: [record.title],
    creator: [record.creator],
    date: [record.date_text, record.date_start, record.date_end],
    date_text: [record.date_text],
    region: [record.region],
    source: [record.source?.name, record.source?.url],
    rights: [record.rights?.state, record.rights?.label],
    image_state: [record.image_state?.code, record.image_state?.display_mode],
    reuse_permission: [record.rights_interpretation?.reuse_permission],
    public_domain_status: [record.rights_interpretation?.public_domain_status],
    first_or_earliest_claim: [record.first_or_earliest_claim],
    topology: [
      record.topology?.surface_type,
      record.topology?.publication_role,
      ...(record.topology?.folder_titles || [])
    ],
    method_context: Object.values(record.method_context || {})
  };
  return (valuesByField[field] || [record[field]])
    .flat()
    .filter(hasValue)
    .map((value) => String(value));
}

function valuesForRecords(records, field) {
  return [...new Set(records.flatMap((record) => fieldValues(record, field)))];
}

function parseArgs(args) {
  const parsed = {
    labelsPath: path.join(repoRoot, "fixtures/expansion/round02_200/labels.jsonl"),
    recordsPath: path.join(repoRoot, "fixtures/expansion/round02_200/records.jsonl"),
    retrievalPath: path.join(repoRoot, "reports/retrieval_sufficiency_200.json"),
    variantId: "top3_compressed_topology_source_rights",
    jsonOutPath: path.join(repoRoot, "reports/label_evidence_alignment_200.json"),
    mdOutPath: path.join(repoRoot, "reports/LABEL_EVIDENCE_ALIGNMENT_200.md"),
    checkRetrieval: true
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--retrieval") parsed.retrievalPath = path.resolve(args[++index]);
    else if (arg === "--variant") parsed.variantId = args[++index];
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--no-retrieval") parsed.checkRetrieval = false;
  }
  return parsed;
}

function addIssue(issues, issue) {
  issues.push({
    severity: issue.severity || "fail",
    query_id: issue.query_id,
    intent: issue.intent,
    layer: issue.layer,
    code: issue.code,
    field: issue.field || null,
    detail: issue.detail,
    evidence_ids: issue.evidence_ids || [],
    observed_values: issue.observed_values || [],
    suggested_action: issue.suggested_action || null
  });
}

function recordsForIds(ids, recordsById) {
  return ids.map((id) => recordsById.get(id)).filter(Boolean);
}

function auditLabelGold(label, recordsById, issues) {
  const goldIds = label.gold_evidence_ids || [];
  const goldRecords = recordsForIds(goldIds, recordsById);
  const missingRecords = goldIds.filter((id) => !recordsById.has(id));

  if (missingRecords.length > 0) {
    addIssue(issues, {
      query_id: label.query_id,
      intent: label.intent,
      layer: "gold_evidence",
      code: "missing_gold_record",
      detail: `gold evidence IDs are not present in records: ${missingRecords.join(", ")}`,
      evidence_ids: goldIds,
      suggested_action: "Add the missing records or relabel gold_evidence_ids."
    });
  }

  if (!label.refusal_expected && goldRecords.length === 0) {
    addIssue(issues, {
      query_id: label.query_id,
      intent: label.intent,
      layer: "gold_evidence",
      code: "answerable_without_gold_records",
      detail: "answerable label has no resolvable gold evidence records",
      evidence_ids: goldIds,
      suggested_action: "Attach gold evidence or mark as refusal."
    });
    return;
  }

  if (label.refusal_expected) return;

  for (const field of label.required_fields || []) {
    const values = valuesForRecords(goldRecords, field);
    if (values.length === 0) {
      addIssue(issues, {
        query_id: label.query_id,
        intent: label.intent,
        layer: "gold_evidence",
        code: "required_field_missing_in_gold",
        field,
        detail: `required field '${field}' has no value in gold evidence`,
        evidence_ids: goldIds,
        observed_values: goldRecords.slice(0, 2).map((record) => Object.keys(record).join(",")),
        suggested_action: "Backfill the field, change the gold evidence, or remove the field only after adjudication."
      });
    }
  }

  for (const field of label.must_not_invent_fields || []) {
    const values = valuesForRecords(goldRecords, field);
    if (values.length === 0) {
      addIssue(issues, {
        severity: "warn",
        query_id: label.query_id,
        intent: label.intent,
        layer: "gold_evidence",
        code: "must_not_invent_field_missing_in_gold",
        field,
        detail: `must-not-invent field '${field}' has no value in gold evidence`,
        evidence_ids: goldIds,
        suggested_action: "If the field may appear in the answer, backfill evidence; otherwise keep it as a protected absence."
      });
    }
  }
}

function auditRetrieval(label, retrievalByQuery, recordsById, issues) {
  const retrieval = retrievalByQuery.get(label.query_id);
  if (!retrieval) {
    addIssue(issues, {
      query_id: label.query_id,
      intent: label.intent,
      layer: "retrieval_packet",
      code: "missing_retrieval_row",
      detail: "no retrieval row found for query and variant",
      suggested_action: "Regenerate retrieval sufficiency report."
    });
    return;
  }

  const goldIds = label.gold_evidence_ids || [];
  const retrievedIds = splitIds(retrieval.retrieved_ids);
  const retrievedRecords = recordsForIds(retrievedIds, recordsById);
  const missingGoldIds = label.refusal_expected ? [] : goldIds.filter((id) => !retrievedIds.includes(id));

  if (missingGoldIds.length > 0) {
    addIssue(issues, {
      query_id: label.query_id,
      intent: label.intent,
      layer: "retrieval_packet",
      code: "retrieval_missing_gold_evidence",
      detail: `retrieved packet does not contain gold evidence IDs: ${missingGoldIds.join(", ")}`,
      evidence_ids: retrievedIds,
      observed_values: [`gold=${goldIds.join("|")}`, `retrieved=${retrievedIds.join("|")}`],
      suggested_action: "Fix retrieval/ranking, increase top-k, or adjudicate a non-exact evidence contract for this intent."
    });
  }

  if (label.refusal_expected) return;

  for (const field of label.required_fields || []) {
    const values = valuesForRecords(retrievedRecords, field);
    if (values.length === 0) {
      addIssue(issues, {
        query_id: label.query_id,
        intent: label.intent,
        layer: "retrieval_packet",
        code: "required_field_missing_in_retrieval",
        field,
        detail: `required field '${field}' has no value in retrieved packet`,
        evidence_ids: retrievedIds,
        suggested_action: "Do not run WebLLM until retrieval returns evidence with this field or the label is adjudicated."
      });
    }
  }
}

function countBy(rows, key) {
  const counts = {};
  for (const row of rows) {
    const value = row[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function markdown(report) {
  const failRows = report.issues.filter((issue) => issue.severity === "fail");
  const warnRows = report.issues.filter((issue) => issue.severity === "warn");
  const tableRows = report.issues.length === 0
    ? "| none | none | none | none | none | none |"
    : report.issues.slice(0, 120).map((issue) => `| ${issue.severity} | ${issue.query_id} | ${issue.intent} | ${issue.layer} | ${issue.code} | ${issue.field || ""} |`).join("\n");
  return `# Label Evidence Alignment 200

Generated: ${report.generated_at}

This audit checks whether label contracts can be satisfied by their gold
evidence and, when a retrieval report is supplied, by the retrieved packet that
will be sent to WebLLM.

## Summary

- Labels checked: ${report.summary.labels_checked}
- Fail issues: ${failRows.length}
- Warn issues: ${warnRows.length}
- Gold-evidence fail issues: ${report.summary.fail_by_layer.gold_evidence || 0}
- Retrieval-packet fail issues: ${report.summary.fail_by_layer.retrieval_packet || 0}
- Ready for oracle/WebLLM: ${report.summary.ready_for_oracle ? "yes" : "no"}

## Failures By Intent

\`\`\`json
${JSON.stringify(report.summary.fail_by_intent, null, 2)}
\`\`\`

## Failures By Code

\`\`\`json
${JSON.stringify(report.summary.fail_by_code, null, 2)}
\`\`\`

## Issues

| Severity | Query | Intent | Layer | Code | Field |
|---|---|---|---|---|---|
${tableRows}
`;
}

export function auditLabelEvidenceAlignment(options) {
  const labels = readJsonl(options.labelsPath);
  const recordsById = new Map(readJsonl(options.recordsPath).map((record) => [record.record_id || record.id, record]));
  const retrievalByQuery = options.checkRetrieval
    ? new Map(readJson(options.retrievalPath).rows
      .filter((row) => row.variant_id === options.variantId)
      .map((row) => [row.query_id, row]))
    : new Map();
  const issues = [];

  for (const label of labels) {
    auditLabelGold(label, recordsById, issues);
    if (options.checkRetrieval) auditRetrieval(label, retrievalByQuery, recordsById, issues);
  }

  const failIssues = issues.filter((issue) => issue.severity === "fail");
  const report = {
    generated_at: new Date().toISOString(),
    input_paths: {
      labels: path.relative(repoRoot, options.labelsPath),
      records: path.relative(repoRoot, options.recordsPath),
      retrieval: options.checkRetrieval ? path.relative(repoRoot, options.retrievalPath) : null,
      variant: options.variantId
    },
    summary: {
      labels_checked: labels.length,
      issue_count: issues.length,
      fail_count: failIssues.length,
      warn_count: issues.filter((issue) => issue.severity === "warn").length,
      fail_by_layer: countBy(failIssues, "layer"),
      fail_by_intent: countBy(failIssues, "intent"),
      fail_by_code: countBy(failIssues, "code"),
      ready_for_oracle: failIssues.length === 0
    },
    issues
  };
  fs.writeFileSync(options.jsonOutPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, markdown(report));
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const report = auditLabelEvidenceAlignment(options);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, options.mdOutPath),
    json: path.relative(repoRoot, options.jsonOutPath),
    ...report.summary
  }, null, 2));
  if (process.argv.includes("--strict") && !report.summary.ready_for_oracle) process.exitCode = 1;
}
