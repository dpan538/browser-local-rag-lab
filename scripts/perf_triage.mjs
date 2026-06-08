#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");

const defaults = {
  goldPath: path.join(repoRoot, "reports/performance_stratification_round_02_200_gold_only_iab_full200.json"),
  top3Path: path.join(repoRoot, "reports/performance_stratification_round_02_200_contract_iab_full200.json"),
  top8Path: path.join(repoRoot, "reports/performance_stratification_round_02_200_top8_iab_full200.json"),
  jsonOutPath: path.join(repoRoot, "reports/perf_triage_round_03_packet_ablation.json"),
  csvOutPath: path.join(repoRoot, "reports/perf_triage_round_03_packet_ablation.csv"),
  mdOutPath: path.join(repoRoot, "reports/PERF_TRIAGE_ROUND_03_PACKET_ABLATION.md"),
  slowThresholdMs: 15000
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--gold") parsed.goldPath = path.resolve(args[++index]);
    else if (arg === "--top3") parsed.top3Path = path.resolve(args[++index]);
    else if (arg === "--top8") parsed.top8Path = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--csv-out") parsed.csvOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--slow-threshold-ms") parsed.slowThresholdMs = Number(args[++index]);
  }
  return parsed;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function round(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function median(values) {
  const valid = values.filter((value) => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b);
  if (valid.length === 0) return null;
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 === 0 ? (valid[mid - 1] + valid[mid]) / 2 : valid[mid];
}

function byId(report) {
  return new Map((report.rows || []).map((row) => [row.query_id, row]));
}

function variantSummary(report) {
  return {
    rows: report.summary?.n || report.rows?.length || 0,
    avg_prompt_tokens: report.summary?.avg_prompt_tokens_est,
    avg_ttft_ms: report.summary?.avg_ttft_ms,
    avg_total_ms: report.summary?.avg_total_latency_ms,
    avg_tokens_per_second: report.summary?.avg_tokens_per_second,
    p003_count: report.summary?.p003_count || 0
  };
}

function recommendation(row) {
  if (!row) return "missing row";
  if (row.intent === "more_context") return "Use adaptive top3 or a precompressed context skeleton; avoid default top8.";
  if (row.intent === "region_period_recommendation") return "Use route-specific top3 records and suppress extra topology spillover.";
  if (row.intent === "current_object_explanation") return "Prefer gold-only or top3; top8 adds latency without a contract benefit.";
  if (row.intent === "comparison") return "Keep only the two comparison records plus required source fields.";
  if ((row.prompt_tokens_est || 0) > 1500) return "Compress evidence packet before generation.";
  if ((row.output_tokens || 0) > 130) return "Consider a shorter answer lane after quality review.";
  return "Monitor; no immediate packet change.";
}

function makeCsv(rows) {
  const header = [
    "query_id",
    "intent",
    "gold_total_ms",
    "top3_total_ms",
    "top8_total_ms",
    "top8_vs_gold",
    "top8_prompt_tokens",
    "top8_output_tokens",
    "top8_tokens_per_second",
    "recommendation"
  ];
  const escape = (value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [
    header.join(","),
    ...rows.map((row) => header.map((key) => escape(row[key])).join(","))
  ].join("\n") + "\n";
}

function table(rows, limit = 20) {
  if (rows.length === 0) return "| none | none | none | none | none | none | none |\n";
  return rows.slice(0, limit).map((row) => `| ${row.query_id} | ${row.intent} | ${row.top8_prompt_tokens} | ${row.top8_total_ms} | ${row.gold_total_ms} | ${row.top8_vs_gold}x | ${row.recommendation} |`).join("\n") + "\n";
}

function intentTable(items) {
  if (items.length === 0) return "| none | none | none | none | none |\n";
  return items.map((item) => `| ${item.intent} | ${item.n} | ${item.median_top8_total_ms} | ${item.median_gold_total_ms} | ${item.median_top8_vs_gold}x |`).join("\n") + "\n";
}

export function buildPerfTriage({
  goldPath = defaults.goldPath,
  top3Path = defaults.top3Path,
  top8Path = defaults.top8Path,
  slowThresholdMs = defaults.slowThresholdMs
} = {}) {
  const gold = readJson(goldPath);
  const top3 = readJson(top3Path);
  const top8 = readJson(top8Path);
  const goldRows = byId(gold);
  const top3Rows = byId(top3);

  const rows = (top8.rows || []).map((top8Row) => {
    const goldRow = goldRows.get(top8Row.query_id);
    const top3Row = top3Rows.get(top8Row.query_id);
    return {
      query_id: top8Row.query_id,
      intent: top8Row.intent,
      gold_total_ms: round(goldRow?.total_latency_ms, 1),
      top3_total_ms: round(top3Row?.total_latency_ms, 1),
      top8_total_ms: round(top8Row.total_latency_ms, 1),
      top8_vs_gold: goldRow?.total_latency_ms ? round(top8Row.total_latency_ms / goldRow.total_latency_ms, 2) : null,
      top8_vs_top3: top3Row?.total_latency_ms ? round(top8Row.total_latency_ms / top3Row.total_latency_ms, 2) : null,
      top8_prompt_tokens: top8Row.prompt_tokens_est,
      top8_output_tokens: top8Row.output_tokens,
      top8_tokens_per_second: round(top8Row.tokens_per_second, 2),
      recommendation: recommendation(top8Row)
    };
  });

  const slowRows = rows
    .filter((row) => row.top8_total_ms > slowThresholdMs)
    .sort((a, b) => b.top8_total_ms - a.top8_total_ms);

  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.intent)) grouped.set(row.intent, []);
    grouped.get(row.intent).push(row);
  }
  const byIntent = [...grouped.entries()].map(([intent, intentRows]) => ({
    intent,
    n: intentRows.length,
    median_top8_total_ms: round(median(intentRows.map((row) => row.top8_total_ms)), 1),
    median_gold_total_ms: round(median(intentRows.map((row) => row.gold_total_ms)), 1),
    median_top8_vs_gold: round(median(intentRows.map((row) => row.top8_vs_gold)), 2)
  })).sort((a, b) => (b.median_top8_total_ms || 0) - (a.median_top8_total_ms || 0));

  return {
    _provenance: {
      step: "perf_triage",
      timestamp: new Date().toISOString(),
      gold_path: path.relative(repoRoot, goldPath),
      top3_path: path.relative(repoRoot, top3Path),
      top8_path: path.relative(repoRoot, top8Path),
      research_only: true
    },
    slow_threshold_ms: slowThresholdMs,
    variant_summary: {
      gold_only: variantSummary(gold),
      top3_compressed: variantSummary(top3),
      top8: variantSummary(top8)
    },
    by_intent: byIntent,
    slow_rows: slowRows,
    rows
  };
}

function markdown(report) {
  return `# Performance Triage Round 03 Packet Ablation

Generated: ${report._provenance.timestamp}

This report triages the latency tail from the Round 02 200-query packet
ablation. It is a post-run analysis only and does not change prompts, labels,
or model outputs.

## Variant Summary

| Variant | Rows | Avg prompt tokens | Avg TTFT ms | Avg total ms | Avg tokens/s | P003 |
|---|---:|---:|---:|---:|---:|---:|
| gold-only | ${report.variant_summary.gold_only.rows} | ${report.variant_summary.gold_only.avg_prompt_tokens} | ${report.variant_summary.gold_only.avg_ttft_ms} | ${report.variant_summary.gold_only.avg_total_ms} | ${report.variant_summary.gold_only.avg_tokens_per_second} | ${report.variant_summary.gold_only.p003_count} |
| top3 compressed | ${report.variant_summary.top3_compressed.rows} | ${report.variant_summary.top3_compressed.avg_prompt_tokens} | ${report.variant_summary.top3_compressed.avg_ttft_ms} | ${report.variant_summary.top3_compressed.avg_total_ms} | ${report.variant_summary.top3_compressed.avg_tokens_per_second} | ${report.variant_summary.top3_compressed.p003_count} |
| top8 | ${report.variant_summary.top8.rows} | ${report.variant_summary.top8.avg_prompt_tokens} | ${report.variant_summary.top8.avg_ttft_ms} | ${report.variant_summary.top8.avg_total_ms} | ${report.variant_summary.top8.avg_tokens_per_second} | ${report.variant_summary.top8.p003_count} |

## Intent-Level Tail

| Intent | N | Median top8 total ms | Median gold-only total ms | Median top8/gold |
|---|---:|---:|---:|---:|
${intentTable(report.by_intent)}
## Slow Query Optimization List

Threshold: ${report.slow_threshold_ms} ms

| Query | Intent | Top8 prompt tokens | Top8 total ms | Gold-only total ms | Top8/gold | Suggested optimization |
|---|---|---:|---:|---:|---:|---|
${table(report.slow_rows)}
## Interpretation

- Top8 is contract-stable but creates a large latency tail.
- The slowest rows concentrate in more-context and region-period lanes.
- Gold-only remains the fastest contract-safe baseline.
- The next packet candidate should be adaptive: keep strict source-rights and
  hard-refusal lanes, but cap context-heavy lanes at top3 or a route-specific
  summary.
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const report = buildPerfTriage(args);
  fs.writeFileSync(args.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(args.csvOutPath, makeCsv(report.rows));
  fs.writeFileSync(args.mdOutPath, markdown(report));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, args.mdOutPath),
    json: path.relative(repoRoot, args.jsonOutPath),
    csv: path.relative(repoRoot, args.csvOutPath),
    slow_rows: report.slow_rows.length
  }, null, 2));
}
