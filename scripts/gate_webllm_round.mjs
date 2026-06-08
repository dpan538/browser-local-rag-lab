#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

function parseArgs(args) {
  const parsed = {
    roundJsonPath: null,
    answersPath: null,
    queriesPath: path.join(repoRoot, "fixtures/expansion/round02_200/queries.jsonl"),
    labelsPath: path.join(repoRoot, "fixtures/expansion/round02_200/labels.jsonl"),
    recordsPath: path.join(repoRoot, "fixtures/expansion/round02_200/records.jsonl"),
    expectedCount: null,
    jsonOutPath: path.join(repoRoot, "reports/webllm_round_gate.json"),
    mdOutPath: path.join(repoRoot, "reports/WEBLLM_ROUND_GATE.md")
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--round-json") parsed.roundJsonPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--expected") parsed.expectedCount = Number(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function add(findings, severity, code, detail, queryId = null) {
  findings.push({ severity, code, query_id: queryId, detail });
}

function metricIssues(round) {
  return round.metric_issues || [];
}

function answerBehaviorFindings(answers, labelsById) {
  const findings = [];
  const completed = answers.filter((row) => row.generation_status === "completed");
  const tpsValues = completed
    .map((row) => row.tokens_per_second)
    .filter((value) => typeof value === "number" && Number.isFinite(value));
  const avgTps = tpsValues.length
    ? tpsValues.reduce((sum, value) => sum + value, 0) / tpsValues.length
    : null;

  for (const row of completed) {
    const label = labelsById.get(row.query_id);
    if (!label) continue;
    const text = String(row.answer_text || "");
    if (label.refusal_expected && text.length > 150) {
      add(findings, "warn", "P001_refusal_answer_too_long", `length=${text.length}; threshold=150`, row.query_id);
    }
    if (!label.refusal_expected && text.length < 50) {
      add(findings, "warn", "P002_answerable_answer_too_short", `length=${text.length}; threshold=50`, row.query_id);
    }
    if (avgTps !== null && typeof row.tokens_per_second === "number" && row.tokens_per_second < avgTps * 0.5) {
      add(findings, "warn", "P003_generation_speed_low", `tokens_per_second=${row.tokens_per_second.toFixed(2)}; avg=${avgTps.toFixed(2)}`, row.query_id);
    }
  }

  return findings;
}

function isBlockingFinding(finding) {
  if (finding.severity === "fail") return true;
  if (finding.code === "P003_generation_speed_low") return false;
  return finding.severity === "warn";
}

function markdown(result) {
  const rows = result.findings.length === 0
    ? "| none | none | none | none |"
    : result.findings.map((item) => `| ${item.severity} | ${item.code} | ${item.query_id || "round"} | ${item.detail} |`).join("\n");
  return `# WebLLM Round Gate

Generated: ${result.generated_at}

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, \`ready_for_next_step=true\` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: ${result.expected_count ?? "not set"}
- Result rows: ${result.result_count}
- Completed rows: ${result.completed_count}
- Error rows: ${result.error_count}
- Metric issues: ${result.metric_issue_count}
- Contract failures: ${result.contract_fail_count}
- Contract warnings: ${result.contract_warn_count}
- Gate warnings: ${result.gate_warn_count}
- Blocking findings: ${result.blocking_finding_count}
- Performance observations: ${result.performance_observation_count}
- Ready for next step: ${result.ready_for_next_step ? "yes" : "no"}

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
${rows}
`;
}

export function gateWebllmRound(options) {
  if (!options.roundJsonPath) throw new Error("--round-json is required");
  if (!options.answersPath) throw new Error("--answers is required");

  const round = readJson(options.roundJsonPath);
  const answers = readJsonl(options.answersPath);
  const labels = readJsonl(options.labelsPath);
  const labelsById = new Map(labels.map((label) => [label.query_id, label]));
  const queryIds = [...new Set(answers.map((row) => row.query_id).filter(Boolean))];
  const findings = [];

  const completed = answers.filter((row) => row.generation_status === "completed");
  const errors = answers.filter((row) => row.generation_status !== "completed");
  if (options.expectedCount !== null && answers.length !== options.expectedCount) {
    add(findings, "fail", "GATE001_unexpected_result_count", `expected=${options.expectedCount}; actual=${answers.length}`);
  }
  if (errors.length > 0) {
    add(findings, "fail", "GATE002_runtime_errors_present", `error_rows=${errors.length}`);
  }

  for (const issue of metricIssues(round)) {
    add(findings, issue.type === "cache_state_ambiguous" ? "warn" : "fail", `METRIC_${issue.type}`, `${issue.key || "n/a"} ${issue.value ?? ""}`, issue.query_id);
  }

  const contract = validateGenerationContract({
    queriesPath: options.queriesPath,
    labelsPath: options.labelsPath,
    recordsPath: options.recordsPath,
    answersPath: options.answersPath,
    requireAllAnswers: true,
    allowedQueryIds: queryIds
  });

  for (const violation of contract.violations) {
    add(findings, violation.severity, `CONTRACT_${violation.code}`, violation.detail, violation.query_id);
  }

  findings.push(...answerBehaviorFindings(answers, labelsById));
  const blockingFindings = findings.filter(isBlockingFinding);
  const performanceObservations = findings.filter((item) => item.code === "P003_generation_speed_low");

  const result = {
    generated_at: new Date().toISOString(),
    round_json_path: path.relative(repoRoot, options.roundJsonPath),
    answers_path: path.relative(repoRoot, options.answersPath),
    expected_count: options.expectedCount,
    result_count: answers.length,
    completed_count: completed.length,
    error_count: errors.length,
    metric_issue_count: metricIssues(round).length,
    contract_fail_count: contract.fail_count,
    contract_warn_count: contract.warn_count,
    gate_fail_count: findings.filter((item) => item.severity === "fail").length,
    gate_warn_count: findings.filter((item) => item.severity === "warn").length,
    blocking_finding_count: blockingFindings.length,
    performance_observation_count: performanceObservations.length,
    ready_for_next_step: blockingFindings.length === 0,
    findings
  };

  fs.writeFileSync(options.jsonOutPath, JSON.stringify(result, null, 2) + "\n");
  fs.writeFileSync(options.mdOutPath, markdown(result));
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  try {
    const result = gateWebllmRound(options);
    console.log(JSON.stringify({
      report: path.relative(repoRoot, options.mdOutPath),
      ready_for_next_step: result.ready_for_next_step,
      gate_fail_count: result.gate_fail_count,
      gate_warn_count: result.gate_warn_count
    }, null, 2));
    if (process.argv.includes("--strict") && !result.ready_for_next_step) process.exitCode = 1;
  } catch (error) {
    console.error(error?.message || String(error));
    process.exit(1);
  }
}
