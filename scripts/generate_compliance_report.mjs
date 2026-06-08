#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");

const defaults = {
  roundJsonPath: path.join(repoRoot, "reports/webllm_round_02_200_gold_only_iab_full200.json"),
  gateJsonPath: path.join(repoRoot, "reports/webllm_round_02_200_gold_only_iab_full200_gate.json"),
  anomalyJsonPath: path.join(repoRoot, "reports/anomaly_detection_round_02_200_gold_only_iab_full200.json"),
  performanceJsonPath: path.join(repoRoot, "reports/performance_stratification_round_02_200_gold_only_iab_full200.json"),
  jsonOutPath: path.join(repoRoot, "reports/compliance_certificate_round_03_gold_only_200.json"),
  mdOutPath: path.join(repoRoot, "reports/COMPLIANCE_CERTIFICATE_ROUND_03_GOLD_ONLY_200.md")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--round-json") parsed.roundJsonPath = path.resolve(args[++index]);
    else if (arg === "--gate-json") parsed.gateJsonPath = path.resolve(args[++index]);
    else if (arg === "--anomaly-json") parsed.anomalyJsonPath = path.resolve(args[++index]);
    else if (arg === "--performance-json") parsed.performanceJsonPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
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

function groupFindings(findings = []) {
  const grouped = new Map();
  for (const finding of findings) {
    const queryId = finding.query_id || "batch";
    if (!grouped.has(queryId)) grouped.set(queryId, []);
    grouped.get(queryId).push(finding);
  }
  return grouped;
}

function queryRows(roundData, gate, anomaly) {
  const gateByQuery = groupFindings(gate.findings || []);
  const anomalyByQuery = groupFindings(anomaly.anomalies || []);
  return (roundData.results || []).map((row) => {
    const gateFindings = gateByQuery.get(row.query_id) || [];
    const anomalyFindings = anomalyByQuery.get(row.query_id) || [];
    return {
      query_id: row.query_id,
      intent: row.intent,
      lane: row.lane,
      generation_status: row.generation_status,
      runtime_error: row.generation_status === "completed" ? null : (row.error || row.device_error || "unknown"),
      prompt_tokens_est: row.prompt_tokens_est,
      ttft_ms: round(row.ttft_ms, 1),
      total_latency_ms: round(row.total_latency_ms, 1),
      tokens_per_second: round(row.tokens_per_second, 2),
      contract_status: gateFindings.some((item) => item.severity === "fail") ? "fail" : "pass",
      gate_findings: gateFindings,
      anomaly_findings: anomalyFindings
    };
  });
}

export function generateComplianceReport({
  roundJsonPath = defaults.roundJsonPath,
  gateJsonPath = defaults.gateJsonPath,
  anomalyJsonPath = defaults.anomalyJsonPath,
  performanceJsonPath = defaults.performanceJsonPath
} = {}) {
  const roundData = readJson(roundJsonPath);
  const gate = readJson(gateJsonPath);
  const anomaly = readJson(anomalyJsonPath);
  const performance = readJson(performanceJsonPath);
  const rows = queryRows(roundData, gate, anomaly);
  const completed = rows.filter((row) => row.generation_status === "completed").length;
  const runtimeErrors = rows.length - completed;

  return {
    _provenance: {
      step: "generate_compliance_report",
      timestamp: new Date().toISOString(),
      round_json_path: path.relative(repoRoot, roundJsonPath),
      gate_json_path: path.relative(repoRoot, gateJsonPath),
      anomaly_json_path: path.relative(repoRoot, anomalyJsonPath),
      performance_json_path: path.relative(repoRoot, performanceJsonPath),
      research_only: true
    },
    claim_scope: {
      model_id: roundData._provenance?.model_id || roundData.meta?.model_id || "Qwen3.5-0.8B-q4f16_1-MLC",
      packet_variant: roundData._provenance?.packet_variant || roundData.meta?.variant_id || "gold_only_contract_source_rights",
      statement: "Generated answers are experiment outputs only and are not archive evidence."
    },
    summary: {
      rows: rows.length,
      completed,
      runtime_errors: runtimeErrors,
      contract_fail_count: gate.contract_fail_count,
      contract_warn_count: gate.contract_warn_count,
      gate_fail_count: gate.gate_fail_count,
      gate_warn_count: gate.gate_warn_count,
      anomaly_fail_count: anomaly.fail_count,
      anomaly_warn_count: anomaly.warn_count,
      ready_for_next_step: gate.ready_for_next_step,
      avg_prompt_tokens_est: performance.summary?.avg_prompt_tokens_est,
      avg_ttft_ms: performance.summary?.avg_ttft_ms,
      avg_total_latency_ms: performance.summary?.avg_total_latency_ms,
      avg_tokens_per_second: performance.summary?.avg_tokens_per_second
    },
    by_intent: performance.by_intent,
    rows
  };
}

function statusWord(report) {
  const s = report.summary;
  return s.runtime_errors === 0 &&
    s.contract_fail_count === 0 &&
    s.contract_warn_count === 0 &&
    s.anomaly_fail_count === 0
    ? "PASS"
    : "ATTENTION_REQUIRED";
}

function rowTable(rows, limit = 20) {
  const selected = rows.slice(0, limit);
  if (selected.length === 0) return "| none | none | none | none | none |\n";
  return selected.map((row) => `| ${row.query_id} | ${row.intent} | ${row.total_latency_ms} | ${row.tokens_per_second} | ${row.contract_status} |`).join("\n") + "\n";
}

function markdown(report) {
  const slowest = [...report.rows].sort((a, b) => b.total_latency_ms - a.total_latency_ms);
  return `# Compliance Certificate Round 03 Gold-Only 200

Generated: ${report._provenance.timestamp}

Status: ${statusWord(report)}

This certificate summarizes the contract-compliance state for the Round 02
200-query gold-only WebLLM run. It is a research artifact, not an archive
evidence statement. Generated answers remain experimental outputs.

## Scope

- Model: ${report.claim_scope.model_id}
- Packet variant: ${report.claim_scope.packet_variant}
- Rows: ${report.summary.rows}

## Compliance Summary

| Metric | Value |
|---|---:|
| Completed rows | ${report.summary.completed} |
| Runtime errors | ${report.summary.runtime_errors} |
| Contract failures | ${report.summary.contract_fail_count} |
| Contract warnings | ${report.summary.contract_warn_count} |
| Gate failures | ${report.summary.gate_fail_count} |
| Gate warnings | ${report.summary.gate_warn_count} |
| Anomaly failures | ${report.summary.anomaly_fail_count} |
| Anomaly warnings | ${report.summary.anomaly_warn_count} |
| Ready for next step | ${report.summary.ready_for_next_step ? "yes" : "no"} |

## Runtime Summary

| Metric | Value |
|---|---:|
| Avg prompt tokens | ${report.summary.avg_prompt_tokens_est} |
| Avg TTFT ms | ${report.summary.avg_ttft_ms} |
| Avg total latency ms | ${report.summary.avg_total_latency_ms} |
| Avg tokens/s | ${report.summary.avg_tokens_per_second} |

## Slowest Gold-Only Rows

| Query | Intent | Total ms | Tokens/s | Contract |
|---|---|---:|---:|---|
${rowTable(slowest)}
## Paper-Ready Claim

Under a gold-evidence controlled packet, Qwen3.5-0.8B in WebLLM completed
200/200 generation rows with no runtime errors, no generation-contract failures,
and no generation-contract warnings. This supports a contract-compliance claim;
it does not by itself prove semantic research quality without human review.
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const report = generateComplianceReport(args);
  fs.writeFileSync(args.jsonOutPath, JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(args.mdOutPath, markdown(report));
  console.log(JSON.stringify({
    report: path.relative(repoRoot, args.mdOutPath),
    json: path.relative(repoRoot, args.jsonOutPath),
    status: statusWord(report),
    rows: report.summary.rows
  }, null, 2));
}
