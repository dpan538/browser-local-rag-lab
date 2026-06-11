#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
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

function isDeterministicRow(row) {
  return row.deterministic === true || row.latency_bucket === "hybrid_system_latency";
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

function roundSlug(payload) {
  const id = String(payload.meta?.round_id || "webllm_round_01").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return id || "webllm_round_01";
}

function roundTitle(payload) {
  return roundSlug(payload).toUpperCase();
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function provenance(inputPath, payload) {
  return {
    step: "webllm_round_import",
    timestamp: new Date().toISOString(),
    commit: gitCommit(),
    input_path: path.basename(inputPath),
    packet_variant: payload.meta?.variant_id || "unknown",
    model_id: payload.meta?.model_id || "unknown",
    runtime: payload.meta?.runtime || "WebLLM/MLC custom model",
    webgpu_status: payload.meta?.webgpu?.status || "unknown",
    user_agent: payload.meta?.user_agent || "unknown"
  };
}

function resolveLabPath(value, fallback) {
  if (!value) return fallback;
  if (path.isAbsolute(value)) return value;
  const rootRelative = path.resolve(repoRoot, value);
  if (fs.existsSync(rootRelative)) return rootRelative;
  return path.resolve(repoRoot, "browser_lab", value);
}

function contractInputs(payload) {
  return {
    queriesPath: resolveLabPath(payload.meta?.queries_path, path.join(repoRoot, "fixtures/gold/queries.jsonl")),
    labelsPath: resolveLabPath(payload.meta?.labels_path, path.join(repoRoot, "fixtures/gold/labels.jsonl")),
    recordsPath: resolveLabPath(payload.meta?.records_path, path.join(repoRoot, "fixtures/gold/records.jsonl"))
  };
}

function metricIssues(results) {
  const issues = [];
  const requiredCompletedMetrics = [
    "model_load_ms",
    "ttft_ms",
    "total_latency_ms",
    "output_tokens",
    "tokens_per_second"
  ];
  results.forEach((row, index) => {
    if (!row.query_id) {
      issues.push({ row: index, query_id: "unknown", type: "missing_query_id", key: "query_id" });
    }
    if (row.generation_status === "completed") {
      for (const key of requiredCompletedMetrics) {
        const value = row[key];
        if (value === undefined || value === null || value === "") {
          issues.push({ row: index, query_id: row.query_id, type: "missing_metric", key });
        } else if (typeof value !== "number" || !Number.isFinite(value)) {
          issues.push({ row: index, query_id: row.query_id, type: "non_numeric_metric", key, value });
        } else if (value < 0) {
          issues.push({ row: index, query_id: row.query_id, type: "negative_metric", key, value });
        }
      }
      if (!("device_error" in row)) {
        issues.push({ row: index, query_id: row.query_id, type: "missing_metric", key: "device_error" });
      }
      if (!row.cache_state) {
        issues.push({ row: index, query_id: row.query_id, type: "missing_metric", key: "cache_state" });
      } else if (row.cache_state === "ambiguous") {
        issues.push({ row: index, query_id: row.query_id, type: "cache_state_ambiguous", key: "cache_state", value: row.cache_state });
      }
    } else if (!row.error && !row.device_error) {
      issues.push({ row: index, query_id: row.query_id, type: "missing_error_detail", key: "error" });
    }
  });
  return issues;
}

function answerRows(results) {
  return results.map((row) => ({
    query_id: row.query_id,
    intent: row.intent,
    lane: row.lane,
    variant_id: row.variant_id,
    prompt_variant: row.prompt_variant,
    producer: row.producer || "webllm_qwen3_5_0_8b_research_runtime",
    generation_status: row.generation_status,
    retrieved_ids: row.retrieved_ids,
    candidate_count: row.candidate_count,
    deterministic: row.deterministic === true,
    hybrid_lane: row.hybrid_lane || null,
    latency_bucket: row.latency_bucket || (row.deterministic ? "hybrid_system_latency" : "qwen_generation_latency"),
    prompt_tokens_est: row.prompt_tokens_est,
    model_load_ms: row.model_load_ms,
    tokenization_ms: row.tokenization_ms ?? null,
    cache_state: row.cache_state || "ambiguous",
    ttft_ms: row.ttft_ms,
    total_latency_ms: row.total_latency_ms,
    output_tokens: row.output_tokens,
    tokens_per_second: row.tokens_per_second,
    device_error: row.device_error ?? null,
    answer_text: row.answer_text || "",
    raw_answer_text: row.raw_answer_text || row.answer_text || ""
  }));
}

function byStatus(rows) {
  return rows.reduce((acc, row) => {
    const status = row.generation_status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

function markdownReport({ payload, results, contract, metrics, outputJsonPath, answersPath }) {
  const runtimeName = payload.meta?.runtime || "WebLLM/MLC custom model";
  const modelId = payload.meta?.model_id || "unknown";
  const modelLabel = payload.meta?.model_generation_label || (
    /qwen/i.test(modelId) ? "Qwen" : "Model"
  );
  const scopeLabel = runtimeName.includes("WebLLM")
    ? "browser-exported WebLLM custom-model run"
    : `${runtimeName} run`;
  const completed = results.filter((row) => row.generation_status === "completed");
  const deterministicRows = completed.filter(isDeterministicRow);
  const modelRows = completed.filter((row) => !isDeterministicRow(row));
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
  const metricRows = metrics.length === 0
    ? "| none | none | none | none | none |"
    : metrics.map((item) => `| ${item.query_id || "unknown"} | ${item.row} | ${item.type} | ${item.key || "n/a"} | ${String(item.value ?? "").replaceAll("\n", " ")} |`).join("\n");

  return `# ${roundTitle(payload).replaceAll("_", " ")}

Generated: ${new Date().toISOString()}

## Scope

This report imports a ${scopeLabel} for
\`${modelId}\`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: ${relative(outputJsonPath)}
- Generated answer JSONL: ${relative(answersPath)}
- Variant: ${payload.meta?.variant_id || "unknown"}
- Runtime: ${runtimeName}
- Model id: ${modelId}
- WebGPU status: ${payload.meta?.webgpu?.status || "unknown"}

## Runtime Summary

- Result rows: ${results.length}
- Completed rows: ${completed.length}
- Error rows: ${errors.length}
- Deterministic hybrid rows: ${deterministicRows.length}
- ${modelLabel} model-generation rows: ${modelRows.length}
- ${modelLabel} average TTFT: ${formatNumber(average(modelRows, "ttft_ms"))} ms
- ${modelLabel} average total latency: ${formatNumber(average(modelRows, "total_latency_ms"))} ms
- ${modelLabel} average tokens/s: ${formatNumber(average(modelRows, "tokens_per_second"), 2)}
- ${modelLabel} average prompt tokens estimate: ${formatNumber(average(modelRows, "prompt_tokens_est"))}
- Hybrid deterministic average total latency: ${formatNumber(average(deterministicRows, "total_latency_ms"), 3)} ms
- All-row average total latency: ${formatNumber(average(completed, "total_latency_ms"))} ms
- Metric validity issues: ${metrics.length}

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
${metricRows}

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

- A paper-quality round requires the declared run scope to complete or an
  explicit failure-analysis table for device/runtime failures.
- Contract failures block generated-answer quality claims.
- Contract warnings can still be useful for prompt and evidence-packet tuning,
  but they should not be reported as faithful answers without review.
`;
}

export function importWebllmRound(inputPath, {
  outputJsonPath = null,
  answersPath = null,
  reportMdPath = null
} = {}) {
  if (!inputPath) throw new Error("inputPath is required");
  const payload = readJson(inputPath);
  const results = safeRows(payload);
  const metrics = metricIssues(results);
  const importProvenance = provenance(inputPath, payload);
  const slug = roundSlug(payload);
  const finalOutputJsonPath = outputJsonPath || path.join(repoRoot, "reports", `${slug}.json`);
  const finalAnswersPath = answersPath || path.join(repoRoot, "reports", `${slug}_answers.jsonl`);
  const finalReportMdPath = reportMdPath || path.join(repoRoot, "reports", `${slug.toUpperCase()}.md`);

  fs.writeFileSync(finalOutputJsonPath, JSON.stringify({
    _provenance: importProvenance,
    imported_at: new Date().toISOString(),
    source_export_path: path.basename(inputPath),
    metric_issues: metrics,
    ...payload
  }, null, 2) + "\n");

  writeJsonl(finalAnswersPath, answerRows(results));
  const queryIds = [...new Set(results.map((row) => row.query_id).filter(Boolean))];
  const contract = validateGenerationContract({
    ...contractInputs(payload),
    answersPath: finalAnswersPath,
    requireAllAnswers: false,
    allowedQueryIds: queryIds
  });
  fs.writeFileSync(finalReportMdPath, markdownReport({ payload, results, contract, metrics, outputJsonPath: finalOutputJsonPath, answersPath: finalAnswersPath }));

  return {
    report: relative(finalReportMdPath),
    imported_json: relative(finalOutputJsonPath),
    answers: relative(finalAnswersPath),
    result_count: results.length,
    completed_count: results.filter((row) => row.generation_status === "completed").length,
    error_count: results.filter((row) => row.generation_status !== "completed").length,
    metric_issue_count: metrics.length,
    contract_fail_count: contract.fail_count,
    contract_warn_count: contract.warn_count
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
  if (!inputPath) {
    console.error("Usage: node scripts/import_webllm_round.mjs <browser_export.json> [--json-out path] [--answers-out path] [--md-out path] [--strict]");
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const option = (name) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : null;
  };

  try {
    const summary = importWebllmRound(inputPath, {
      outputJsonPath: option("--json-out") ? path.resolve(option("--json-out")) : null,
      answersPath: option("--answers-out") ? path.resolve(option("--answers-out")) : null,
      reportMdPath: option("--md-out") ? path.resolve(option("--md-out")) : null
    });
    console.log(JSON.stringify(summary, null, 2));
    if (process.argv.includes("--strict")) {
      if (summary.completed_count === 0 || summary.contract_fail_count > 0) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error?.message || String(error));
    process.exit(1);
  }
}
