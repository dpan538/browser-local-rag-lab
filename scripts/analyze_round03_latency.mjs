#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  roundPath: path.join(repoRoot, "reports/webllm_round_03_300.json"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  gatePath: path.join(repoRoot, "reports/webllm_round_03_300_gate.json"),
  jsonOutPath: path.join(repoRoot, "reports/round03_300_latency_triage.json"),
  csvOutPath: path.join(repoRoot, "reports/round03_300_latency_triage_slow_rows.csv"),
  mdOutPath: path.join(repoRoot, "reports/ROUND_03_300_LATENCY_TRIAGE.md"),
  slowTotalMs: 10000,
  lowSpeedRatio: 0.5
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--round-json") parsed.roundPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--gate") parsed.gatePath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--csv-out") parsed.csvOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--slow-total-ms") parsed.slowTotalMs = Number(args[++index]);
    else if (arg === "--low-speed-ratio") parsed.lowSpeedRatio = Number(args[++index]);
  }
  return parsed;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line));
}

function asRecordId(record) {
  return record.record_id || record.id;
}

function toRetrievedIds(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split("|").map((id) => id.trim()).filter(Boolean);
}

function round(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function mean(values) {
  const valid = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (valid.length === 0) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function quantile(values, q) {
  const valid = values.filter((value) => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b);
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0];
  const position = (valid.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  const next = valid[base + 1];
  return next === undefined ? valid[base] : valid[base] + rest * (next - valid[base]);
}

function standardDeviation(values) {
  const valid = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (valid.length < 2) return 0;
  const avg = mean(valid);
  const variance = valid.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (valid.length - 1);
  return Math.sqrt(variance);
}

function pearson(rows, leftKey, rightKey) {
  const pairs = rows
    .map((row) => [row[leftKey], row[rightKey]])
    .filter(([left, right]) => Number.isFinite(left) && Number.isFinite(right));
  if (pairs.length < 2) return null;
  const leftValues = pairs.map(([left]) => left);
  const rightValues = pairs.map(([, right]) => right);
  const leftMean = mean(leftValues);
  const rightMean = mean(rightValues);
  const numerator = pairs.reduce((sum, [left, right]) => sum + (left - leftMean) * (right - rightMean), 0);
  const leftDenominator = Math.sqrt(leftValues.reduce((sum, left) => sum + (left - leftMean) ** 2, 0));
  const rightDenominator = Math.sqrt(rightValues.reduce((sum, right) => sum + (right - rightMean) ** 2, 0));
  if (leftDenominator === 0 || rightDenominator === 0) return null;
  return numerator / (leftDenominator * rightDenominator);
}

function rank(values) {
  const sorted = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const ranks = Array(values.length);
  let index = 0;
  while (index < sorted.length) {
    let end = index + 1;
    while (end < sorted.length && sorted[end].value === sorted[index].value) end += 1;
    const averageRank = (index + 1 + end) / 2;
    for (let cursor = index; cursor < end; cursor += 1) {
      ranks[sorted[cursor].index] = averageRank;
    }
    index = end;
  }
  return ranks;
}

function spearman(rows, leftKey, rightKey) {
  const pairs = rows
    .map((row) => [row[leftKey], row[rightKey]])
    .filter(([left, right]) => Number.isFinite(left) && Number.isFinite(right));
  if (pairs.length < 2) return null;
  const leftRanks = rank(pairs.map(([left]) => left));
  const rightRanks = rank(pairs.map(([, right]) => right));
  const rankedRows = leftRanks.map((leftRank, index) => ({ leftRank, rightRank: rightRanks[index] }));
  return pearson(rankedRows, "leftRank", "rightRank");
}

function summarizeRows(rows) {
  const totalValues = rows.map((row) => row.total_latency_ms).filter((value) => typeof value === "number" && Number.isFinite(value));
  return {
    n: rows.length,
    avg_ttft_ms: round(mean(rows.map((row) => row.ttft_ms)), 1),
    p50_ttft_ms: round(quantile(rows.map((row) => row.ttft_ms), 0.5), 1),
    p95_ttft_ms: round(quantile(rows.map((row) => row.ttft_ms), 0.95), 1),
    avg_total_ms: round(mean(rows.map((row) => row.total_latency_ms)), 1),
    p50_total_ms: round(quantile(rows.map((row) => row.total_latency_ms), 0.5), 1),
    p95_total_ms: round(quantile(rows.map((row) => row.total_latency_ms), 0.95), 1),
    max_total_ms: totalValues.length ? round(Math.max(...totalValues), 1) : null,
    avg_tokens_per_second: round(mean(rows.map((row) => row.tokens_per_second)), 2),
    avg_prompt_tokens: round(mean(rows.map((row) => row.prompt_tokens_est)), 1),
    avg_output_tokens: round(mean(rows.map((row) => row.output_tokens)), 1),
    avg_evidence_chars: round(mean(rows.map((row) => row.evidence_chars)), 1)
  };
}

function isDeterministicRow(row) {
  return row.deterministic === true || row.latency_bucket === "hybrid_system_latency";
}

function recordTextSize(record) {
  if (!record) return 0;
  return JSON.stringify({
    record_id: record.record_id,
    title: record.title,
    date_text: record.date_text,
    region: record.region,
    source: record.source,
    rights: record.rights,
    image_state: record.image_state,
    topology: record.topology,
    compact: record.notes?.compact,
    raw: record.notes?.raw
  }).length;
}

function sourceLength(record) {
  if (!record) return 0;
  if (typeof record.source === "string") return record.source.length;
  return JSON.stringify(record.source || {}).length;
}

function intentHint(row) {
  if (row.refusal_expected) return "Hybrid deterministic refusal lane can skip model generation.";
  if (row.intent === "source_rights_question") return "Hybrid deterministic source/rights lane can return exact evidence fields.";
  if (row.intent === "more_context") return "Compress context skeleton and cap answer length.";
  if (row.intent === "region_period_recommendation") return "Use route-specific field summaries and length control.";
  if (row.intent === "comparison") return "Keep two comparison records plus exact evidence tags; avoid spillover.";
  if (row.intent === "current_object_explanation") return "Prefer one primary object and move evidence tags before prose.";
  return "Monitor under current prompt budget.";
}

function makeCsv(rows) {
  const header = [
    "query_id",
    "intent",
    "lane",
    "deterministic",
    "latency_bucket",
    "hybrid_lane",
    "refusal_expected",
    "candidate_count",
    "prompt_tokens_est",
    "ttft_ms",
    "total_latency_ms",
    "output_tokens",
    "tokens_per_second",
    "evidence_chars",
    "slow_reason",
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

function table(rows, columns, limit = rows.length) {
  if (rows.length === 0) {
    return `| ${columns.map((column) => column.label).join(" | ")} |\n| ${columns.map(() => "---").join(" | ")} |\n`;
  }
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const separator = `| ${columns.map((column) => column.align || "---").join(" | ")} |`;
  const body = rows.slice(0, limit).map((row) => {
    return `| ${columns.map((column) => row[column.key] ?? "").join(" | ")} |`;
  });
  return [header, separator, ...body].join("\n") + "\n";
}

function markdown(report) {
  const summary = report.summary;
  const modelSummary = report.summary_model_generation || { n: 0 };
  const hybridSummary = report.summary_hybrid_system || { n: 0 };
  const correlations = report.correlations;
  const corrRows = Object.entries(correlations).map(([name, value]) => ({
    pair: name,
    pearson: value.pearson,
    spearman: value.spearman
  }));
  const intentRows = report.by_intent.map((row) => ({
    intent: row.intent,
    n: row.n,
    avg_total_ms: row.avg_total_ms,
    p95_total_ms: row.p95_total_ms,
    max_total_ms: row.max_total_ms,
    avg_ttft_ms: row.avg_ttft_ms,
    avg_tps: row.avg_tokens_per_second,
    slow_rows: row.slow_rows,
    low_speed_rows: row.low_speed_rows
  }));
  const slowRows = report.slow_rows.map((row) => ({
    query_id: row.query_id,
    intent: row.intent,
    total_ms: row.total_latency_ms,
    ttft_ms: row.ttft_ms,
    tps: row.tokens_per_second,
    prompt: row.prompt_tokens_est,
    output: row.output_tokens,
    evidence: row.evidence_chars,
    reason: row.slow_reason,
    recommendation: row.recommendation
  }));
  const evidenceRows = report.repeated_slow_evidence.map((row) => ({
    evidence_id: row.evidence_id,
    slow_rows: row.slow_rows,
    all_rows: row.all_rows,
    avg_total_ms: row.avg_total_ms,
    avg_evidence_chars: row.avg_evidence_chars
  }));

  return `# Round 03 300 Latency Triage

Generated: ${report._provenance.timestamp}

This is a post-run analysis of the existing Round 03 300-query
\`top3_gold_contract_source_rights\` WebLLM/Qwen run. It does not rerun the
model, change prompts, alter labels, or modify evidence. Generated answers
remain experimental outputs and are not archive evidence.

## Summary

| Metric | Value |
|---|---:|
| Rows | ${summary.n} |
| Qwen model-generation rows | ${modelSummary.n} |
| Deterministic hybrid rows | ${hybridSummary.n} |
| Contract failures | ${report.gate.contract_fail_count} |
| Contract warnings | ${report.gate.contract_warn_count} |
| Gate blocking findings | ${report.gate.blocking_finding_count} |
| Gate performance observations | ${report.gate.performance_observation_count} |
| Avg TTFT ms | ${summary.avg_ttft_ms} |
| P95 TTFT ms | ${summary.p95_ttft_ms} |
| Avg total latency ms | ${summary.avg_total_ms} |
| P50 total latency ms | ${summary.p50_total_ms} |
| P95 total latency ms | ${summary.p95_total_ms} |
| Max total latency ms | ${summary.max_total_ms} |
| Avg tokens/s | ${summary.avg_tokens_per_second} |
| Qwen avg TTFT ms | ${modelSummary.avg_ttft_ms ?? ""} |
| Qwen P95 TTFT ms | ${modelSummary.p95_ttft_ms ?? ""} |
| Qwen avg total latency ms | ${modelSummary.avg_total_ms ?? ""} |
| Qwen P95 total latency ms | ${modelSummary.p95_total_ms ?? ""} |
| Qwen avg tokens/s | ${modelSummary.avg_tokens_per_second ?? ""} |
| Hybrid avg total latency ms | ${hybridSummary.avg_total_ms ?? ""} |
| Slow rows > ${report.thresholds.slow_total_ms} ms | ${report.thresholds.slow_total_count} |
| Low-speed rows < ${report.thresholds.low_speed_tokens_per_second} tokens/s | ${report.thresholds.low_speed_count} |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
${corrRows.map((row) => `| ${row.pair} | ${row.pearson} | ${row.spearman} |`).join("\n")}

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
${intentRows.map((row) => `| ${row.intent} | ${row.n} | ${row.avg_total_ms} | ${row.p95_total_ms} | ${row.max_total_ms} | ${row.avg_ttft_ms} | ${row.avg_tps} | ${row.slow_rows} | ${row.low_speed_rows} |`).join("\n")}

## Slow Query Triage

Rows above ${report.thresholds.slow_total_ms} ms:

${table(slowRows, [
    { key: "query_id", label: "Query" },
    { key: "intent", label: "Intent" },
    { key: "total_ms", label: "Total ms", align: "---:" },
    { key: "ttft_ms", label: "TTFT ms", align: "---:" },
    { key: "tps", label: "tokens/s", align: "---:" },
    { key: "prompt", label: "Prompt tokens", align: "---:" },
    { key: "output", label: "Output tokens", align: "---:" },
    { key: "evidence", label: "Evidence chars", align: "---:" },
    { key: "reason", label: "Main signal" },
    { key: "recommendation", label: "Recommendation" }
  ], 30)}
## Repeated Evidence In Slow Rows

${table(evidenceRows, [
    { key: "evidence_id", label: "Evidence ID" },
    { key: "slow_rows", label: "Slow rows", align: "---:" },
    { key: "all_rows", label: "All rows", align: "---:" },
    { key: "avg_total_ms", label: "Avg total ms", align: "---:" },
    { key: "avg_evidence_chars", label: "Avg evidence chars", align: "---:" }
  ], 20)}
## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | ${report.hybrid_lane_candidates.refusal_expected.rows} | ${report.hybrid_lane_candidates.refusal_expected.total_ms} | ${report.hybrid_lane_candidates.refusal_expected.avg_ms} | hybrid_system_latency |
| Source/rights | ${report.hybrid_lane_candidates.source_rights.rows} | ${report.hybrid_lane_candidates.source_rights.total_ms} | ${report.hybrid_lane_candidates.source_rights.avg_ms} | hybrid_system_latency |
| Combined deterministic candidates | ${report.hybrid_lane_candidates.combined.rows} | ${report.hybrid_lane_candidates.combined.total_ms} | ${report.hybrid_lane_candidates.combined.avg_ms} | hybrid_system_latency |

## Interpretation

- Round 03 is contract-clean at scale; the next bottleneck is latency and
  answer usability, not basic reliability.
- Prompt size has a visible relationship with TTFT, but the latency tail is
  lane-dependent. The heaviest tail is concentrated in \`more_context\`,
  \`region_period_recommendation\`, \`comparison\`, and
  \`current_object_explanation\`.
- Output length contributes to total latency, but low tokens/s rows show that
  generation speed also varies by lane and evidence shape, not just token
  count.
- Deterministic refusal and source/rights lanes are not a claim about Qwen
  generation capability. They should be measured separately as hybrid system
  latency because the system can return exact evidence fields or mandatory
  refusals without asking the model to paraphrase.

## Next Round 03 Optimization Order

1. Build \`r03_v1_length_control\`: same evidence, stricter answer length and
   evidence-tag placement.
2. Build \`r03_v2_evidence_compress\`: required-field-preserving evidence
   compression for context-heavy lanes.
3. Build \`r03_v3_hybrid_deterministic_lanes\`: deterministic refusal and
   source/rights output, reported as hybrid system latency.
4. Run 50-query pilots only. Expand to 300 only if contract fail remains 0
   and latency improves meaningfully.
`;
}

export function buildLatencyTriage({
  roundPath = defaults.roundPath,
  labelsPath = defaults.labelsPath,
  recordsPath = defaults.recordsPath,
  gatePath = defaults.gatePath,
  slowTotalMs = defaults.slowTotalMs,
  lowSpeedRatio = defaults.lowSpeedRatio
} = {}) {
  const roundReport = readJson(roundPath);
  const labels = readJsonl(labelsPath);
  const records = readJsonl(recordsPath);
  const gate = fs.existsSync(gatePath) ? readJson(gatePath) : {};
  const labelMap = new Map(labels.map((label) => [label.query_id || label.id, label]));
  const recordMap = new Map(records.map((record) => [asRecordId(record), record]));

  const rows = (roundReport.results || []).map((row) => {
    const label = labelMap.get(row.query_id) || {};
    const retrievedIds = toRetrievedIds(row.retrieved_ids);
    const evidenceRecords = retrievedIds.map((id) => recordMap.get(id)).filter(Boolean);
    const evidenceChars = evidenceRecords.reduce((sum, record) => sum + recordTextSize(record), 0);
    const sourceChars = evidenceRecords.reduce((sum, record) => sum + sourceLength(record), 0);
    const enriched = {
      query_id: row.query_id,
      intent: row.intent,
      lane: row.lane || label.gold_lane,
      refusal_expected: label.refusal_expected === true,
      candidate_count: row.candidate_count ?? retrievedIds.length,
      prompt_tokens_est: row.prompt_tokens_est,
      prompt_chars: row.prompt_chars,
      ttft_ms: row.ttft_ms,
      total_latency_ms: row.total_latency_ms,
      output_tokens: row.output_tokens,
      tokens_per_second: row.tokens_per_second,
      deterministic: isDeterministicRow(row),
      hybrid_lane: row.hybrid_lane || null,
      latency_bucket: row.latency_bucket || (isDeterministicRow(row) ? "hybrid_system_latency" : "qwen_generation_latency"),
      retrieved_ids: retrievedIds,
      gold_evidence_ids: label.gold_evidence_ids || [],
      evidence_chars: evidenceChars,
      source_chars: sourceChars,
      required_field_count: (label.required_fields || []).length
    };
    return enriched;
  });

  const modelRows = rows.filter((row) => !row.deterministic);
  const hybridRows = rows.filter((row) => row.deterministic);
  const summary = summarizeRows(rows);
  const modelSummary = summarizeRows(modelRows);
  const hybridSummary = summarizeRows(hybridRows);
  const lowSpeedThreshold = (modelSummary.avg_tokens_per_second || 0) * lowSpeedRatio;
  const rowsWithSignals = rows.map((row) => {
    const signals = [];
    if (row.total_latency_ms > slowTotalMs) signals.push("total_latency_tail");
    if (!row.deterministic && row.tokens_per_second < lowSpeedThreshold) signals.push("low_decode_speed");
    if (row.prompt_tokens_est > 1000) signals.push("large_prompt");
    if (row.output_tokens > 100) signals.push("long_output");
    if (row.evidence_chars > 9000) signals.push("large_evidence_text");
    if (row.candidate_count > 3) signals.push("many_candidates");
    return {
      ...row,
      slow_reason: signals.length ? signals.join("+") : "none",
      recommendation: intentHint(row)
    };
  });

  const grouped = new Map();
  for (const row of rowsWithSignals) {
    if (!grouped.has(row.intent)) grouped.set(row.intent, []);
    grouped.get(row.intent).push(row);
  }
  const byIntent = [...grouped.entries()].map(([intent, intentRows]) => ({
    intent,
    ...summarizeRows(intentRows),
    slow_rows: intentRows.filter((row) => row.total_latency_ms > slowTotalMs).length,
    low_speed_rows: intentRows.filter((row) => !row.deterministic && row.tokens_per_second < lowSpeedThreshold).length
  })).sort((left, right) => (right.p95_total_ms || 0) - (left.p95_total_ms || 0));

  const modelRowsWithSignals = rowsWithSignals.filter((row) => !row.deterministic);
  const correlations = {
    "prompt_tokens_est -> ttft_ms": {
      pearson: round(pearson(modelRowsWithSignals, "prompt_tokens_est", "ttft_ms"), 3),
      spearman: round(spearman(modelRowsWithSignals, "prompt_tokens_est", "ttft_ms"), 3)
    },
    "prompt_tokens_est -> total_latency_ms": {
      pearson: round(pearson(modelRowsWithSignals, "prompt_tokens_est", "total_latency_ms"), 3),
      spearman: round(spearman(modelRowsWithSignals, "prompt_tokens_est", "total_latency_ms"), 3)
    },
    "output_tokens -> total_latency_ms": {
      pearson: round(pearson(modelRowsWithSignals, "output_tokens", "total_latency_ms"), 3),
      spearman: round(spearman(modelRowsWithSignals, "output_tokens", "total_latency_ms"), 3)
    },
    "evidence_chars -> prompt_tokens_est": {
      pearson: round(pearson(modelRowsWithSignals, "evidence_chars", "prompt_tokens_est"), 3),
      spearman: round(spearman(modelRowsWithSignals, "evidence_chars", "prompt_tokens_est"), 3)
    },
    "candidate_count -> total_latency_ms": {
      pearson: round(pearson(modelRowsWithSignals, "candidate_count", "total_latency_ms"), 3),
      spearman: round(spearman(modelRowsWithSignals, "candidate_count", "total_latency_ms"), 3)
    }
  };

  const slowRows = rowsWithSignals
    .filter((row) => row.total_latency_ms > slowTotalMs)
    .sort((left, right) => right.total_latency_ms - left.total_latency_ms);

  const evidenceUsage = new Map();
  for (const row of rowsWithSignals) {
    for (const evidenceId of row.retrieved_ids) {
      if (!evidenceUsage.has(evidenceId)) {
        evidenceUsage.set(evidenceId, { evidence_id: evidenceId, slow_rows: 0, all_rows: 0, total_ms: [], evidence_chars: [] });
      }
      const item = evidenceUsage.get(evidenceId);
      item.all_rows += 1;
      item.total_ms.push(row.total_latency_ms);
      item.evidence_chars.push(row.evidence_chars);
      if (row.total_latency_ms > slowTotalMs) item.slow_rows += 1;
    }
  }
  const repeatedSlowEvidence = [...evidenceUsage.values()]
    .filter((item) => item.slow_rows >= 2)
    .map((item) => ({
      evidence_id: item.evidence_id,
      slow_rows: item.slow_rows,
      all_rows: item.all_rows,
      avg_total_ms: round(mean(item.total_ms), 1),
      avg_evidence_chars: round(mean(item.evidence_chars), 1)
    }))
    .sort((left, right) => right.slow_rows - left.slow_rows || right.avg_total_ms - left.avg_total_ms);

  const refusalRows = rowsWithSignals.filter((row) => row.refusal_expected);
  const sourceRightsRows = rowsWithSignals.filter((row) => row.intent === "source_rights_question" && !row.refusal_expected);
  const combinedDeterministic = [...new Map([...refusalRows, ...sourceRightsRows].map((row) => [row.query_id, row])).values()];
  const laneSavings = (items) => ({
    rows: items.length,
    total_ms: round(items.reduce((sum, row) => sum + row.total_latency_ms, 0), 1),
    avg_ms: round(mean(items.map((row) => row.total_latency_ms)), 1)
  });

  return {
    _provenance: {
      step: "round03_300_latency_triage",
      timestamp: new Date().toISOString(),
      round_path: path.relative(repoRoot, roundPath),
      labels_path: path.relative(repoRoot, labelsPath),
      records_path: path.relative(repoRoot, recordsPath),
      gate_path: fs.existsSync(gatePath) ? path.relative(repoRoot, gatePath) : null,
      research_only: true
    },
    thresholds: {
      slow_total_ms: slowTotalMs,
      slow_total_count: slowRows.length,
      low_speed_ratio: lowSpeedRatio,
      low_speed_tokens_per_second: round(lowSpeedThreshold, 2),
      low_speed_count: rowsWithSignals.filter((row) => !row.deterministic && row.tokens_per_second < lowSpeedThreshold).length
    },
    gate: {
      contract_fail_count: gate.contract_fail_count ?? null,
      contract_warn_count: gate.contract_warn_count ?? null,
      blocking_finding_count: gate.blocking_finding_count ?? null,
      performance_observation_count: gate.performance_observation_count ?? null,
      ready_for_next_step: gate.ready_for_next_step ?? null
    },
    summary,
    summary_model_generation: modelSummary,
    summary_hybrid_system: hybridSummary,
    correlations,
    by_intent: byIntent,
    slow_rows: slowRows,
    repeated_slow_evidence: repeatedSlowEvidence,
    hybrid_lane_candidates: {
      refusal_expected: laneSavings(refusalRows),
      source_rights: laneSavings(sourceRightsRows),
      combined: laneSavings(combinedDeterministic)
    },
    rows: rowsWithSignals
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const report = buildLatencyTriage(args);
  fs.writeFileSync(args.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(args.csvOutPath, makeCsv(report.slow_rows));
  fs.writeFileSync(args.mdOutPath, markdown(report));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, args.mdOutPath),
    json: path.relative(repoRoot, args.jsonOutPath),
    csv: path.relative(repoRoot, args.csvOutPath),
    slow_rows: report.slow_rows.length,
    low_speed_rows: report.thresholds.low_speed_count
  }, null, 2));
}
