#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  INTENT_SPECIFIC_MUST_NOT_INVENT_FIELDS,
  KNOWN_INTENTS
} from "./audit_rules.mjs";
import { validateGenerationContract } from "./validate_generation_contract.mjs";
import { checkEvidenceValues } from "./evidence_value_check.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultQueriesPath = path.join(repoRoot, "fixtures/gold/queries.jsonl");
const defaultLabelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const defaultRecordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const defaultAnswersPath = path.join(repoRoot, "reports/webllm_round_02_answers.jsonl");
const defaultReviewFixturePath = path.join(repoRoot, "reports/review_fixture_round_02.jsonl");
const defaultJsonOutPath = path.join(repoRoot, "reports/anomaly_detection_round_02.json");
const defaultMdOutPath = path.join(repoRoot, "reports/ANOMALY_DETECTION_ROUND_02.md");

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function parseArgs(args) {
  const parsed = {
    queriesPath: defaultQueriesPath,
    labelsPath: defaultLabelsPath,
    recordsPath: defaultRecordsPath,
    answersPath: defaultAnswersPath,
    reviewFixturePath: defaultReviewFixturePath,
    jsonOutPath: defaultJsonOutPath,
    mdOutPath: defaultMdOutPath,
    onlyAnswered: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--review-fixture") parsed.reviewFixturePath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--only-answered") parsed.onlyAnswered = true;
  }
  return parsed;
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function recordHasField(record, field) {
  const readers = {
    record_id: (item) => hasValue(item.record_id),
    title: (item) => hasValue(item.title),
    creator: (item) => hasValue(item.creator),
    date: (item) => hasValue(item.date_text) || hasValue(item.date_start) || hasValue(item.date_end),
    date_text: (item) => hasValue(item.date_text),
    region: (item) => hasValue(item.region),
    source: (item) => hasValue(item.source?.name) || hasValue(item.source?.url),
    rights: (item) => hasValue(item.rights?.state) || hasValue(item.rights?.label),
    image_state: (item) => hasValue(item.image_state?.code),
    reuse_permission: (item) => hasValue(item.rights_interpretation?.reuse_permission),
    public_domain_status: (item) => hasValue(item.rights_interpretation?.public_domain_status),
    first_or_earliest_claim: (item) => hasValue(item.first_or_earliest_claim),
    topology: (item) => hasValue(item.topology),
    method_context: (item) => hasValue(item.method_context)
  };
  return (readers[field] || ((item) => hasValue(item[field])))(record);
}

function add(anomalies, severity, code, queryId, detail, extra = {}) {
  anomalies.push({ severity, code, query_id: queryId || null, detail, ...extra });
}

function distribution(rows) {
  const counts = new Map();
  for (const row of rows) counts.set(row.intent, (counts.get(row.intent) || 0) + 1);
  const total = rows.length || 1;
  return Object.fromEntries([...counts.entries()].map(([intent, count]) => [intent, count / total]));
}

function checkAnswerBehavior(anomalies, labels, answers) {
  const labelsById = new Map(labels.map((label) => [label.query_id, label]));
  const completed = answers.filter((answer) => answer.generation_status === "completed");
  const tpsValues = completed.map((answer) => answer.tokens_per_second).filter((value) => typeof value === "number" && Number.isFinite(value));
  const avgTps = tpsValues.length === 0 ? null : tpsValues.reduce((sum, value) => sum + value, 0) / tpsValues.length;

  for (const answer of answers) {
    const label = labelsById.get(answer.query_id);
    if (!label) continue;
    const text = String(answer.answer_text || "");
    if (label.refusal_expected && text.length > 150) {
      add(anomalies, "warn", "M1_refusal_answer_too_long", answer.query_id, `length=${text.length}; threshold=150`);
    }
    if (!label.refusal_expected && text.length < 50) {
      add(anomalies, "warn", "M1_answerable_answer_too_short", answer.query_id, `length=${text.length}; threshold=50`);
    }
    if (avgTps !== null && typeof answer.tokens_per_second === "number" && answer.tokens_per_second < avgTps * 0.5) {
      add(anomalies, "warn", "M2_generation_speed_low", answer.query_id, `tokens_per_second=${answer.tokens_per_second.toFixed(2)}; avg=${avgTps.toFixed(2)}`);
    }
  }
}

function checkEvidenceLabelAlignment(anomalies, labels, recordsById) {
  for (const label of labels) {
    const records = (label.gold_evidence_ids || []).map((id) => recordsById.get(id)).filter(Boolean);
    for (const field of label.required_fields || []) {
      if (!label.refusal_expected && !records.some((record) => recordHasField(record, field))) {
        add(anomalies, "fail", "M3_required_field_missing_in_evidence", label.query_id, `field=${field}`, { field });
      }
    }
    const intentSpecific = INTENT_SPECIFIC_MUST_NOT_INVENT_FIELDS[label.intent] || [];
    for (const field of intentSpecific) {
      if (!label.refusal_expected && !records.some((record) => recordHasField(record, field))) {
        add(anomalies, "fail", "M4_must_not_invent_no_evidence", label.query_id, `field=${field}`, { field });
      }
    }
  }
}

function checkReviewState(anomalies, reviewRows) {
  for (const row of reviewRows) {
    const hasWarnings = (row.contract_findings || []).some((finding) => finding.severity === "warn");
    const accepted = ["accept", "accept_with_notes"].includes(row.reviewer_decision);
    if (accepted && hasWarnings && !String(row.reviewer_notes || "").trim()) {
      add(anomalies, "warn", "M5_reviewed_with_unresolved_warnings", row.query_id, "accepted row has contract warnings but no reviewer notes");
    }
  }
}

function checkDistributionDrift(anomalies, labels, baselineLabels) {
  const current = distribution(labels);
  const baseline = distribution(baselineLabels);
  for (const intent of KNOWN_INTENTS) {
    const currentRatio = current[intent] || 0;
    const baselineRatio = baseline[intent] || 0;
    if (currentRatio > 0.4) {
      add(anomalies, "warn", "M7_intent_exceeds_40_percent", null, `${intent}=${(currentRatio * 100).toFixed(1)}%`, { intent });
    }
    if (Math.abs(currentRatio - baselineRatio) > 0.15) {
      add(anomalies, "info", "M7_intent_distribution_shift", null, `${intent}: baseline=${baselineRatio.toFixed(3)} current=${currentRatio.toFixed(3)}`, { intent });
    }
  }
}

export function detectAnomalies({
  queriesPath = defaultQueriesPath,
  labelsPath = defaultLabelsPath,
  recordsPath = defaultRecordsPath,
  answersPath = defaultAnswersPath,
  reviewFixturePath = defaultReviewFixturePath,
  onlyAnswered = false
} = {}) {
  const allLabels = readJsonl(labelsPath);
  const records = readJsonl(recordsPath);
  const answers = readJsonl(answersPath);
  const reviewRows = readJsonl(reviewFixturePath);
  const answeredIds = new Set(answers.map((answer) => answer.query_id || answer.id).filter(Boolean));
  const labels = onlyAnswered ? allLabels.filter((label) => answeredIds.has(label.query_id)) : allLabels;
  const recordsById = new Map(records.map((record) => [record.record_id, record]));
  const anomalies = [];

  checkAnswerBehavior(anomalies, labels, answers);
  checkEvidenceLabelAlignment(anomalies, labels, recordsById);
  checkReviewState(anomalies, reviewRows);
  checkDistributionDrift(anomalies, labels, labels);

  const evidenceValue = checkEvidenceValues(recordsPath, labelsPath);
  for (const issue of evidenceValue.issues) {
    add(anomalies, issue.severity, `M6_${issue.code}`, null, `${issue.record_id} ${issue.field}: ${issue.detail}`, { record_id: issue.record_id, field: issue.field });
  }

  const contract = validateGenerationContract({
    queriesPath,
    labelsPath,
    recordsPath,
    answersPath,
    allowedQueryIds: onlyAnswered ? answeredIds : null
  });
  for (const violation of contract.violations) {
    if (violation.severity === "fail") {
      add(anomalies, "fail", `contract_${violation.code}`, violation.query_id, violation.detail, { field: violation.field });
    }
  }

  return {
    _provenance: {
      step: "detect_anomalies",
      timestamp: new Date().toISOString(),
      labels_path: path.relative(repoRoot, labelsPath),
      answers_path: path.relative(repoRoot, answersPath),
      records_path: path.relative(repoRoot, recordsPath),
      review_fixture_path: fs.existsSync(reviewFixturePath) ? path.relative(repoRoot, reviewFixturePath) : null,
      only_answered: onlyAnswered
    },
    label_count: labels.length,
    answer_count: answers.length,
    anomaly_count: anomalies.length,
    fail_count: anomalies.filter((item) => item.severity === "fail").length,
    warn_count: anomalies.filter((item) => item.severity === "warn").length,
    info_count: anomalies.filter((item) => item.severity === "info").length,
    anomalies
  };
}

function markdown(result) {
  const rows = result.anomalies.length === 0
    ? "| none | none | none | none | none |"
    : result.anomalies.map((item) => `| ${item.severity} | ${item.code} | ${item.query_id || item.record_id || "batch"} | ${item.field || item.intent || "n/a"} | ${item.detail} |`).join("\n");
  return `# Anomaly Detection Round 02

Generated: ${result._provenance.timestamp}

This scan catches runtime, evidence-label, review-state, distribution, and
evidence-value anomalies that are not fully represented by a single audit.

## Summary

- Labels: ${result.label_count}
- Answers: ${result.answer_count}
- Total anomalies: ${result.anomaly_count}
- Fail findings: ${result.fail_count}
- Warning findings: ${result.warn_count}
- Info findings: ${result.info_count}

## Findings

| Severity | Code | Query/Record | Field | Detail |
|---|---|---|---|---|
${rows}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const strict = process.argv.includes("--strict");
  const result = detectAnomalies(args);
  fs.writeFileSync(args.jsonOutPath, JSON.stringify(result, null, 2) + "\n");
  fs.writeFileSync(args.mdOutPath, markdown(result));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, args.mdOutPath),
    anomaly_count: result.anomaly_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count,
    info_count: result.info_count
  }, null, 2));
  if (strict && result.fail_count > 0) process.exitCode = 1;
}
