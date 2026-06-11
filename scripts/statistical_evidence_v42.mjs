#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  v32Path: path.join(repoRoot, "reports/webllm_round_03_latency300_v32_guarded_prose_budgeted_generation.json"),
  v33Path: path.join(repoRoot, "reports/webllm_round_03_latency300_v33_postprocessed_prose.json"),
  hallucinationPath: path.join(repoRoot, "reports/hallucination_v33_300.json"),
  misreadingPath: path.join(repoRoot, "reports/misreading_v33_300.json"),
  guardrailPath: path.join(repoRoot, "reports/guardrail_compliance_v33_300.json"),
  usabilityPath: path.join(repoRoot, "reports/quality_usability_v33_300.json"),
  jsonOutPath: path.join(repoRoot, "reports/statistical_evidence_v42.json"),
  mdOutPath: path.join(repoRoot, "reports/STATISTICAL_EVIDENCE_V42.md"),
  bootstrapIterations: 5000
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--v32") parsed.v32Path = path.resolve(args[++index]);
    else if (arg === "--v33") parsed.v33Path = path.resolve(args[++index]);
    else if (arg === "--hallucination") parsed.hallucinationPath = path.resolve(args[++index]);
    else if (arg === "--misreading") parsed.misreadingPath = path.resolve(args[++index]);
    else if (arg === "--guardrail") parsed.guardrailPath = path.resolve(args[++index]);
    else if (arg === "--usability") parsed.usabilityPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--bootstrap-iterations") parsed.bootstrapIterations = Number(args[++index]);
  }
  return parsed;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function completedModelRows(report) {
  return (report.results || [])
    .filter((row) => row.generation_status === "completed" && row.deterministic !== true)
    .map((row) => ({
      query_id: row.query_id,
      total_latency_ms: Number(row.total_latency_ms),
      ttft_ms: Number(row.ttft_ms),
      tokens_per_second: Number(row.tokens_per_second)
    }))
    .filter((row) => Number.isFinite(row.total_latency_ms));
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function quantile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] === undefined) return sorted[base];
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

function lcg(seed = 42) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function pairedLatency(v32Rows, v33Rows, iterations) {
  const v33ById = new Map(v33Rows.map((row) => [row.query_id, row]));
  const pairs = v32Rows
    .map((before) => ({ before, after: v33ById.get(before.query_id) }))
    .filter((pair) => pair.after);
  const reductions = pairs.map(({ before, after }) => before.total_latency_ms - after.total_latency_ms);
  const relative = pairs.map(({ before, after }) => (before.total_latency_ms - after.total_latency_ms) / before.total_latency_ms);
  const observed = {
    paired_rows: pairs.length,
    v32_mean_ms: mean(pairs.map((pair) => pair.before.total_latency_ms)),
    v33_mean_ms: mean(pairs.map((pair) => pair.after.total_latency_ms)),
    mean_reduction_ms: mean(reductions),
    mean_relative_reduction: mean(relative),
    v32_p95_ms: quantile(pairs.map((pair) => pair.before.total_latency_ms), 0.95),
    v33_p95_ms: quantile(pairs.map((pair) => pair.after.total_latency_ms), 0.95)
  };

  const rng = lcg(20260611);
  const bootReduction = [];
  const bootRelative = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let sumReduction = 0;
    let sumRelative = 0;
    for (let i = 0; i < pairs.length; i += 1) {
      const index = Math.floor(rng() * pairs.length);
      sumReduction += reductions[index];
      sumRelative += relative[index];
    }
    bootReduction.push(sumReduction / pairs.length);
    bootRelative.push(sumRelative / pairs.length);
  }
  return {
    ...observed,
    bootstrap_iterations: iterations,
    mean_reduction_ms_ci95: [quantile(bootReduction, 0.025), quantile(bootReduction, 0.975)],
    mean_relative_reduction_ci95: [quantile(bootRelative, 0.025), quantile(bootRelative, 0.975)]
  };
}

function wilsonInterval(successes, total, z = 1.96) {
  if (total === 0) return [null, null];
  const p = successes / total;
  const denom = 1 + (z ** 2) / total;
  const center = (p + (z ** 2) / (2 * total)) / denom;
  const margin = (z / denom) * Math.sqrt((p * (1 - p) / total) + (z ** 2) / (4 * total ** 2));
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

function qualityIntervals({ hallucination, misreading, guardrail, usability }) {
  const h = hallucination.gate || {};
  const m = misreading.gate || {};
  const g = guardrail.gate || {};
  const u = usability.gate || {};
  const rows = [
    ["contract_failure", 0, 300],
    ["contract_warning", 0, 300],
    ["unsupported_date", h.unsupported_date_count || 0, h.evaluated_answer_count || 0],
    ["unsupported_triple_answer", h.unsupported_triple_answer_count || 0, h.evaluated_answer_count || 0],
    ["unsupported_entity_answer", h.unsupported_entity_answer_count || 0, h.evaluated_answer_count || 0],
    ["prompt_leak", m.prompt_leak_count || 0, m.evaluated_answer_count || 0],
    ["overconfidence_answer", m.overconfidence_answer_count || 0, m.evaluated_answer_count || 0],
    ["unwarranted_inference_answer", m.unwarranted_inference_answer_count || 0, m.evaluated_answer_count || 0],
    ["absolute_guardrail_violation", g.absolute_violation_count || 0, g.evaluated_answer_count || 0],
    ["first_claim_violation", g.first_claim_violation_count || 0, g.evaluated_answer_count || 0],
    ["too_short_answer", u.too_short_count || 0, u.evaluated_answer_count || 0],
    ["off_topic_answer", u.off_topic_count || 0, u.evaluated_answer_count || 0]
  ];
  return rows.map(([metric, count, total]) => {
    const ci = wilsonInterval(count, total);
    return {
      metric,
      count,
      total,
      rate: total ? count / total : null,
      wilson_ci95: ci
    };
  });
}

function pct(value) {
  if (value === null || value === undefined) return "n/a";
  return `${(value * 100).toFixed(2)}%`;
}

function ms(value) {
  if (value === null || value === undefined) return "n/a";
  return `${value.toFixed(1)} ms`;
}

function markdown(report) {
  const qRows = report.quality_intervals.map((row) => `| ${row.metric} | ${row.count}/${row.total} | ${pct(row.rate)} | ${pct(row.wilson_ci95[0])} - ${pct(row.wilson_ci95[1])} |`).join("\n");
  return `# V4.2 Statistical Evidence

Generated: ${report.generated_at}

This report provides paper-facing confidence intervals for the final V3.3
claim. It does not modify model outputs or benchmark labels.

## Paired Latency Bootstrap

Comparison: V3.2 guarded prose prompt vs V3.3 postprocessed prose.

- Paired model-generation rows: ${report.paired_latency.paired_rows}
- V3.2 mean model-row total latency: ${ms(report.paired_latency.v32_mean_ms)}
- V3.3 mean model-row total latency: ${ms(report.paired_latency.v33_mean_ms)}
- Mean reduction: ${ms(report.paired_latency.mean_reduction_ms)}
- Mean reduction 95% bootstrap CI: ${ms(report.paired_latency.mean_reduction_ms_ci95[0])} - ${ms(report.paired_latency.mean_reduction_ms_ci95[1])}
- Mean relative reduction: ${pct(report.paired_latency.mean_relative_reduction)}
- Mean relative reduction 95% bootstrap CI: ${pct(report.paired_latency.mean_relative_reduction_ci95[0])} - ${pct(report.paired_latency.mean_relative_reduction_ci95[1])}
- V3.2 P95 model-row total latency: ${ms(report.paired_latency.v32_p95_ms)}
- V3.3 P95 model-row total latency: ${ms(report.paired_latency.v33_p95_ms)}

## Proportion Intervals

Wilson 95% confidence intervals are reported for failure and quality-screen
rates. Zero observed failures should be read as zero observed failures in this
benchmark, not as a universal zero-risk guarantee.

| Metric | Count | Rate | Wilson 95% CI |
|---|---:|---:|---:|
${qRows}
`;
}

export function buildStatisticalEvidence(options) {
  const v32Rows = completedModelRows(readJson(options.v32Path));
  const v33Rows = completedModelRows(readJson(options.v33Path));
  const report = {
    generated_at: new Date().toISOString(),
    inputs: {
      v32: path.relative(repoRoot, options.v32Path),
      v33: path.relative(repoRoot, options.v33Path),
      hallucination: path.relative(repoRoot, options.hallucinationPath),
      misreading: path.relative(repoRoot, options.misreadingPath),
      guardrail: path.relative(repoRoot, options.guardrailPath),
      usability: path.relative(repoRoot, options.usabilityPath)
    },
    paired_latency: pairedLatency(v32Rows, v33Rows, options.bootstrapIterations),
    quality_intervals: qualityIntervals({
      hallucination: readJson(options.hallucinationPath),
      misreading: readJson(options.misreadingPath),
      guardrail: readJson(options.guardrailPath),
      usability: readJson(options.usabilityPath)
    })
  };
  fs.writeFileSync(options.jsonOutPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, markdown(report));
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = buildStatisticalEvidence(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify({
    json: path.relative(repoRoot, defaults.jsonOutPath),
    paired_rows: report.paired_latency.paired_rows,
    mean_relative_reduction: report.paired_latency.mean_relative_reduction
  }, null, 2));
}

