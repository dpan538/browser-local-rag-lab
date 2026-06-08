#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";
import { auditPromptText, buildPrompt, promptModeForLabel } from "./prompt_builder.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function parseArgs(args) {
  const parsed = {
    queriesPath: path.join(repoRoot, "fixtures/expansion/round02_200/queries.jsonl"),
    labelsPath: path.join(repoRoot, "fixtures/expansion/round02_200/labels.jsonl"),
    recordsPath: path.join(repoRoot, "fixtures/expansion/round02_200/records.jsonl"),
    retrievalPath: path.join(repoRoot, "reports/retrieval_sufficiency_200.json"),
    variantId: "top3_compressed_topology_source_rights",
    outputPath: path.join(repoRoot, "reports/round02_200_prompts_fixed.json")
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--retrieval") parsed.retrievalPath = path.resolve(args[++index]);
    else if (arg === "--variant") parsed.variantId = args[++index];
    else if (arg === "--out") parsed.outputPath = path.resolve(args[++index]);
  }
  return parsed;
}

function splitIds(value) {
  return String(value || "").split("|").filter(Boolean);
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

export function rebuildPrompts(options) {
  const queries = new Map(readJsonl(options.queriesPath).map((query) => [query.query_id, query]));
  const labels = readJsonl(options.labelsPath);
  const records = new Map(readJsonl(options.recordsPath).map((record) => [record.record_id, record]));
  const retrievalRows = readJson(options.retrievalPath).rows.filter((row) => row.variant_id === options.variantId);
  const retrievalByQuery = new Map(retrievalRows.map((row) => [row.query_id, row]));

  const rows = labels.map((label) => {
    const query = queries.get(label.query_id);
    const retrieval = retrievalByQuery.get(label.query_id);
    const retrievedIds = splitIds(retrieval?.retrieved_ids);
    const evidence = retrievedIds.map((id) => records.get(id)).filter(Boolean);
    const prompt = buildPrompt({ query, label, evidence, retrievedIds, retrieval });
    return {
      query_id: label.query_id,
      intent: label.intent,
      lane: label.gold_lane,
      refusal_expected: label.refusal_expected,
      prompt_mode: promptModeForLabel(label),
      retrieved_ids: retrievedIds,
      prompt,
      prompt_audit_failures: auditPromptText({ prompt, label })
    };
  });

  const report = {
    _provenance: {
      step: "rebuild_prompts_for_contract",
      timestamp: new Date().toISOString(),
      commit: gitCommit(),
      input_paths: [
        path.relative(repoRoot, options.queriesPath),
        path.relative(repoRoot, options.labelsPath),
        path.relative(repoRoot, options.recordsPath),
        path.relative(repoRoot, options.retrievalPath)
      ],
      packet_variant: options.variantId
    },
    summary: {
      rows: rows.length,
      prompt_audit_fail_count: rows.filter((row) => row.prompt_audit_failures.length > 0).length
    },
    rows
  };
  fs.writeFileSync(options.outputPath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const report = rebuildPrompts(options);
  console.log(JSON.stringify({
    output: path.relative(repoRoot, options.outputPath),
    rows: report.summary.rows,
    prompt_audit_fail_count: report.summary.prompt_audit_fail_count
  }, null, 2));
  if (report.summary.prompt_audit_fail_count > 0) process.exitCode = 1;
}
