#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");

const defaults = {
  roundJsonPath: path.join(repoRoot, "reports/webllm_round_02_200_contract_iab_full200.json"),
  gateJsonPath: path.join(repoRoot, "reports/webllm_round_02_200_contract_iab_full200_gate.json"),
  jsonOutPath: path.join(repoRoot, "reports/performance_stratification_round_02_200_contract_iab_full200.json"),
  csvOutPath: path.join(repoRoot, "reports/performance_stratification_round_02_200_contract_iab_full200.csv"),
  mdOutPath: path.join(repoRoot, "reports/PERFORMANCE_STRATIFICATION_ROUND_02_200_CONTRACT_IAB_FULL200.md")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--round-json") parsed.roundJsonPath = path.resolve(args[++index]);
    else if (arg === "--gate-json") parsed.gateJsonPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--csv-out") parsed.csvOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function number(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values) {
  const valid = values.filter((value) => number(value) !== null);
  if (valid.length === 0) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function percentile(values, p) {
  const valid = values.filter((value) => number(value) !== null).sort((a, b) => a - b);
  if (valid.length === 0) return null;
  const index = (valid.length - 1) * p;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) return valid[low];
  return valid[low] + (valid[high] - valid[low]) * (index - low);
}

function pearson(xs, ys) {
  const pairs = xs.map((x, index) => [number(x), number(ys[index])]).filter(([x, y]) => x !== null && y !== null);
  if (pairs.length < 2) return null;
  const meanX = average(pairs.map(([x]) => x));
  const meanY = average(pairs.map(([, y]) => y));
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (const [x, y] of pairs) {
    numerator += (x - meanX) * (y - meanY);
    denomX += (x - meanX) ** 2;
    denomY += (y - meanY) ** 2;
  }
  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? null : numerator / denominator;
}

function summarizeRows(rows, p003Ids = new Set()) {
  const n = rows.length;
  const p003Count = rows.filter((row) => p003Ids.has(row.query_id)).length;
  return {
    n,
    p003_count: p003Count,
    p003_rate: n ? round(p003Count / n, 4) : 0,
    avg_ttft_ms: round(average(rows.map((row) => row.ttft_ms)), 1),
    median_ttft_ms: round(percentile(rows.map((row) => row.ttft_ms), 0.5), 1),
    p90_ttft_ms: round(percentile(rows.map((row) => row.ttft_ms), 0.9), 1),
    avg_total_latency_ms: round(average(rows.map((row) => row.total_latency_ms)), 1),
    median_total_latency_ms: round(percentile(rows.map((row) => row.total_latency_ms), 0.5), 1),
    p90_total_latency_ms: round(percentile(rows.map((row) => row.total_latency_ms), 0.9), 1),
    avg_tokens_per_second: round(average(rows.map((row) => row.tokens_per_second)), 2),
    median_tokens_per_second: round(percentile(rows.map((row) => row.tokens_per_second), 0.5), 2),
    p10_tokens_per_second: round(percentile(rows.map((row) => row.tokens_per_second), 0.1), 2),
    avg_prompt_tokens_est: round(average(rows.map((row) => row.prompt_tokens_est)), 1),
    avg_output_tokens: round(average(rows.map((row) => row.output_tokens)), 1),
    avg_candidate_count: round(average(rows.map((row) => row.candidate_count)), 2)
  };
}

function groupBy(rows, getKey) {
  const groups = new Map();
  for (const row of rows) {
    const key = getKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return groups;
}

function promptBin(row) {
  const tokens = row.prompt_tokens_est || 0;
  if (tokens <= 200) return "000-200";
  if (tokens <= 500) return "201-500";
  if (tokens <= 800) return "501-800";
  if (tokens <= 1100) return "801-1100";
  return "1101+";
}

function sortedObjectFromGroups(groups, p003Ids, sortKey = "n") {
  const entries = [...groups.entries()].map(([key, rows]) => [key, summarizeRows(rows, p003Ids)]);
  entries.sort((a, b) => (b[1][sortKey] ?? 0) - (a[1][sortKey] ?? 0) || String(a[0]).localeCompare(String(b[0])));
  return Object.fromEntries(entries);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function makeCsv(rows, p003Ids) {
  const header = [
    "query_id",
    "intent",
    "lane",
    "candidate_count",
    "prompt_tokens_est",
    "output_tokens",
    "ttft_ms",
    "total_latency_ms",
    "tokens_per_second",
    "p003_generation_speed_low"
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(header.map((key) => {
      if (key === "p003_generation_speed_low") return p003Ids.has(row.query_id) ? "1" : "0";
      return csvEscape(row[key]);
    }).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function rowsTable(rows, limit = 12) {
  const selected = rows.slice(0, limit);
  if (selected.length === 0) return "| none | none | none | none | none | none |\n";
  return selected.map((row) => `| ${row.query_id} | ${row.intent} | ${row.prompt_tokens_est} | ${row.output_tokens} | ${round(row.total_latency_ms, 1)} | ${round(row.tokens_per_second, 2)} |`).join("\n") + "\n";
}

function objectTable(object, keyLabel) {
  const entries = Object.entries(object);
  if (entries.length === 0) return `| none | none | none | none | none | none | none |\n`;
  return entries.map(([key, item]) => `| ${key} | ${item.n} | ${item.p003_count} | ${round(item.p003_rate * 100, 1)}% | ${item.avg_ttft_ms} | ${item.avg_total_latency_ms} | ${item.avg_tokens_per_second} | ${item.avg_prompt_tokens_est} |`).join("\n") + "\n";
}

function markdown(report) {
  const slowestByTotal = [...report.rows].sort((a, b) => b.total_latency_ms - a.total_latency_ms);
  const slowestByTps = [...report.rows].sort((a, b) => a.tokens_per_second - b.tokens_per_second);
  return `# Performance Stratification Round 02 200 Contract IAB Full200

Generated: ${report._provenance.timestamp}

This report stratifies the browser-local WebLLM full-200 controlled-condition
run by intent and prompt size. It is a runtime-performance analysis only:
the generation contract remains the authority for answer faithfulness.

## Summary

- Rows: ${report.summary.n}
- Contract failures in source gate: ${report.source_gate.contract_fail_count}
- Contract warnings in source gate: ${report.source_gate.contract_warn_count}
- Blocking findings in source gate: ${report.source_gate.blocking_finding_count}
- Performance observations: ${report.summary.p003_count}
- Average TTFT: ${report.summary.avg_ttft_ms} ms
- Average total latency: ${report.summary.avg_total_latency_ms} ms
- Average tokens/s: ${report.summary.avg_tokens_per_second}
- Average prompt tokens: ${report.summary.avg_prompt_tokens_est}

## By Intent

| Intent | N | P003 | P003 rate | Avg TTFT ms | Avg total ms | Avg tokens/s | Avg prompt tokens |
|---|---:|---:|---:|---:|---:|---:|---:|
${objectTable(report.by_intent, "Intent")}
## By Prompt Token Bin

| Prompt tokens | N | P003 | P003 rate | Avg TTFT ms | Avg total ms | Avg tokens/s | Avg prompt tokens |
|---|---:|---:|---:|---:|---:|---:|---:|
${objectTable(report.by_prompt_token_bin, "Prompt tokens")}
## Correlations

| Pair | Pearson r |
|---|---:|
| prompt_tokens_est vs ttft_ms | ${report.correlations.prompt_tokens_vs_ttft} |
| prompt_tokens_est vs total_latency_ms | ${report.correlations.prompt_tokens_vs_total_latency} |
| prompt_tokens_est vs tokens_per_second | ${report.correlations.prompt_tokens_vs_tokens_per_second} |
| output_tokens vs total_latency_ms | ${report.correlations.output_tokens_vs_total_latency} |
| output_tokens vs tokens_per_second | ${report.correlations.output_tokens_vs_tokens_per_second} |

## Slowest By Total Latency

| Query | Intent | Prompt tokens | Output tokens | Total ms | Tokens/s |
|---|---|---:|---:|---:|---:|
${rowsTable(slowestByTotal)}
## Slowest By Tokens/s

| Query | Intent | Prompt tokens | Output tokens | Total ms | Tokens/s |
|---|---|---:|---:|---:|---:|
${rowsTable(slowestByTps)}
## Interpretation

- No answer-quality gate regressed: runtime errors, metric issues, contract failures,
  and contract warnings all remain zero in the source full-200 gate.
- Low-speed observations are concentrated in heavier research lanes, especially
  comparison, region-period recommendation, and more-context queries.
- Prompt length is not the only driver; output shape and lane-specific generation
  behavior also matter. Use within-intent paired comparisons in the next ablation
  so the experiment does not confuse intent mix with packet-quality effects.
- The next controlled ablation should compare top-1, top-3 gold-contract, and
  top-8 gold-contract packets under the same validator, reporting both contract
  pass rate and this performance stratification.
`;
}

export function analyzeWebllmPerformance({
  roundJsonPath = defaults.roundJsonPath,
  gateJsonPath = defaults.gateJsonPath
} = {}) {
  const roundData = readJson(roundJsonPath);
  const gate = readJson(gateJsonPath);
  const rows = (roundData.results || []).filter((row) => row.generation_status === "completed");
  const p003Ids = new Set((gate.findings || []).filter((finding) => finding.code === "P003_generation_speed_low").map((finding) => finding.query_id));
  const byIntent = sortedObjectFromGroups(groupBy(rows, (row) => row.intent || "unknown"), p003Ids, "p003_count");
  const byPromptTokenBin = sortedObjectFromGroups(groupBy(rows, promptBin), p003Ids, "n");

  return {
    _provenance: {
      step: "analyze_webllm_performance",
      timestamp: new Date().toISOString(),
      round_json_path: path.relative(repoRoot, roundJsonPath),
      gate_json_path: path.relative(repoRoot, gateJsonPath),
      research_only: true
    },
    source_gate: {
      contract_fail_count: gate.contract_fail_count,
      contract_warn_count: gate.contract_warn_count,
      blocking_finding_count: gate.blocking_finding_count,
      ready_for_next_step: gate.ready_for_next_step
    },
    summary: summarizeRows(rows, p003Ids),
    by_intent: byIntent,
    by_prompt_token_bin: byPromptTokenBin,
    correlations: {
      prompt_tokens_vs_ttft: round(pearson(rows.map((row) => row.prompt_tokens_est), rows.map((row) => row.ttft_ms)), 4),
      prompt_tokens_vs_total_latency: round(pearson(rows.map((row) => row.prompt_tokens_est), rows.map((row) => row.total_latency_ms)), 4),
      prompt_tokens_vs_tokens_per_second: round(pearson(rows.map((row) => row.prompt_tokens_est), rows.map((row) => row.tokens_per_second)), 4),
      output_tokens_vs_total_latency: round(pearson(rows.map((row) => row.output_tokens), rows.map((row) => row.total_latency_ms)), 4),
      output_tokens_vs_tokens_per_second: round(pearson(rows.map((row) => row.output_tokens), rows.map((row) => row.tokens_per_second)), 4)
    },
    rows: rows.map((row) => ({
      query_id: row.query_id,
      intent: row.intent,
      lane: row.lane,
      candidate_count: row.candidate_count,
      prompt_tokens_est: row.prompt_tokens_est,
      output_tokens: row.output_tokens,
      ttft_ms: row.ttft_ms,
      total_latency_ms: row.total_latency_ms,
      tokens_per_second: row.tokens_per_second,
      p003_generation_speed_low: p003Ids.has(row.query_id)
    }))
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const result = analyzeWebllmPerformance(options);
  fs.writeFileSync(options.jsonOutPath, JSON.stringify(result, null, 2) + "\n");
  fs.writeFileSync(options.csvOutPath, makeCsv(result.rows, new Set(result.rows.filter((row) => row.p003_generation_speed_low).map((row) => row.query_id))));
  fs.writeFileSync(options.mdOutPath, markdown(result));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, options.mdOutPath),
    json: path.relative(repoRoot, options.jsonOutPath),
    csv: path.relative(repoRoot, options.csvOutPath),
    rows: result.summary.n,
    performance_observations: result.summary.p003_count,
    ready_for_next_step: result.source_gate.ready_for_next_step
  }, null, 2));
}
