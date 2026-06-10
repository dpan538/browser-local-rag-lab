#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";
import { finalizeAnswer } from "./prompt_builder.mjs";
import { importWebllmRound } from "./import_webllm_round.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  packetsPath: path.join(repoRoot, "reports/v41_universal_packets_pilot50.json"),
  rawGenerationsPath: null,
  roundId: "v41_cross_model_pilot50",
  runtimeName: "external_model_adapter",
  modelId: "unknown_external_model",
  modelGenerationLabel: "External model",
  jsonOutPath: path.join(repoRoot, "reports/v41_cross_model_pilot50_export.json"),
  importedJsonPath: path.join(repoRoot, "reports/v41_cross_model_pilot50.json"),
  answersOutPath: path.join(repoRoot, "reports/v41_cross_model_pilot50_answers.jsonl"),
  mdOutPath: path.join(repoRoot, "reports/V41_CROSS_MODEL_PILOT50.md"),
  strict: false
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--packets") parsed.packetsPath = path.resolve(args[++index]);
    else if (arg === "--raw-generations") parsed.rawGenerationsPath = path.resolve(args[++index]);
    else if (arg === "--round-id") parsed.roundId = args[++index];
    else if (arg === "--runtime") parsed.runtimeName = args[++index];
    else if (arg === "--model-id") parsed.modelId = args[++index];
    else if (arg === "--model-label") parsed.modelGenerationLabel = args[++index];
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--imported-json-out") parsed.importedJsonPath = path.resolve(args[++index]);
    else if (arg === "--answers-out") parsed.answersOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--strict") parsed.strict = true;
  }
  return parsed;
}

function readJsonl(filePath) {
  if (!filePath) return [];
  if (!fs.existsSync(filePath)) {
    throw new Error(`Raw generation file not found: ${path.relative(repoRoot, filePath)}`);
  }
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function promptTokenEstimate(prompt) {
  return Math.ceil(String(prompt || "").length / 4);
}

function outputTokens(text) {
  return Math.max(1, Math.ceil(String(text || "").trim().split(/\s+/).filter(Boolean).length * 1.25));
}

function numeric(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function rawText(row = {}) {
  return row.generated_text ?? row.answer_text ?? row.raw_answer_text ?? row.text ?? "";
}

function queryLabel(packetRow) {
  return {
    intent: packetRow.intent,
    refusal_expected: packetRow.refusal_expected,
    required_fields: packetRow.required_fields || [],
    must_not_invent_fields: packetRow.must_not_invent_fields || []
  };
}

function queryObject(packetRow) {
  return {
    id: packetRow.query_id,
    query_text: packetRow.query_text,
    text: packetRow.query_text
  };
}

function idsToString(ids = []) {
  return ids.join("|");
}

function deterministicResult(packetRow, startedAt) {
  const elapsed = Math.max(0, Date.now() - startedAt);
  return {
    query_id: packetRow.query_id,
    intent: packetRow.intent,
    lane: packetRow.lane,
    variant_id: packetRow.packet_variant,
    prompt_variant: packetRow.prompt_variant,
    producer: "v41_model_agnostic_adapter",
    generation_status: "completed",
    retrieved_ids: idsToString(packetRow.retrieved_ids),
    candidate_count: packetRow.retrieved_ids?.length || 0,
    prompt_chars: 0,
    prompt_tokens_est: 0,
    model_load_ms: 0,
    tokenization_ms: null,
    cache_state: "system_deterministic",
    device_error: null,
    deterministic: true,
    hybrid_lane: packetRow.deterministic_lane,
    latency_bucket: "hybrid_system_latency",
    answer_text: packetRow.deterministic_answer_text,
    raw_answer_text: packetRow.deterministic_answer_text,
    ttft_ms: elapsed,
    total_latency_ms: elapsed,
    output_tokens: outputTokens(packetRow.deterministic_answer_text),
    tokens_per_second: 0,
    model_answer_text: "",
    answer_postprocess: "v41_deterministic_lane",
    postprocess_actions: []
  };
}

function modelResult(packetRow, rawRow) {
  if (!rawRow || rawRow.generation_status === "error") {
    return {
      query_id: packetRow.query_id,
      intent: packetRow.intent,
      lane: packetRow.lane,
      variant_id: packetRow.packet_variant,
      prompt_variant: packetRow.prompt_variant,
      producer: "v41_model_agnostic_adapter",
      generation_status: "error",
      retrieved_ids: idsToString(packetRow.retrieved_ids),
      candidate_count: packetRow.retrieved_ids?.length || 0,
      prompt_chars: String(packetRow.model_prompt || "").length,
      prompt_tokens_est: promptTokenEstimate(packetRow.model_prompt),
      model_load_ms: numeric(rawRow?.model_load_ms, 0),
      tokenization_ms: rawRow?.tokenization_ms ?? null,
      cache_state: rawRow?.cache_state || "external_model_result",
      device_error: rawRow?.device_error || rawRow?.error || "missing_raw_generation",
      deterministic: false,
      hybrid_lane: null,
      latency_bucket: "external_model_generation_latency",
      answer_text: "",
      raw_answer_text: rawText(rawRow),
      ttft_ms: numeric(rawRow?.ttft_ms, 0),
      total_latency_ms: numeric(rawRow?.total_latency_ms ?? rawRow?.latency_ms, 0),
      output_tokens: numeric(rawRow?.output_tokens, 0),
      tokens_per_second: numeric(rawRow?.tokens_per_second, 0)
    };
  }

  const packet = {
    query: queryObject(packetRow),
    label: queryLabel(packetRow),
    evidence: packetRow.evidence_records || [],
    retrievedIds: packetRow.retrieved_ids || []
  };
  const generated = rawText(rawRow);
  const finalized = finalizeAnswer(packet, generated, { promptVariant: packetRow.prompt_variant });
  const outTokens = numeric(rawRow.output_tokens, outputTokens(generated));
  const totalMs = numeric(rawRow.total_latency_ms ?? rawRow.latency_ms, 0);
  return {
    query_id: packetRow.query_id,
    intent: packetRow.intent,
    lane: packetRow.lane,
    variant_id: packetRow.packet_variant,
    prompt_variant: packetRow.prompt_variant,
    producer: `v41_${String(rawRow.runtime_name || rawRow.runtime || "external_model").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
    generation_status: "completed",
    retrieved_ids: idsToString(packetRow.retrieved_ids),
    candidate_count: packetRow.retrieved_ids?.length || 0,
    prompt_chars: String(packetRow.model_prompt || "").length,
    prompt_tokens_est: numeric(rawRow.prompt_tokens_est, promptTokenEstimate(packetRow.model_prompt)),
    model_load_ms: numeric(rawRow.model_load_ms, 0),
    tokenization_ms: rawRow.tokenization_ms ?? null,
    cache_state: rawRow.cache_state || "external_model_result",
    device_error: rawRow.device_error ?? null,
    deterministic: false,
    hybrid_lane: null,
    latency_bucket: "external_model_generation_latency",
    answer_text: finalized.answer_text,
    raw_answer_text: generated,
    ttft_ms: numeric(rawRow.ttft_ms, totalMs),
    total_latency_ms: totalMs,
    output_tokens: outTokens,
    tokens_per_second: numeric(rawRow.tokens_per_second, totalMs > 0 ? outTokens / (totalMs / 1000) : 0),
    model_answer_text: generated,
    answer_postprocess: finalized.answer_postprocess,
    postprocess_actions: finalized.postprocess_actions
  };
}

export function finalizeV41ModelResults(options) {
  if (!options.rawGenerationsPath) {
    throw new Error("--raw-generations is required. Use build_v41_raw_generation_template.mjs to create a fillable template.");
  }
  const packets = JSON.parse(fs.readFileSync(options.packetsPath, "utf8"));
  const rawRows = readJsonl(options.rawGenerationsPath);
  const rawById = new Map(rawRows.map((row) => [row.query_id, row]));
  const results = packets.rows.map((packetRow) => {
    const startedAt = Date.now();
    if (packetRow.deterministic_lane) return deterministicResult(packetRow, startedAt);
    return modelResult(packetRow, rawById.get(packetRow.query_id));
  });
  const payload = {
    _provenance: {
      step: "finalize_v41_model_results",
      timestamp: new Date().toISOString(),
      commit: gitCommit(),
      packets: path.relative(repoRoot, options.packetsPath),
      raw_generations: path.relative(repoRoot, options.rawGenerationsPath)
    },
    meta: {
      round_id: options.roundId,
      variant_id: packets.summary?.packet_variant || packets.rows[0]?.packet_variant || "top3_gold_contract_source_rights",
      prompt_variant: packets.rows[0]?.prompt_variant || "r03_v33_postprocessed_prose",
      model_id: options.modelId,
      model_generation_label: options.modelGenerationLabel,
      runtime: options.runtimeName,
      webgpu: { status: "not_applicable" },
      queries_path: packets._provenance?.inputs?.queries || "fixtures/expansion/round03_300/queries.jsonl",
      labels_path: packets._provenance?.inputs?.labels || "fixtures/expansion/round03_300/labels.jsonl",
      records_path: packets._provenance?.inputs?.records || "fixtures/expansion/round03_300/records.jsonl",
      note: "V4.1 model-agnostic cross-model adapter output. Deterministic lanes are system generated; model rows are finalized with the same prose polisher and evidence tag injection used by V3.3."
    },
    results
  };

  fs.writeFileSync(options.jsonOutPath, JSON.stringify(payload, null, 2) + "\n");
  const summary = importWebllmRound(options.jsonOutPath, {
    outputJsonPath: options.importedJsonPath,
    answersPath: options.answersOutPath,
    reportMdPath: options.mdOutPath
  });
  return {
    export_json: path.relative(repoRoot, options.jsonOutPath),
    ...summary
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = finalizeV41ModelResults(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    if (process.argv.includes("--strict") && (result.error_count > 0 || result.contract_fail_count > 0 || result.contract_warn_count > 0)) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error?.message || String(error));
    process.exit(1);
  }
}
