#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  packetsPath: path.join(repoRoot, "reports/v41_universal_packets_pilot50.json"),
  outputPath: path.join(repoRoot, "reports/v41_raw_generation_template_pilot50.jsonl")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--packets") parsed.packetsPath = path.resolve(args[++index]);
    else if (arg === "--out") parsed.outputPath = path.resolve(args[++index]);
  }
  return parsed;
}

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function promptTokenEstimate(prompt) {
  return Math.ceil(String(prompt || "").length / 4);
}

export function buildRawGenerationTemplate(options) {
  const packets = JSON.parse(fs.readFileSync(options.packetsPath, "utf8"));
  const rows = packets.rows
    .filter((row) => !row.deterministic_lane)
    .map((row) => ({
      query_id: row.query_id,
      intent: row.intent,
      prompt_variant: row.prompt_variant,
      packet_variant: row.packet_variant,
      prompt_tokens_est: promptTokenEstimate(row.model_prompt),
      model_prompt: row.model_prompt,
      generated_text: "",
      runtime_model_id: "",
      runtime_name: "",
      generation_status: "pending",
      ttft_ms: null,
      total_latency_ms: null,
      output_tokens: null,
      tokens_per_second: null,
      notes: "Fill generated_text and runtime metrics from a non-Qwen model runner. Deterministic rows are handled by finalize_v41_model_results.mjs."
    }));
  writeJsonl(options.outputPath, rows);
  return {
    output: path.relative(repoRoot, options.outputPath),
    input_packets: path.relative(repoRoot, options.packetsPath),
    model_generation_rows: rows.length
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = buildRawGenerationTemplate(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify(result, null, 2));
}

