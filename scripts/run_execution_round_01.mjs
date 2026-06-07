#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { validateGenerationContract } from "./validate_generation_contract.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const labelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const queriesPath = path.join(repoRoot, "fixtures/gold/queries.jsonl");
const recordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const retrievalPath = path.join(repoRoot, "reports/retrieval_sufficiency_v0.json");
const answersPath = path.join(repoRoot, "reports/execution_round_01_answers.jsonl");
const reportJsonPath = path.join(repoRoot, "reports/execution_round_01.json");
const reportMdPath = path.join(repoRoot, "reports/EXECUTION_ROUND_01.md");
const variantId = "top3_compressed_topology_source_rights";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function splitIds(value) {
  return String(value || "").split("|").filter(Boolean);
}

function fieldValues(record, field) {
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
  return [...new Set((valuesByField[field] || [record[field]]).flat().filter(hasValue).map((value) => String(value)))];
}

function packetFieldLine(records, field) {
  const values = records.flatMap((record) => fieldValues(record, field));
  const unique = [...new Set(values)].slice(0, 4);
  if (unique.length === 0) return `${field}: not available in retrieved packet`;
  return `${field}: ${unique.join(" | ")}`;
}

function refusalAnswer(label) {
  if (label.intent === "first_earliest_claim") {
    return "Not enough evidence to answer from this packet. The retrieved evidence does not include chronology proof or a first_or_earliest_claim field, so this should be refused or narrowed.";
  }
  if (label.intent === "no_evidence_refusal") {
    return "Not enough evidence to answer from this packet. No retrieved archive evidence supports the requested claim, so this should be refused or narrowed.";
  }
  return "Not enough evidence to answer from this packet. The required evidence fields are not complete enough, so this should be refused or narrowed.";
}

function answerFor(label, query, records, retrievalRow) {
  if (label.refusal_expected) return refusalAnswer(label);
  const lines = [
    `Lane: ${label.gold_lane}`,
    `Query: ${query.query_text}`,
    "Evidence packet: top3 compressed with topology and source/rights.",
    `Retrieved ids: ${retrievalRow.retrieved_ids || "none"}`
  ];
  for (const field of label.required_fields || []) {
    lines.push(packetFieldLine(records, field));
  }
  lines.push("Evidence boundary: AI output is experimental text and not archive evidence.");
  if (label.intent === "source_rights_question") {
    lines.push("Rights caveat: reuse and public-domain status remain conservative fixture interpretations; verify the source page before reuse.");
  }
  return lines.join("\n");
}

function summaryByIntent(rows) {
  return rows.reduce((acc, row) => {
    acc[row.intent] ||= { total: 0, refusal_expected: 0 };
    acc[row.intent].total += 1;
    if (row.refusal_expected) acc[row.intent].refusal_expected += 1;
    return acc;
  }, {});
}

const labels = readJsonl(labelsPath);
const queries = new Map(readJsonl(queriesPath).map((query) => [query.query_id, query]));
const records = new Map(readJsonl(recordsPath).map((record) => [record.record_id, record]));
const retrieval = readJson(retrievalPath).rows.filter((row) => row.variant_id === variantId);
const retrievalByQuery = new Map(retrieval.map((row) => [row.query_id, row]));

const answerRows = labels.map((label) => {
  const query = queries.get(label.query_id);
  const retrievalRow = retrievalByQuery.get(label.query_id);
  const retrievedRecords = splitIds(retrievalRow?.retrieved_ids).map((id) => records.get(id)).filter(Boolean);
  const answerText = answerFor(label, query, retrievedRecords, retrievalRow || {});
  return {
    query_id: label.query_id,
    intent: label.intent,
    lane: label.gold_lane,
    variant_id: variantId,
    producer: "deterministic_contract_probe_no_qwen",
    generation_status: "not_qwen_contract_probe",
    retrieved_ids: retrievalRow?.retrieved_ids || "",
    candidate_count: Number(retrievalRow?.candidate_count || 0),
    prompt_tokens_est: Number(retrievalRow?.prompt_tokens_est || 0),
    model_load_ms: null,
    tokenization_ms: null,
    ttft_ms: null,
    total_latency_ms: null,
    output_tokens: answerText.split(/\s+/).filter(Boolean).length,
    tokens_per_second: null,
    device_error: "not_run_no_model_download",
    answer_text: answerText
  };
});

writeJsonl(answersPath, answerRows);
const contract = validateGenerationContract({ answersPath });

const report = {
  generated_at: new Date().toISOString(),
  round_id: "execution_round_01",
  variant_id: variantId,
  producer: "deterministic_contract_probe_no_qwen",
  scope: "First controlled execution of the post-retrieval answer contract. This is not a Qwen/WebGPU runtime run.",
  answer_count: answerRows.length,
  by_intent: summaryByIntent(labels),
  contract: {
    fail_count: contract.fail_count,
    warn_count: contract.warn_count,
    violations: contract.violations
  },
  runtime: {
    qwen_generation_run: false,
    model_load_ms: null,
    tokenization_ms: null,
    ttft_ms: null,
    total_latency_ms: null,
    tokens_per_second: null,
    webgpu_error: "not_run_no_model_download"
  }
};

fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2) + "\n");

const violationRows = contract.violations.length === 0
  ? "| none | none | none | none | none |"
  : contract.violations.map((item) => `| ${item.severity} | ${item.query_id} | ${item.code} | ${item.field} | ${item.detail} |`).join("\n");
const intentRows = Object.entries(report.by_intent)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([intent, row]) => `| ${intent} | ${row.total} | ${row.refusal_expected} |`).join("\n");

fs.writeFileSync(reportMdPath, `# Execution Round 01

Generated: ${report.generated_at}

## Scope

This is the first controlled execution round for the research lab. It uses the
approved \`${variantId}\` packet and a deterministic contract-probe answer
producer. It does not run Qwen, WebGPU, WebLLM, ONNX Runtime WebGPU, model
downloads, or browser cache writes.

The purpose is to verify the complete answer-artifact and post-generation
contract path before replacing the producer with browser-local Qwen generation.

## Summary

- Answers produced: ${report.answer_count}
- Producer: ${report.producer}
- Contract fail findings: ${contract.fail_count}
- Contract warning findings: ${contract.warn_count}
- Qwen generation run: no
- WebGPU runtime run: no

## By Intent

| Intent | Answers | Refusal expected |
|---|---:|---:|
${intentRows}

## Contract Findings

| Severity | Query | Code | Field | Detail |
|---|---|---|---|---|
${violationRows}

## Interpretation

- Fail findings would block a Qwen execution round.
- Warning findings identify packet/answer alignment issues that should be
  reviewed before claiming generated-answer quality.
- The next round can replace the deterministic producer with Qwen while keeping
  the same answer JSONL contract and validation scripts.
`);

console.log(JSON.stringify({
  report: path.relative(repoRoot, reportMdPath),
  answers: path.relative(repoRoot, answersPath),
  answer_count: answerRows.length,
  contract_fail_count: contract.fail_count,
  contract_warn_count: contract.warn_count
}, null, 2));

if (contract.fail_count > 0) process.exitCode = 1;
