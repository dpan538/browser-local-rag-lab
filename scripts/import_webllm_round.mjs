#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateGenerationContract } from "./validate_generation_contract.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultRoundJsonPath = path.join(repoRoot, "reports/webllm_round_01.json");
const defaultAnswersPath = path.join(repoRoot, "reports/webllm_round_01_answers.jsonl");
const defaultReportMdPath = path.join(repoRoot, "reports/WEBLLM_ROUND_01.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function relative(filePath) {
  return path.relative(repoRoot, filePath);
}

function numbers(rows, field) {
  return rows
    .map((row) => row[field])
    .filter((value) => typeof value === "number" && Number.isFinite(value));
}

function average(rows, field) {
  const values = numbers(rows, field);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return Number(value).toFixed(digits);
}

function safeRows(payload) {
  if (!payload || !Array.isArray(payload.results)) {
    throw new Error("Input JSON must contain a top-level results array.");
  }
  return payload.results;
}

function answerRows(results) {
  return results.map((row) => ({
    query_id: row.query_id,
    intent: row.intent,
    lane: row.lane,
    variant_id: row.variant_id,
    producer: row.producer || "webllm_qwen3_5_0_8b_research_runtime",
    generation_status: row.generation_status,
    retrieved_ids: row.retrieved_ids,
    candidate_count: row.candidate_count,
    prompt_tokens_est: row.prompt_tokens_est,
    model_load_ms: row.model_load_ms,
    tokenization_ms: row.tokenization_ms ?? null,
    ttft_ms: row.ttft_ms,
    total_latency_ms: row.total_latency_ms,
    output_tokens: row.output_tokens,
    tokens_per_second: row.tokens_per_second,
    device_error: row.device_error ?? null,
    answer_text: row.answer_text || ""
  }));
}

function byStatus(rows) {
  return rows.reduce((acc, row) => {
    const status = row.generation_status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

function markdownReport({ payload, results, contract, outputJsonPath, answersPath }) {
  const completed = results.filter((row) => row.generation_status === "completed");
  const errors = results.filter((row) => row.generation_status !== "completed");
  const statusRows = Object.entries(byStatus(results))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, count]) => `| ${status} | ${count} |`)
    .join("\n");
  const errorRows = errors.length === 0
    ? "| none | none | none |"
    : errors.map((row) => `| ${row.query_id || "unknown"} | ${row.generation_status || "unknown"} | ${String(row.error || row.device_error || "").replaceAll("\n", " ")} |`).join("\n");
  const violationRows = contract.violations.length === 0
    ? "| none | none | none | none | none |"
    : contract.violations.map((item) => `| ${item.severity} | ${item.query_id} | ${item.code} | ${item.field} | ${item.detail} |`).join("\n");

  return `# WebLLM Round 01

Generated: ${new Date().toISOString()}

## Scope

This report imports a browser-exported WebLLM custom-model run for
\`Qwen3.5-0.8B-q4f16_1-MLC\`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: ${relative(outputJsonPath)}
- Generated answer JSONL: ${relative(answersPath)}
- Variant: ${payload.meta?.variant_id || "unknown"}
- Model id: ${payload.meta?.model_id || "unknown"}
- WebGPU status: ${payload.meta?.webgpu?.status || "unknown"}

## Runtime Summary

- Result rows: ${results.length}
- Completed rows: ${completed.length}
- Error rows: ${errors.length}
- Average TTFT: ${formatNumber(average(completed, "ttft_ms"))} ms
- Average total latency: ${formatNumber(average(completed, "total_latency_ms"))} ms
- Average tokens/s: ${formatNumber(average(completed, "tokens_per_second"), 2)}
- Average prompt tokens estimate: ${formatNumber(average(completed, "prompt_tokens_est"))}

## Status Counts

| Status | Count |
|---|---:|
${statusRows || "| none | 0 |"}

## Contract Gate

- Answers checked: ${contract.answer_count}
- Expected labels: ${contract.label_count}
- Fail findings: ${contract.fail_count}
- Warning findings: ${contract.warn_count}

| Severity | Query | Code | Field | Detail |
|---|---|---|---|---|
${violationRows}

## Runtime Errors

| Query | Status | Error |
|---|---|---|
${errorRows}

## Interpretation

- A paper-quality round requires all 30 seed queries to complete or an explicit
  failure-analysis table for device/runtime failures.
- Contract failures block generated-answer quality claims.
- Contract warnings can still be useful for prompt and evidence-packet tuning,
  but they should not be reported as faithful answers without review.
`;
}

export function importWebllmRound(inputPath, {
  outputJsonPath = defaultRoundJsonPath,
  answersPath = defaultAnswersPath,
  reportMdPath = defaultReportMdPath
} = {}) {
  if (!inputPath) throw new Error("inputPath is required");
  const payload = readJson(inputPath);
  const results = safeRows(payload);

  fs.writeFileSync(outputJsonPath, JSON.stringify({
    imported_at: new Date().toISOString(),
    source_export_path: path.basename(inputPath),
    ...payload
  }, null, 2) + "\n");

  writeJsonl(answersPath, answerRows(results));
  const contract = validateGenerationContract({ answersPath });
  fs.writeFileSync(reportMdPath, markdownReport({ payload, results, contract, outputJsonPath, answersPath }));

  return {
    report: relative(reportMdPath),
    imported_json: relative(outputJsonPath),
    answers: relative(answersPath),
    result_count: results.length,
    completed_count: results.filter((row) => row.generation_status === "completed").length,
    error_count: results.filter((row) => row.generation_status !== "completed").length,
    contract_fail_count: contract.fail_count,
    contract_warn_count: contract.warn_count
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
  if (!inputPath) {
    console.error("Usage: node scripts/import_webllm_round.mjs <browser_export.json> [--strict]");
    process.exit(1);
  }

  try {
    const summary = importWebllmRound(inputPath);
    console.log(JSON.stringify(summary, null, 2));
    if (process.argv.includes("--strict")) {
      if (summary.completed_count === 0 || summary.contract_fail_count > 0) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error?.message || String(error));
    process.exit(1);
  }
}
