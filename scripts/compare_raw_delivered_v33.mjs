#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  roundJsonPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v33_postprocessed_prose.json"),
  jsonOutPath: path.join(repoRoot, "reports/raw_vs_delivered_v33.json"),
  mdOutPath: path.join(repoRoot, "reports/RAW_VS_DELIVERED_V33.md")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--round-json") parsed.roundJsonPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function bodyOnly(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "")
    .trim();
}

function hasEvidenceTags(text) {
  return /EVIDENCE TAGS:\s*\n/i.test(String(text || ""));
}

function average(rows, field) {
  const values = rows.map((row) => row[field]).filter((value) => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function histogram(rows, accessor) {
  const counts = {};
  for (const row of rows) {
    const values = accessor(row);
    for (const value of values) counts[value] = (counts[value] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function actionLabel(action) {
  if (typeof action === "string") return action;
  if (action && typeof action === "object") return action.code || JSON.stringify(action);
  return String(action);
}

function isDeterministic(row) {
  return row.deterministic === true || row.latency_bucket === "hybrid_system_latency";
}

function analyze(options) {
  const round = JSON.parse(fs.readFileSync(options.roundJsonPath, "utf8"));
  const rows = round.results || [];
  const completed = rows.filter((row) => row.generation_status === "completed");
  const deterministicRows = completed.filter(isDeterministic);
  const modelRows = completed.filter((row) => !isDeterministic(row));
  const modelDetails = modelRows.map((row) => {
    const rawBody = bodyOnly(row.raw_answer_text || row.model_answer_text || "");
    const modelBody = bodyOnly(row.model_answer_text || row.raw_answer_text || "");
    const deliveredBody = bodyOnly(row.answer_text || "");
    return {
      query_id: row.query_id,
      intent: row.intent,
      raw_has_evidence_tags: hasEvidenceTags(row.raw_answer_text),
      delivered_has_evidence_tags: hasEvidenceTags(row.answer_text),
      raw_body_changed_by_polisher: rawBody !== modelBody,
      delivered_body_changed_from_model_body: deliveredBody !== modelBody,
      postprocess_actions: row.postprocess_actions || [],
      raw_body_word_count: rawBody.split(/\s+/).filter(Boolean).length,
      delivered_body_word_count: deliveredBody.split(/\s+/).filter(Boolean).length,
      ttft_ms: row.ttft_ms,
      total_latency_ms: row.total_latency_ms
    };
  });
  const report = {
    generated_at: new Date().toISOString(),
    source_round_json: path.relative(repoRoot, options.roundJsonPath),
    condition_id: "v3.3_contract_top3_300_delivered",
    summary: {
      rows: rows.length,
      completed_rows: completed.length,
      deterministic_rows: deterministicRows.length,
      model_generation_rows: modelRows.length,
      model_raw_rows_with_evidence_tags: modelDetails.filter((row) => row.raw_has_evidence_tags).length,
      model_delivered_rows_with_evidence_tags: modelDetails.filter((row) => row.delivered_has_evidence_tags).length,
      model_rows_raw_body_differs_from_model_body: modelDetails.filter((row) => row.raw_body_changed_by_polisher).length,
      model_rows_delivered_body_changed_from_model_body: modelDetails.filter((row) => row.delivered_body_changed_from_model_body).length,
      qwen_avg_ttft_ms: average(modelRows, "ttft_ms"),
      qwen_avg_total_latency_ms: average(modelRows, "total_latency_ms"),
      deterministic_avg_total_latency_ms: average(deterministicRows, "total_latency_ms"),
      all_row_avg_total_latency_ms: average(completed, "total_latency_ms")
    },
    deterministic_lane_counts: histogram(deterministicRows, (row) => [row.hybrid_lane || row.intent || "unknown"]),
    postprocess_action_counts: histogram(modelRows, (row) => row.postprocess_actions?.length ? row.postprocess_actions.map(actionLabel) : ["none"]),
    model_rows: modelDetails
  };
  fs.writeFileSync(options.jsonOutPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, markdown(report));
  return report;
}

function format(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return Number(value).toFixed(digits);
}

function tableFromObject(object) {
  const entries = Object.entries(object || {});
  if (!entries.length) return "| none | 0 |";
  return entries.map(([key, value]) => `| ${key} | ${value} |`).join("\n");
}

function markdown(report) {
  return `# Raw vs Delivered V3.3

Generated: ${report.generated_at}

This report separates raw model text from delivered answer text for
\`v3.3_contract_top3_300_delivered\`. It exists to prevent paper claims from
mistaking system-level reliability for raw Qwen generation behavior.

## Summary

| Metric | Value |
|---|---:|
| Rows | ${report.summary.rows} |
| Completed rows | ${report.summary.completed_rows} |
| Deterministic hybrid rows | ${report.summary.deterministic_rows} |
| Qwen model-generation rows | ${report.summary.model_generation_rows} |
| Raw model rows with evidence tags | ${report.summary.model_raw_rows_with_evidence_tags} |
| Delivered model rows with evidence tags | ${report.summary.model_delivered_rows_with_evidence_tags} |
| Raw body differs from stored model body | ${report.summary.model_rows_raw_body_differs_from_model_body} |
| Delivered bodies changed from model body by finalizer/postprocess | ${report.summary.model_rows_delivered_body_changed_from_model_body} |
| Qwen average TTFT | ${format(report.summary.qwen_avg_ttft_ms)} ms |
| Qwen average total latency | ${format(report.summary.qwen_avg_total_latency_ms)} ms |
| Deterministic average total latency | ${format(report.summary.deterministic_avg_total_latency_ms, 3)} ms |
| All-row average total latency | ${format(report.summary.all_row_avg_total_latency_ms)} ms |

## Deterministic Lane Counts

| Lane | Rows |
|---|---:|
${tableFromObject(report.deterministic_lane_counts)}

## Postprocess Action Counts

| Action | Rows |
|---|---:|
${tableFromObject(report.postprocess_action_counts)}

## Interpretation

- Raw Qwen model rows are evaluated separately from delivered answers.
- Delivered answers include deterministic evidence tags, deterministic lanes,
  and prose polishing where applicable.
- Contract-compliance claims should be phrased as delivered-answer system
  claims, not raw model claims.
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const report = analyze(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify({
    json: path.relative(repoRoot, defaults.jsonOutPath),
    report: path.relative(repoRoot, defaults.mdOutPath),
    model_generation_rows: report.summary.model_generation_rows,
    delivered_rows_with_tags: report.summary.model_delivered_rows_with_evidence_tags
  }, null, 2));
}
