#!/usr/bin/env node
import childProcess from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  roundJsonPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v33_postprocessed_prose.json"),
  answersPath: path.join(repoRoot, "reports/webllm_round_03_latency300_v33_postprocessed_prose_answers.jsonl"),
  outputPath: path.join(repoRoot, "experiments/v3.3_contract_top3_300/manifest.json")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--round-json") parsed.roundJsonPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--out") parsed.outputPath = path.resolve(args[++index]);
  }
  return parsed;
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8"
    }).trim();
  } catch {
    return "unknown";
  }
}

function npmVersion() {
  try {
    return childProcess.execFileSync("npm", ["--version"], {
      cwd: repoRoot,
      encoding: "utf8"
    }).trim();
  } catch {
    return "unknown";
  }
}

function relative(filePath) {
  return path.relative(repoRoot, filePath);
}

function resolveLabPath(value, fallback) {
  if (!value) return fallback;
  if (path.isAbsolute(value)) return value;
  const rootRelative = path.resolve(repoRoot, value);
  if (fs.existsSync(rootRelative)) return rootRelative;
  return path.resolve(repoRoot, "browser_lab", value);
}

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function fileRecord(filePath) {
  return {
    path: relative(filePath),
    sha256: sha256(filePath)
  };
}

function average(rows, field) {
  const values = rows.map((row) => row[field]).filter((value) => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildManifest(options) {
  const round = JSON.parse(fs.readFileSync(options.roundJsonPath, "utf8"));
  const meta = round.meta || {};
  const results = round.results || [];
  const completed = results.filter((row) => row.generation_status === "completed");
  const deterministicRows = completed.filter((row) => row.deterministic === true || row.latency_bucket === "hybrid_system_latency");
  const modelRows = completed.filter((row) => !deterministicRows.includes(row));
  const queriesPath = resolveLabPath(meta.queries_path, path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"));
  const labelsPath = resolveLabPath(meta.labels_path, path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"));
  const recordsPath = resolveLabPath(meta.records_path, path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"));
  const retrievalPath = resolveLabPath(meta.retrieval_path, path.join(repoRoot, "reports/retrieval_sufficiency_300_contract.json"));
  const supportingFiles = [
    queriesPath,
    labelsPath,
    recordsPath,
    retrievalPath,
    options.roundJsonPath,
    options.answersPath,
    path.join(repoRoot, "reports/WEBLLM_ROUND_03_LATENCY300_V33_POSTPROCESSED_PROSE.md"),
    path.join(repoRoot, "reports/STATISTICAL_EVIDENCE_V42.md"),
    path.join(repoRoot, "reports/V42_EVIDENCE_CLOSURE_ANALYSIS.md"),
    path.join(repoRoot, "reports/V41_FINAL_CROSS_MODEL_RECORD.md")
  ].filter((filePath) => fs.existsSync(filePath));

  return {
    condition_id: "v3.3_contract_top3_300_delivered",
    generated_at: new Date().toISOString(),
    commit_sha: gitCommit(),
    runtime_environment: {
      node_version: process.version,
      npm_version: npmVersion(),
      os_platform: process.platform,
      os_arch: process.arch,
      browser_user_agent: meta.user_agent || "unknown",
      webgpu_status: meta.webgpu?.status || "unknown",
      webgpu_has_navigator_gpu: meta.webgpu?.has_navigator_gpu ?? null,
      cache_state: meta.cache_state || "unknown"
    },
    experiment_scope: {
      research_only: meta.research_only === true,
      row_count: results.length,
      completed_rows: completed.length,
      deterministic_hybrid_rows: deterministicRows.length,
      qwen_model_generation_rows: modelRows.length,
      retrieval_condition: meta.variant_id || "unknown",
      prompt_variant: meta.prompt_variant || "unknown",
      claim_boundary: "Controlled contract/gold-evidence generation condition; not an end-to-end product retrieval recall claim."
    },
    model_runtime: {
      model_id: meta.model_id || "unknown",
      model_url: meta.model_url || "unknown",
      model_lib_url: meta.model_lib_url || "unknown",
      runtime: "WebLLM/MLC custom browser runtime"
    },
    summary_metrics: {
      qwen_avg_ttft_ms: average(modelRows, "ttft_ms"),
      qwen_avg_total_latency_ms: average(modelRows, "total_latency_ms"),
      qwen_avg_tokens_per_second: average(modelRows, "tokens_per_second"),
      all_row_avg_total_latency_ms: average(completed, "total_latency_ms"),
      deterministic_avg_total_latency_ms: average(deterministicRows, "total_latency_ms")
    },
    files: supportingFiles.map(fileRecord),
    notes: [
      "Delivered answers include deterministic refusal/source-rights lanes, postprocessed prose, and deterministic evidence-tag injection.",
      "Raw model text is preserved in the round JSON for separation from delivered-answer metrics.",
      "Model weights, browser caches, images, secrets, and raw HTML are not part of this manifest."
    ]
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const manifest = buildManifest(options);
  fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
  fs.writeFileSync(options.outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({
    manifest: relative(options.outputPath),
    condition_id: manifest.condition_id,
    files: manifest.files.length
  }, null, 2));
}
