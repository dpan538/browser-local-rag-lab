#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rebuildPrompts } from "./rebuild_prompts_for_contract.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

function parseArgs(args) {
  const parsed = {
    promptsPath: null,
    queriesPath: path.join(repoRoot, "fixtures/expansion/round02_200/queries.jsonl"),
    labelsPath: path.join(repoRoot, "fixtures/expansion/round02_200/labels.jsonl"),
    recordsPath: path.join(repoRoot, "fixtures/expansion/round02_200/records.jsonl"),
    retrievalPath: path.join(repoRoot, "reports/retrieval_sufficiency_200.json"),
    variantId: "top3_compressed_topology_source_rights",
    promptVariant: "r03_v0_baseline",
    jsonOutPath: path.join(repoRoot, "reports/prompt_audit_round02_200.json"),
    mdOutPath: path.join(repoRoot, "reports/PROMPT_AUDIT_ROUND02_200.md")
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--prompts") parsed.promptsPath = path.resolve(args[++index]);
    else if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--retrieval") parsed.retrievalPath = path.resolve(args[++index]);
    else if (arg === "--variant") parsed.variantId = args[++index];
    else if (arg === "--prompt-variant") parsed.promptVariant = args[++index];
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function readPromptRows(options) {
  if (options.promptsPath) {
    const parsed = JSON.parse(fs.readFileSync(options.promptsPath, "utf8"));
    return parsed.rows || parsed;
  }
  return rebuildPrompts({
    queriesPath: options.queriesPath,
    labelsPath: options.labelsPath,
    recordsPath: options.recordsPath,
    retrievalPath: options.retrievalPath,
    variantId: options.variantId,
    promptVariant: options.promptVariant,
    outputPath: path.join(repoRoot, "reports/round02_200_prompts_fixed.json")
  }).rows;
}

function auditRows(rows) {
  return rows.map((row) => {
    const failures = [...(row.prompt_audit_failures || [])];
    if (!row.prompt || typeof row.prompt !== "string") failures.push("prompt_missing_or_non_string");
    if (!row.prompt_mode) failures.push("prompt_mode_missing");
    return { ...row, prompt_audit_failures: failures, prompt_audit_status: failures.length ? "fail" : "pass" };
  });
}

function reportTitle(options) {
  return path.basename(options.mdOutPath, path.extname(options.mdOutPath))
    .replace(/^PROMPT_AUDIT_?/i, "Prompt Audit ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function markdown(report) {
  const failures = report.rows.filter((row) => row.prompt_audit_status === "fail");
  const rows = failures.length === 0
    ? "| none | none | none |"
    : failures.map((row) => `| ${row.query_id} | ${row.prompt_mode || "unknown"} | ${(row.prompt_audit_failures || []).join(", ")} |`).join("\n");
  return `# ${report.title}

Generated: ${report.generated_at}

## Summary

- Rows checked: ${report.summary.rows}
- Prompt audit failures: ${report.summary.prompt_audit_fail_count}

## Failures

| Query | Prompt mode | Failures |
|---|---|---|
${rows}
`;
}

export function auditPrompts(options) {
  const rows = auditRows(readPromptRows(options));
  const report = {
    title: reportTitle(options),
    generated_at: new Date().toISOString(),
    summary: {
      rows: rows.length,
      prompt_audit_fail_count: rows.filter((row) => row.prompt_audit_status === "fail").length
    },
    rows: rows.map(({ prompt, ...row }) => ({
      ...row,
      prompt_chars: prompt?.length || 0
    }))
  };
  fs.writeFileSync(options.jsonOutPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, markdown(report));
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const report = auditPrompts(options);
  console.log(JSON.stringify({
    json: path.relative(repoRoot, options.jsonOutPath),
    report: path.relative(repoRoot, options.mdOutPath),
    rows: report.summary.rows,
    prompt_audit_fail_count: report.summary.prompt_audit_fail_count
  }, null, 2));
  if (process.argv.includes("--strict") && report.summary.prompt_audit_fail_count > 0) process.exitCode = 1;
}
