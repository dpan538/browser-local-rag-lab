#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";
import { finalizeAnswerText } from "./prompt_builder.mjs";
import { validateGenerationContract } from "./validate_generation_contract.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
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

function parseArgs(args) {
  const parsed = {
    queriesPath: path.join(repoRoot, "fixtures/expansion/round02_200/queries.jsonl"),
    labelsPath: path.join(repoRoot, "fixtures/expansion/round02_200/labels.jsonl"),
    recordsPath: path.join(repoRoot, "fixtures/expansion/round02_200/records.jsonl"),
    retrievalPath: path.join(repoRoot, "reports/retrieval_sufficiency_200.json"),
    variantId: "top3_compressed_topology_source_rights",
    answersOutPath: path.join(repoRoot, "reports/contract_oracle_round02_200_answers.jsonl"),
    jsonOutPath: path.join(repoRoot, "reports/contract_oracle_round02_200.json"),
    mdOutPath: path.join(repoRoot, "reports/CONTRACT_ORACLE_ROUND02_200.md")
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--retrieval") parsed.retrievalPath = path.resolve(args[++index]);
    else if (arg === "--variant") parsed.variantId = args[++index];
    else if (arg === "--answers-out") parsed.answersOutPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function buildOracleAnswers(options) {
  const queries = new Map(readJsonl(options.queriesPath).map((query) => [query.query_id, query]));
  const labels = readJsonl(options.labelsPath);
  const records = new Map(readJsonl(options.recordsPath).map((record) => [record.record_id, record]));
  const retrievalRows = readJson(options.retrievalPath).rows.filter((row) => row.variant_id === options.variantId);
  const retrievalByQuery = new Map(retrievalRows.map((row) => [row.query_id, row]));

  const coverageRows = [];
  const answerRows = labels.map((label) => {
    const query = queries.get(label.query_id);
    const retrieval = retrievalByQuery.get(label.query_id);
    const retrievedIds = splitIds(retrieval?.retrieved_ids);
    const goldIds = label.gold_evidence_ids || [];
    const evidence = retrievedIds.map((id) => records.get(id)).filter(Boolean);
    const missingGoldIds = label.refusal_expected ? [] : goldIds.filter((id) => !retrievedIds.includes(id));
    coverageRows.push({
      query_id: label.query_id,
      intent: label.intent,
      refusal_expected: label.refusal_expected,
      gold_ids: goldIds,
      retrieved_ids: retrievedIds,
      missing_gold_ids: missingGoldIds,
      gold_coverage_status: missingGoldIds.length ? "fail" : "pass"
    });
    return {
      query_id: label.query_id,
      intent: label.intent,
      lane: label.gold_lane,
      generation_status: "completed",
      producer: "contract_oracle_no_model",
      retrieved_ids: retrievedIds.join("|"),
      answer_text: finalizeAnswerText({ query, label, evidence, retrievedIds, retrieval }, "Synthetic model body.")
    };
  });

  return { answerRows, coverageRows };
}

function markdown(report) {
  const failures = report.contract.violations.filter((item) => item.severity === "fail");
  const warnings = report.contract.violations.filter((item) => item.severity === "warn");
  const coverageFailures = report.coverage.rows.filter((row) => row.gold_coverage_status === "fail");
  const failureRows = failures.length === 0
    ? "| none | none | none | none |"
    : failures.slice(0, 80).map((item) => `| ${item.query_id} | ${item.code} | ${item.field} | ${item.detail} |`).join("\n");
  const coverageRows = coverageFailures.length === 0
    ? "| none | none | none |"
    : coverageFailures.slice(0, 80).map((row) => `| ${row.query_id} | ${row.intent} | ${row.missing_gold_ids.join(", ")} |`).join("\n");
  return `# Contract Oracle Round 02 200

Generated: ${report.generated_at}

This pre-model gate creates deterministic answers from the retrieved evidence
packet and sends them through the same generation contract validator. If this
fails, a WebLLM rerun cannot pass by prompt engineering alone.

## Summary

- Rows checked: ${report.summary.rows}
- Gold coverage failures: ${report.summary.gold_coverage_fail_count}
- Contract failures: ${report.summary.contract_fail_count}
- Contract warnings: ${report.summary.contract_warn_count}
- Ready for WebLLM rerun: ${report.summary.ready_for_webllm_rerun ? "yes" : "no"}

## Gold Coverage Failures

| Query | Intent | Missing gold evidence IDs |
|---|---|---|
${coverageRows}

## Contract Failures

| Query | Code | Field | Detail |
|---|---|---|---|
${failureRows}

## Warning Count

${warnings.length} contract warnings were observed in oracle mode. Treat these
as pre-run issues unless intentionally adjudicated.
`;
}

export function runContractOracle(options) {
  const { answerRows, coverageRows } = buildOracleAnswers(options);
  fs.writeFileSync(options.answersOutPath, `${answerRows.map((row) => JSON.stringify(row)).join("\n")}\n`);
  const contract = validateGenerationContract({
    queriesPath: options.queriesPath,
    labelsPath: options.labelsPath,
    recordsPath: options.recordsPath,
    answersPath: options.answersOutPath,
    requireAllAnswers: true
  });
  const report = {
    generated_at: new Date().toISOString(),
    _provenance: {
      step: "contract_oracle_check",
      commit: gitCommit(),
      packet_variant: options.variantId,
      input_paths: [
        path.relative(repoRoot, options.queriesPath),
        path.relative(repoRoot, options.labelsPath),
        path.relative(repoRoot, options.recordsPath),
        path.relative(repoRoot, options.retrievalPath)
      ]
    },
    summary: {
      rows: answerRows.length,
      gold_coverage_fail_count: coverageRows.filter((row) => row.gold_coverage_status === "fail").length,
      contract_fail_count: contract.fail_count,
      contract_warn_count: contract.warn_count,
      ready_for_webllm_rerun: contract.fail_count === 0 && contract.warn_count === 0
    },
    coverage: { rows: coverageRows },
    contract
  };
  fs.writeFileSync(options.jsonOutPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, markdown(report));
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const report = runContractOracle(options);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, options.mdOutPath),
    json: path.relative(repoRoot, options.jsonOutPath),
    answers: path.relative(repoRoot, options.answersOutPath),
    ...report.summary
  }, null, 2));
  if (process.argv.includes("--strict") && !report.summary.ready_for_webllm_rerun) process.exitCode = 1;
}
