#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  ANOMALY_THRESHOLDS,
  CHRONOLOGY_PROOF_INTENTS,
  INTENT_LANE_MAP,
  INTENT_SPECIFIC_MUST_NOT_INVENT_FIELDS,
  KNOWN_INTENTS,
  KNOWN_LANES,
  MANDATORY_REFUSAL_INTENTS,
  METHOD_REVIEW_INTENTS,
  REQUIRED_FIELDS_BY_INTENT,
  STABLE_RULE_REQUIRED_FIELDS,
  STRUCTURAL_SCHEMA,
  expectedMustNotInventFields,
  intentHintFindings,
  stableRuleConfigFindings
} from "./audit_rules.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const goldDir = path.join(repoRoot, "fixtures/gold");
const reportPath = path.join(repoRoot, "reports/GOLD_LABEL_AUDIT_v0.md");
const jsonPath = path.join(repoRoot, "reports/gold_label_audit_v0.json");
const strictMode = process.argv.includes("--strict");

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

function addFinding(findings, severity, code, detail) {
  findings.push({ severity, code, detail });
}

function typeOf(value) {
  return Array.isArray(value) ? "array" : typeof value;
}

function validateShape(record, schema, prefix, findings) {
  for (const [field, expectedType] of Object.entries(schema)) {
    if (!(field in record)) {
      addFinding(findings, "fail", `C000_missing_${prefix}_field`, field);
      continue;
    }
    const actualType = typeOf(record[field]);
    if (actualType !== expectedType) {
      addFinding(findings, "fail", `C000_invalid_${prefix}_field_type`, `${field}: expected ${expectedType}, got ${actualType}`);
    }
  }
}

function arrayIncludesAll(actual = [], expected = []) {
  const set = new Set(actual);
  return expected.every((item) => set.has(item));
}

function missingItems(actual = [], expected = []) {
  const set = new Set(actual);
  return expected.filter((item) => !set.has(item));
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function recordHasField(record, field) {
  const fieldReaders = {
    date: (item) => hasValue(item.date_text) || hasValue(item.date_start) || hasValue(item.date_end),
    date_text: (item) => hasValue(item.date_text),
    image_state: (item) => hasValue(item.image_state) && hasValue(item.image_state.code),
    chronology_proof: (item) => item.chronology_proof === true,
    first_or_earliest_claim: (item) => hasValue(item.first_or_earliest_claim),
    method_context: (item) => hasValue(item.method_context),
    public_domain_status: (item) => hasValue(item.rights_interpretation?.public_domain_status),
    reuse_permission: (item) => hasValue(item.rights_interpretation?.reuse_permission),
    rights: (item) => hasValue(item.rights) && (hasValue(item.rights.label) || hasValue(item.rights.state)),
    source: (item) => hasValue(item.source) && (hasValue(item.source.url) || hasValue(item.source.name)),
    topology: (item) => hasValue(item.topology)
  };
  const reader = fieldReaders[field] || ((item) => hasValue(item[field]));
  return reader(record);
}

function evidenceHasFields(records, fields) {
  if (fields.length === 0) return true;
  if (records.length === 0) return false;
  return records.some((record) => fields.every((field) => recordHasField(record, field)));
}

function evidenceMissingFields(records, fields) {
  if (records.length === 0) return fields;
  return fields.filter((field) => !records.some((record) => recordHasField(record, field)));
}

function isSimpleObjectQuery(label) {
  return ["current_object_explanation", "source_rights_question"].includes(label.intent);
}

function normalized(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function evidenceMentionedByQuery(record, queryText) {
  const query = normalized(queryText);
  const id = normalized(record.record_id);
  const title = normalized(record.title);
  return (id && query.includes(id))
    || (title && query.includes(title))
    || (title.length > 18 && query.includes(title.slice(0, 18)));
}

function regionEvidenceMatchesQuery(record, queryText) {
  const query = normalized(queryText);
  const region = normalized(record.region);
  const title = normalized(record.title);
  const haystack = `${region} ${title}`;
  if (query.includes("france")) return haystack.includes("france");
  if (query.includes("latin america")) return region.includes("latin america");
  if (query.includes("asia")) return region.includes("asia") || region.includes("china") || region.includes("india") || region.includes("vietnam") || title.includes("tokyo");
  if (query.includes("japan")) return region.includes("japan") || title.includes("tokyo");
  if (query.includes("russia") || query.includes("soviet")) return region.includes("russia") || title.includes("russia") || title.includes("soviet");
  return true;
}

function periodEvidenceMatchesQuery(record, queryText) {
  const query = normalized(queryText);
  const date = Number(record.date_start ?? Number.parseInt(record.date_text, 10));
  if (!Number.isFinite(date)) return false;
  if (query.includes("nineteenth")) return date >= 1800 && date <= 1899;
  if (query.includes("twentieth")) return date >= 1900 && date <= 1999;
  if (query.includes("1960s")) return date >= 1960 && date <= 1969;
  return true;
}

function classify(label, query, recordsById, recordsByRecordId) {
  const findings = [];
  validateShape(label, STRUCTURAL_SCHEMA.label, "label", findings);

  if (!query) {
    addFinding(findings, "fail", "C000_missing_query", label.query_id);
  } else {
    validateShape(query, STRUCTURAL_SCHEMA.query, "query", findings);
  }

  if (!KNOWN_INTENTS.includes(label.intent)) {
    addFinding(findings, "fail", "C001_unknown_intent", label.intent);
  }

  if (!KNOWN_LANES.includes(label.gold_lane)) {
    addFinding(findings, "fail", "C001_unknown_lane", label.gold_lane);
  }

  if (query && query.intent !== label.intent) {
    addFinding(findings, "fail", "C001_query_label_intent_mismatch", `query=${query.intent}; label=${label.intent}`);
  }

  if (query && query.expected_lane !== label.gold_lane) {
    addFinding(findings, "warn", "C011_query_label_lane_differs", `query=${query.expected_lane}; label=${label.gold_lane}`);
  }

  if (query) {
    findings.push(...intentHintFindings(query.query_text, label.intent));
  }

  const allowedLanes = INTENT_LANE_MAP[label.intent] || [];
  if (allowedLanes.length === 0) {
    addFinding(findings, "fail", "C002_no_lane_rule_for_intent", label.intent);
  } else if (!allowedLanes.includes(label.gold_lane)) {
    addFinding(findings, "fail", "C002_invalid_intent_lane", `${label.intent} cannot use ${label.gold_lane}; allowed=${allowedLanes.join("|")}`);
  }

  if (MANDATORY_REFUSAL_INTENTS.includes(label.intent)) {
    if (label.refusal_expected !== true) {
      addFinding(findings, "fail", "C003_mandatory_refusal_missing", `${label.intent} requires refusal_expected=true`);
    }
    if (label.sufficient_context !== false) {
      addFinding(findings, "fail", "C004_mandatory_refusal_context_not_false", `${label.intent} requires sufficient_context=false`);
    }
  }

  if (label.sufficient_context === false && label.refusal_expected !== true) {
    addFinding(findings, "fail", "C005_insufficient_without_refusal", "sufficient_context=false requires refusal_expected=true");
  }

  if (label.sufficient_context === true && label.refusal_expected === true) {
    addFinding(findings, "warn", "C005_sufficient_but_refusal", "possible for policy refusal only; review manually");
  }

  const evidenceRecords = [];
  for (const id of label.gold_evidence_ids || []) {
    const record = recordsByRecordId.get(id);
    if (!recordsById.has(id) || !record) {
      addFinding(findings, "fail", "C014_missing_gold_evidence_record", id);
    } else {
      evidenceRecords.push(record);
    }
  }

  const expectedRequiredFields = REQUIRED_FIELDS_BY_INTENT[label.intent] || [];
  const missingRequiredFields = missingItems(label.required_fields, expectedRequiredFields);
  if (missingRequiredFields.length > 0 && !label.refusal_expected) {
    addFinding(findings, "fail", "C006_required_fields_incomplete", `missing=${missingRequiredFields.join("|")}`);
  }

  const expectedProtectedFields = expectedMustNotInventFields(label.intent);
  const missingMustNotInvent = missingItems(label.must_not_invent_fields, expectedProtectedFields);
  if (missingMustNotInvent.length > 0) {
    addFinding(findings, "fail", "C007_must_not_invent_incomplete", `missing=${missingMustNotInvent.join("|")}`);
  }

  const intentSpecificProtectedFields = INTENT_SPECIFIC_MUST_NOT_INVENT_FIELDS[label.intent] || [];
  const protectedFieldsMissingFromRequired = missingItems(label.required_fields, intentSpecificProtectedFields);
  if (protectedFieldsMissingFromRequired.length > 0 && !label.refusal_expected) {
    addFinding(findings, "fail", "C007_intent_protected_fields_not_required", `missing=${protectedFieldsMissingFromRequired.join("|")}`);
  }

  if (CHRONOLOGY_PROOF_INTENTS.includes(label.intent)) {
    const hasChronologyProof = evidenceHasFields(evidenceRecords, ["chronology_proof", "first_or_earliest_claim"]);
    if (!label.refusal_expected && !hasChronologyProof) {
      addFinding(findings, "fail", "C004_chronology_claim_without_proof", "answerable first/earliest claims require chronology_proof and first_or_earliest_claim");
    }
    if (label.refusal_expected && label.sufficient_context === false && hasChronologyProof) {
      addFinding(findings, "fail", "C013_refusal_has_chronology_proof", "chronology proof is present but label is a stable refusal");
    }
  }

  if (label.sufficient_context && evidenceRecords.length === 0) {
    addFinding(findings, "fail", "C014_sufficient_without_gold_evidence", "sufficient labels need at least one gold evidence record");
  }

  if (label.intent === "comparison" && !label.refusal_expected && evidenceRecords.length < 2) {
    addFinding(findings, "fail", "C009_comparison_needs_two_evidence_records", `count=${evidenceRecords.length}`);
  }

  if (label.intent === "region_period_recommendation" && !label.refusal_expected && evidenceRecords.length < 2) {
    addFinding(findings, "fail", "C009_route_needs_multiple_evidence_records", `count=${evidenceRecords.length}`);
  }

  if (!label.refusal_expected && expectedRequiredFields.length > 0) {
    const missingEvidenceFields = evidenceMissingFields(evidenceRecords, expectedRequiredFields);
    if (missingEvidenceFields.length > 0) {
      addFinding(findings, "fail", "C008_gold_evidence_missing_required_fields", `missing=${missingEvidenceFields.join("|")}`);
    }
  }

  if (!label.refusal_expected && intentSpecificProtectedFields.length > 0) {
    const missingProtectedEvidenceFields = evidenceMissingFields(evidenceRecords, intentSpecificProtectedFields);
    if (missingProtectedEvidenceFields.length > 0) {
      addFinding(findings, "fail", "C008_gold_evidence_missing_intent_protected_fields", `missing=${missingProtectedEvidenceFields.join("|")}`);
    }
  }

  if (isSimpleObjectQuery(label) && !label.refusal_expected && label.gold_evidence_ids.length !== 1) {
    addFinding(findings, "warn", "C009_simple_object_evidence_count_unusual", `count=${label.gold_evidence_ids.length}`);
  }

  if (!label.refusal_expected && query?.active_object_id && !label.gold_evidence_ids.includes(query.active_object_id)) {
    addFinding(findings, "fail", "C009_active_object_not_in_gold_evidence", query.active_object_id);
  }

  if (!label.refusal_expected && label.intent === "comparison" && query) {
    const mentionedCount = evidenceRecords.filter((record) => evidenceMentionedByQuery(record, query.query_text)).length;
    if (mentionedCount < 2) {
      addFinding(findings, "warn", "C012_comparison_evidence_not_named_in_query", `matched=${mentionedCount}; required=2`);
    }
  }

  if (!label.refusal_expected && label.intent === "region_period_recommendation" && query) {
    const offRoute = evidenceRecords.filter((record) => !regionEvidenceMatchesQuery(record, query.query_text) || !periodEvidenceMatchesQuery(record, query.query_text));
    if (offRoute.length > 0) {
      addFinding(findings, "warn", "C012_route_evidence_query_mismatch", offRoute.map((record) => record.record_id).join("|"));
    }
  }

  const stableRequiredFields = STABLE_RULE_REQUIRED_FIELDS[label.intent];
  const stableRulePossible = stableRequiredFields !== undefined
    && !METHOD_REVIEW_INTENTS.includes(label.intent)
    && findings.every((finding) => finding.severity !== "fail");
  const stableRuleFieldsPresent = stableRulePossible
    && (label.refusal_expected ? label.sufficient_context === false : evidenceHasFields(evidenceRecords, stableRequiredFields));

  if (stableRulePossible && label.refusal_expected && label.sufficient_context === false && stableRequiredFields.length > 0 && evidenceHasFields(evidenceRecords, stableRequiredFields)) {
    addFinding(findings, "fail", "C013_refusal_has_answerable_evidence", `stable fields present=${stableRequiredFields.join("|")}`);
  }

  if (stableRulePossible && !stableRuleFieldsPresent) {
    addFinding(findings, "warn", "C008_stable_rule_fields_missing", `stable fields missing=${stableRequiredFields.join("|")}`);
  }

  const failCount = findings.filter((finding) => finding.severity === "fail").length;
  const warnCount = findings.filter((finding) => finding.severity === "warn").length;
  const stableByRule = stableRulePossible && stableRuleFieldsPresent && failCount === 0;
  const needsHumanReview = !stableByRule || warnCount > 0 || METHOD_REVIEW_INTENTS.includes(label.intent);
  const finalState = failCount > 0 ? "FAIL" : stableByRule ? "STABLE_BY_RULE" : "NEEDS_HUMAN_REVIEW";

  return {
    query_id: label.query_id,
    intent: label.intent,
    gold_lane: label.gold_lane,
    final_state: finalState,
    stable_by_rule: stableByRule,
    needs_human_review: needsHumanReview,
    fail_count: failCount,
    warn_count: warnCount,
    findings
  };
}

function detectAnomalies(labels, recordsById) {
  const anomalies = [];
  const byIntent = new Map();
  const evidenceUsage = new Map();
  const labelCount = labels.length || 1;

  for (const label of labels) {
    const stats = byIntent.get(label.intent) || { total: 0, missing_required: 0 };
    stats.total += 1;
    if (!label.refusal_expected && (!label.required_fields || label.required_fields.length === 0)) stats.missing_required += 1;
    byIntent.set(label.intent, stats);

    for (const id of label.gold_evidence_ids || []) {
      evidenceUsage.set(id, (evidenceUsage.get(id) || 0) + 1);
    }
  }

  for (const [intent, stats] of byIntent.entries()) {
    const ratio = stats.missing_required / stats.total;
    if (!MANDATORY_REFUSAL_INTENTS.includes(intent) && ratio === 1) {
      anomalies.push({ severity: "warn", code: "A001_intent_all_labels_missing_required_fields", detail: intent });
    }
  }

  for (const [id, count] of evidenceUsage.entries()) {
    if (!recordsById.has(id)) continue;
    const ratio = count / labelCount;
    if (ratio > ANOMALY_THRESHOLDS.evidence_overuse_fail_ratio) {
      anomalies.push({ severity: "fail", code: "A002_evidence_overused_fail", detail: `${id} used ${count}/${labelCount} labels (${ratio.toFixed(3)})` });
    } else if (ratio >= ANOMALY_THRESHOLDS.evidence_overuse_warn_ratio) {
      anomalies.push({ severity: "warn", code: "A002_evidence_overused_warn", detail: `${id} used ${count}/${labelCount} labels (${ratio.toFixed(3)})` });
    }
  }

  for (const intent of KNOWN_INTENTS) {
    if (!byIntent.has(intent)) {
      anomalies.push({ severity: "warn", code: "A003_intent_not_covered", detail: intent });
    }
  }

  return anomalies;
}

const records = readJsonl(path.join(goldDir, "records.jsonl"));
const queries = new Map(readJsonl(path.join(goldDir, "queries.jsonl")).map((query) => [query.query_id, query]));
const labels = readJsonl(path.join(goldDir, "labels.jsonl"));
const recordsByRecordId = new Map(records.map((record) => [record.record_id, record]));
const recordsById = new Set(records.map((record) => record.record_id));
const audits = labels.map((label) => classify(label, queries.get(label.query_id), recordsById, recordsByRecordId));
const anomalies = detectAnomalies(labels, recordsById);
const rule_config_findings = stableRuleConfigFindings();

const byIntent = audits.reduce((acc, audit) => {
  acc[audit.intent] ||= { total: 0, stable_by_rule: 0, needs_human_review: 0, fails: 0, warnings: 0 };
  acc[audit.intent].total += 1;
  if (audit.stable_by_rule) acc[audit.intent].stable_by_rule += 1;
  if (audit.needs_human_review) acc[audit.intent].needs_human_review += 1;
  acc[audit.intent].fails += audit.fail_count;
  acc[audit.intent].warnings += audit.warn_count;
  return acc;
}, {});

const summary = {
  label_count: audits.length,
  stable_by_rule: audits.filter((audit) => audit.stable_by_rule).length,
  needs_human_review: audits.filter((audit) => audit.needs_human_review).length,
  fail_count: audits.reduce((sum, audit) => sum + audit.fail_count, 0),
  warn_count: audits.reduce((sum, audit) => sum + audit.warn_count, 0),
  anomaly_count: anomalies.length,
  anomaly_fail_count: anomalies.filter((anomaly) => anomaly.severity === "fail").length,
  rule_config_fail_count: rule_config_findings.filter((finding) => finding.severity === "fail").length,
  by_intent: Object.fromEntries(Object.entries(byIntent).sort(([a], [b]) => a.localeCompare(b)))
};

fs.writeFileSync(jsonPath, JSON.stringify({ generated_at: new Date().toISOString(), summary, audits, anomalies, rule_config_findings }, null, 2) + "\n");

const findingRows = audits
  .filter((audit) => audit.findings.length > 0 || audit.needs_human_review)
  .map((audit) => `| ${audit.query_id} | ${audit.intent} | ${audit.gold_lane} | ${audit.final_state} | ${audit.findings.map((finding) => `${finding.severity}:${finding.code}`).join("; ") || "method review"} |`);
const reviewQueueRows = findingRows.length === 0 ? "| none | none | none | none | none |" : findingRows.join("\n");

const anomalyRows = anomalies.length === 0
  ? "| none | none | none |"
  : anomalies.map((anomaly) => `| ${anomaly.severity} | ${anomaly.code} | ${anomaly.detail} |`).join("\n");
const ruleConfigRows = rule_config_findings.length === 0
  ? "| none | none | none |"
  : rule_config_findings.map((finding) => `| ${finding.severity} | ${finding.code} | ${finding.detail} |`).join("\n");

fs.writeFileSync(reportPath, `# Gold Label Audit v0

Generated: ${new Date().toISOString()}

This audit checks label consistency against the adjudication guide. It does not
judge generated model answers.

## Summary

- Labels: ${summary.label_count}
- Stable by rule: ${summary.stable_by_rule}
- Needs human/method review: ${summary.needs_human_review}
- Fail findings: ${summary.fail_count}
- Warning findings: ${summary.warn_count}
- Anomalies: ${summary.anomaly_count}
- Anomaly fail findings: ${summary.anomaly_fail_count}
- Rule config fail findings: ${summary.rule_config_fail_count}

## By Intent

| Intent | Total | Stable by rule | Needs review | Fails | Warnings |
|---|---:|---:|---:|---:|---:|
${Object.entries(summary.by_intent).map(([intent, row]) => `| ${intent} | ${row.total} | ${row.stable_by_rule} | ${row.needs_human_review} | ${row.fails} | ${row.warnings} |`).join("\n")}

## Review Queue

| Query | Intent | Lane | Final state | Findings |
|---|---|---|---|---|
${reviewQueueRows}

## Anomaly Scan

| Severity | Code | Detail |
|---|---|---|
${anomalyRows}

## Rule Config Scan

| Severity | Code | Detail |
|---|---|---|
${ruleConfigRows}

## Interpretation

- Stable-by-rule now requires intent-lane validity, no hard conflicts, and
  field-level evidence checks against the gold evidence records.
- Fail findings are label-contract errors that must be corrected before the
  affected labels can be used as paper evidence.
- When the review queue is empty, the label contract is ready for retrieval
  sufficiency experiments. This does not make generated model answers archive
  evidence.
`);

console.log(JSON.stringify({ summary, report: path.relative(repoRoot, reportPath), strict: strictMode }, null, 2));
if (strictMode && (summary.fail_count > 0 || summary.anomaly_fail_count > 0 || summary.rule_config_fail_count > 0)) {
  process.exitCode = 1;
}
