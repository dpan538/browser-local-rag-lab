#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  triagePath: path.join(repoRoot, "reports/round03_300_latency_triage.json"),
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  retrievalPath: path.join(repoRoot, "reports/retrieval_sufficiency_300_contract.json"),
  outDir: path.join(repoRoot, "fixtures/optimization/round03_latency_pilot50"),
  reportPath: path.join(repoRoot, "reports/ROUND_03_LATENCY_PILOT50_SELECTION.md"),
  manifestPath: path.join(repoRoot, "reports/round03_latency_pilot50_selection.json")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--triage") parsed.triagePath = path.resolve(args[++index]);
    else if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--retrieval") parsed.retrievalPath = path.resolve(args[++index]);
    else if (arg === "--out-dir") parsed.outDir = path.resolve(args[++index]);
    else if (arg === "--report") parsed.reportPath = path.resolve(args[++index]);
    else if (arg === "--manifest") parsed.manifestPath = path.resolve(args[++index]);
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

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function addSelected(selected, rows, count, bucket) {
  for (const row of rows) {
    if (selected.size >= 50) return;
    if (selected.has(row.query_id)) continue;
    selected.set(row.query_id, { query_id: row.query_id, bucket });
    count.value += 1;
    if (count.value >= count.target) return;
  }
}

function byId(rows) {
  return new Map(rows.map((row) => [row.query_id || row.id, row]));
}

function markdown(manifest) {
  const rows = manifest.selected.map((row) => `| ${row.query_id} | ${row.intent} | ${row.bucket} | ${row.total_latency_ms ?? ""} | ${row.tokens_per_second ?? ""} | ${row.prompt_tokens_est ?? ""} |`).join("\n");
  const bucketRows = Object.entries(manifest.bucket_counts)
    .map(([bucket, count]) => `| ${bucket} | ${count} |`)
    .join("\n");
  const intentRows = Object.entries(manifest.intent_counts)
    .map(([intent, count]) => `| ${intent} | ${count} |`)
    .join("\n");
  return `# Round 03 Latency Pilot 50 Selection

Generated: ${manifest.generated_at}

This fixture defines a fixed 50-query pilot set for Round 03 performance
optimization variants. It is selected from the completed 300-query scale
baseline and is intentionally stratified around the latency problem rather
than simply using the first 50 queries.

The pilot is research-only. It does not modify archive product runtime,
download images, or add model weights.

## Selection Buckets

| Bucket | Count |
|---|---:|
${bucketRows}

## Intent Coverage

| Intent | Count |
|---|---:|
${intentRows}

## Selected Queries

| Query | Intent | Bucket | Total ms | tokens/s | Prompt tokens |
|---|---|---|---:|---:|---:|
${rows}

## Use

Run future Round 03 optimization pilots against:

\`\`\`text
fixtures/optimization/round03_latency_pilot50/queries.jsonl
fixtures/optimization/round03_latency_pilot50/labels.jsonl
fixtures/optimization/round03_latency_pilot50/records.jsonl
fixtures/optimization/round03_latency_pilot50/retrieval_sufficiency.json
\`\`\`

The same pilot should be reused across \`r03_v1_length_control\`,
\`r03_v2_evidence_compress\`, \`r03_v3_hybrid_deterministic_lanes\`, and
\`r03_v4_combined\` so latency comparisons are not confounded by query
selection.
`;
}

export function buildPilotFixture({
  triagePath = defaults.triagePath,
  queriesPath = defaults.queriesPath,
  labelsPath = defaults.labelsPath,
  recordsPath = defaults.recordsPath,
  retrievalPath = defaults.retrievalPath,
  outDir = defaults.outDir,
  reportPath = defaults.reportPath,
  manifestPath = defaults.manifestPath
} = {}) {
  const triage = readJson(triagePath);
  const queries = readJsonl(queriesPath);
  const labels = readJsonl(labelsPath);
  const records = readJsonl(recordsPath);
  const retrieval = readJson(retrievalPath);
  const queryMap = byId(queries);
  const labelMap = byId(labels);
  const rowMap = new Map(triage.rows.map((row) => [row.query_id, row]));
  const retrievalMap = new Map((retrieval.rows || []).map((row) => [row.query_id, row]));

  const selected = new Map();

  addSelected(selected, triage.slow_rows, { value: 0, target: 26 }, "latency_tail_top26");

  const lowSpeedRows = [...triage.rows]
    .filter((row) => row.tokens_per_second < triage.thresholds.low_speed_tokens_per_second)
    .sort((left, right) => left.tokens_per_second - right.tokens_per_second);
  addSelected(selected, lowSpeedRows, { value: 0, target: 8 }, "low_decode_speed");

  const sourceRightsRows = [...triage.rows]
    .filter((row) => row.intent === "source_rights_question")
    .sort((left, right) => right.total_latency_ms - left.total_latency_ms);
  addSelected(selected, sourceRightsRows, { value: 0, target: 6 }, "source_rights_hybrid_candidate");

  const refusalRows = [...triage.rows]
    .filter((row) => row.refusal_expected)
    .sort((left, right) => right.total_latency_ms - left.total_latency_ms);
  addSelected(selected, refusalRows, { value: 0, target: 5 }, "refusal_hybrid_candidate");

  const fastControlRows = [...triage.rows]
    .filter((row) => !selected.has(row.query_id) && row.total_latency_ms < 7500)
    .sort((left, right) => {
      const leftScore = Math.abs(left.total_latency_ms - triage.summary.p50_total_ms);
      const rightScore = Math.abs(right.total_latency_ms - triage.summary.p50_total_ms);
      return leftScore - rightScore;
    });
  addSelected(selected, fastControlRows, { value: 0, target: 50 - selected.size }, "fast_control");

  const selectedIds = [...selected.keys()];
  const selectedQueries = selectedIds.map((id) => queryMap.get(id)).filter(Boolean);
  const selectedLabels = selectedIds.map((id) => labelMap.get(id)).filter(Boolean);
  const selectedRetrievalRows = selectedIds.map((id) => retrievalMap.get(id)).filter(Boolean);

  fs.mkdirSync(outDir, { recursive: true });
  writeJsonl(path.join(outDir, "queries.jsonl"), selectedQueries);
  writeJsonl(path.join(outDir, "labels.jsonl"), selectedLabels);
  writeJsonl(path.join(outDir, "records.jsonl"), records);
  fs.writeFileSync(path.join(outDir, "retrieval_sufficiency.json"), JSON.stringify({
    ...retrieval,
    meta: {
      ...(retrieval.meta || {}),
      source_retrieval: path.relative(repoRoot, retrievalPath),
      pilot_selection: "round03_latency_pilot50",
      research_only: true
    },
    summary: {
      ...(retrieval.summary || {}),
      pilot_row_count: selectedRetrievalRows.length
    },
    rows: selectedRetrievalRows
  }, null, 2) + "\n");

  const bucketCounts = {};
  const intentCounts = {};
  const selectedRows = selectedIds.map((id) => {
    const triageRow = rowMap.get(id) || {};
    const label = labelMap.get(id) || {};
    const bucket = selected.get(id).bucket;
    bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
    intentCounts[label.intent || triageRow.intent || "unknown"] = (intentCounts[label.intent || triageRow.intent || "unknown"] || 0) + 1;
    return {
      query_id: id,
      intent: label.intent || triageRow.intent,
      bucket,
      total_latency_ms: triageRow.total_latency_ms,
      tokens_per_second: triageRow.tokens_per_second,
      prompt_tokens_est: triageRow.prompt_tokens_est
    };
  });

  const manifest = {
    generated_at: new Date().toISOString(),
    source_triage: path.relative(repoRoot, triagePath),
    source_queries: path.relative(repoRoot, queriesPath),
    source_labels: path.relative(repoRoot, labelsPath),
    source_records: path.relative(repoRoot, recordsPath),
    source_retrieval: path.relative(repoRoot, retrievalPath),
    out_dir: path.relative(repoRoot, outDir),
    selected_count: selectedRows.length,
    bucket_counts: bucketCounts,
    intent_counts: intentCounts,
    selected: selectedRows
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(reportPath, markdown(manifest));
  return manifest;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const manifest = buildPilotFixture(args);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, args.reportPath),
    manifest: path.relative(repoRoot, args.manifestPath),
    out_dir: path.relative(repoRoot, args.outDir),
    selected_count: manifest.selected_count
  }, null, 2));
}
