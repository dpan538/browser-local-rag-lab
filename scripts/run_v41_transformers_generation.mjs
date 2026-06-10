#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";
import { pipeline, env } from "@huggingface/transformers";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  templatePath: path.join(repoRoot, "reports/v41_raw_generation_template_pilot50.jsonl"),
  outputPath: path.join(repoRoot, "reports/v41_raw_generations_pilot50.jsonl"),
  modelId: "HuggingFaceTB/SmolLM2-135M-Instruct",
  runtimeName: "transformers_js_node",
  maxNewTokens: 80,
  start: 1,
  limit: null,
  device: null,
  dtype: null
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--template") parsed.templatePath = path.resolve(args[++index]);
    else if (arg === "--out") parsed.outputPath = path.resolve(args[++index]);
    else if (arg === "--model") parsed.modelId = args[++index];
    else if (arg === "--runtime") parsed.runtimeName = args[++index];
    else if (arg === "--max-new-tokens") parsed.maxNewTokens = Number(args[++index]);
    else if (arg === "--start") parsed.start = Math.max(1, Number(args[++index]));
    else if (arg === "--limit") parsed.limit = Math.max(1, Number(args[++index]));
    else if (arg === "--device") parsed.device = args[++index];
    else if (arg === "--dtype") parsed.dtype = args[++index];
  }
  return parsed;
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function nowMs() {
  return globalThis.performance?.now ? globalThis.performance.now() : Date.now();
}

function outputTokens(text) {
  return Math.max(1, Math.ceil(String(text || "").trim().split(/\s+/).filter(Boolean).length * 1.25));
}

function generatedTextFromOutput(output) {
  const first = Array.isArray(output) ? output[0] : output;
  const generated = first?.generated_text ?? first?.text ?? "";
  if (Array.isArray(generated)) {
    const last = generated.at(-1);
    if (typeof last === "string") return last;
    return last?.content || JSON.stringify(last || "");
  }
  return String(generated || "");
}

function stripPromptEcho(text, prompt) {
  const value = String(text || "").trim();
  const promptText = String(prompt || "").trim();
  if (promptText && value.startsWith(promptText)) {
    return value.slice(promptText.length).trim();
  }
  return value;
}

async function buildGenerator(options) {
  env.allowRemoteModels = true;
  env.allowLocalModels = true;
  const pipelineOptions = {};
  if (options.device) pipelineOptions.device = options.device;
  if (options.dtype) pipelineOptions.dtype = options.dtype;
  const started = nowMs();
  const generator = await pipeline("text-generation", options.modelId, pipelineOptions);
  return { generator, modelLoadMs: nowMs() - started };
}

export async function runV41TransformersGeneration(options) {
  const rows = readJsonl(options.templatePath);
  const startIndex = options.start - 1;
  const scopedRows = rows.slice(startIndex, options.limit ? startIndex + options.limit : undefined);
  const { generator, modelLoadMs } = await buildGenerator(options);
  const results = [];

  for (let index = 0; index < scopedRows.length; index += 1) {
    const row = scopedRows[index];
    const started = nowMs();
    try {
      const messages = [{ role: "user", content: row.model_prompt }];
      const output = await generator(messages, {
        max_new_tokens: options.maxNewTokens,
        do_sample: false,
        return_full_text: false
      });
      const totalLatencyMs = nowMs() - started;
      const generated = stripPromptEcho(generatedTextFromOutput(output), row.model_prompt);
      const tokens = outputTokens(generated);
      results.push({
        query_id: row.query_id,
        intent: row.intent,
        generated_text: generated,
        runtime_model_id: options.modelId,
        runtime_name: options.runtimeName,
        generation_status: "completed",
        model_load_ms: index === 0 ? modelLoadMs : 0,
        ttft_ms: totalLatencyMs,
        total_latency_ms: totalLatencyMs,
        output_tokens: tokens,
        tokens_per_second: totalLatencyMs > 0 ? tokens / (totalLatencyMs / 1000) : 0,
        cache_state: "node_transformers_cache",
        prompt_tokens_est: row.prompt_tokens_est,
        ttft_note: "Node Transformers.js pipeline did not expose streaming TTFT; ttft_ms is set to total_latency_ms for conservative reporting.",
        _provenance: {
          step: "run_v41_transformers_generation",
          timestamp: new Date().toISOString(),
          commit: gitCommit(),
          model_id: options.modelId,
          template: path.relative(repoRoot, options.templatePath)
        }
      });
      console.log(JSON.stringify({ query_id: row.query_id, status: "completed", total_latency_ms: Number(totalLatencyMs.toFixed(1)) }));
    } catch (error) {
      const totalLatencyMs = nowMs() - started;
      results.push({
        query_id: row.query_id,
        intent: row.intent,
        generated_text: "",
        runtime_model_id: options.modelId,
        runtime_name: options.runtimeName,
        generation_status: "error",
        model_load_ms: index === 0 ? modelLoadMs : 0,
        ttft_ms: 0,
        total_latency_ms: totalLatencyMs,
        output_tokens: 0,
        tokens_per_second: 0,
        cache_state: "node_transformers_cache",
        device_error: error?.message || String(error),
        prompt_tokens_est: row.prompt_tokens_est
      });
      console.log(JSON.stringify({ query_id: row.query_id, status: "error", error: error?.message || String(error) }));
    }
  }

  writeJsonl(options.outputPath, results);
  return {
    output: path.relative(repoRoot, options.outputPath),
    rows: results.length,
    completed: results.filter((row) => row.generation_status === "completed").length,
    errors: results.filter((row) => row.generation_status === "error").length,
    model_id: options.modelId
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runV41TransformersGeneration(parseArgs(process.argv.slice(2)))
    .then((summary) => console.log(JSON.stringify(summary, null, 2)))
    .catch((error) => {
      console.error(error?.stack || error?.message || String(error));
      process.exit(1);
    });
}

