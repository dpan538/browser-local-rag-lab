#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { auditPromptText, buildPrompt as buildContractPrompt, promptModeForLabel } from "./prompt_builder.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultLabelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const defaultQueriesPath = path.join(repoRoot, "fixtures/gold/queries.jsonl");
const defaultRecordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");
const defaultRetrievalPath = path.join(repoRoot, "reports/retrieval_sufficiency_v0.json");
const defaultOutputJsonPath = path.join(repoRoot, "reports/round02_preflight.json");
const defaultOutputMdPath = path.join(repoRoot, "reports/ROUND_02_DESIGN.md");
const defaultVariantId = "top3_compressed_topology_source_rights";
const defaultTokenBudget = 3800;
const defaultRoundId = "round02";

function parseArgs(args) {
  const parsed = {
    labelsPath: defaultLabelsPath,
    queriesPath: defaultQueriesPath,
    recordsPath: defaultRecordsPath,
    retrievalPath: defaultRetrievalPath,
    outputJsonPath: defaultOutputJsonPath,
    outputMdPath: defaultOutputMdPath,
    variantId: defaultVariantId,
    tokenBudget: defaultTokenBudget,
    roundId: defaultRoundId
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--retrieval") parsed.retrievalPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.outputJsonPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.outputMdPath = path.resolve(args[++index]);
    else if (arg === "--variant") parsed.variantId = args[++index];
    else if (arg === "--token-budget") parsed.tokenBudget = Number(args[++index]);
    else if (arg === "--round-id") parsed.roundId = args[++index];
  }
  return parsed;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function splitIds(value) {
  return String(value || "").split("|").filter(Boolean);
}

function clip(value, max = 280) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function list(values) {
  const clean = [...new Set(values.filter(Boolean).map((value) => String(value)))];
  return clean.length ? clean.join(" | ") : "not available";
}

function estimateTokens(text) {
  const words = String(text || "").split(/\s+/).filter(Boolean).length;
  const chars = String(text || "").length;
  return Math.max(Math.ceil(words * 1.3), Math.ceil(chars / 4));
}

function fieldLines(record, fields) {
  const valueByField = {
    record_id: record.record_id,
    title: record.title,
    creator: record.creator,
    date_text: record.date_text,
    region: record.region,
    source: `${record.source?.name || "not available"} / ${record.source?.url || "not available"}`,
    rights: record.rights?.label,
    image_state: `${record.image_state?.code || "not available"} / ${record.image_state?.display_mode || "not available"}`,
    reuse_permission: record.rights_interpretation?.reuse_permission,
    public_domain_status: record.rights_interpretation?.public_domain_status,
    topology: [
      record.topology?.surface_type,
      record.topology?.publication_role,
      ...(record.topology?.folder_titles || [])
    ].filter(Boolean).join(" / "),
    method_context: Object.values(record.method_context || {}).join(" "),
    first_or_earliest_claim: record.first_or_earliest_claim
  };
  return fields.map((field) => `${field}: ${clip(valueByField[field] || "not available", 360)}`);
}

function recordSummary(record, fields) {
  return [
    "Record:",
    ...fieldLines(record, fields),
    `compact_note: ${clip(record.notes?.compact, 420)}`
  ].join("\n");
}

function evidenceTagBlock(records, fields) {
  const uniqueFields = [...new Set(fields)];
  return [
    "Evidence Tags:",
    ...uniqueFields.map((field) => {
      const values = [...new Set(records.map((record) => fieldLines(record, [field])[0].split(": ").slice(1).join(": ")).filter((value) => value && value !== "not available"))];
      return `${field}: ${values.length ? values.join(" | ") : "not available"}`;
    })
  ].join("\n");
}

function orientationPrompt(query, label, records) {
  const folders = records.flatMap((record) => record.topology?.folder_titles || []);
  const surfaces = records.map((record) => record.topology?.surface_type);
  const roles = records.map((record) => record.topology?.publication_role);
  const sources = records.map((record) => record.source?.name);
  const imageStates = records.map((record) => record.image_state?.code);
  return [
    "You are a research-only browser-local Qwen RAG experiment.",
    "Answer in exactly three short bullet points.",
    "Do not output hidden reasoning or <think> tags.",
    "Do not name a single record as the archive.",
    `Question: ${query.query_text}`,
    "Facts:",
    "- This is a source-linked research archive for graphic design and visual communication records.",
    `- Folder/topology terms: ${list(folders)}.`,
    `- Surface types: ${list(surfaces)}.`,
    `- Publication roles: ${list(roles)}.`,
    `- Source families: ${list(sources)}.`,
    `- Image states: ${list(imageStates)}.`,
    "Required bullets: purpose; organization; next step.",
    "",
    "After the three bullets, append this exact field block:",
    evidenceTagBlock(records, ["topology"])
  ].join("\n");
}

function refusalPrompt(query, label) {
  return [
    "You are an archival assistant with strict evidence rules.",
    "The evidence for this query is intentionally empty or insufficient.",
    "",
    `QUERY: ${query.query_text}`,
    "",
    "INSTRUCTION: You MUST answer with exactly the following sentence and nothing else:",
    "\"I cannot answer this question because the evidence is insufficient.\"",
    "",
    "Do not explain. Do not provide any factual information. Do not speculate."
  ].join("\n");
}

function sourceRightsPrompt(query, label, records) {
  const record = records[0] || {};
  const fields = Object.fromEntries(["record_id", "title", "source", "rights", "image_state", "reuse_permission", "public_domain_status"].map((field) => {
    const line = fieldLines(record, [field])[0] || `${field}: not available`;
    return [field, line.split(": ").slice(1).join(": ")];
  }));
  return [
    "You are an archival rights assistant.",
    "Use ONLY the evidence below. Do not interpret or summarize rights.",
    "Do not output hidden reasoning or <think> tags.",
    "",
    "EVIDENCE:",
    `record_id: ${fields.record_id}`,
    `title: ${fields.title}`,
    `source: ${fields.source}`,
    `rights: ${fields.rights}`,
    `image_state: ${fields.image_state}`,
    `reuse_permission: ${fields.reuse_permission}`,
    `public_domain_status: ${fields.public_domain_status}`,
    "",
    `QUERY: ${query.query_text}`,
    "",
    "INSTRUCTION: Answer in exactly this format, with no extra text:",
    "",
    `record_id: ${fields.record_id}`,
    `title: ${fields.title}`,
    `source: ${fields.source}`,
    `RIGHTS: ${fields.rights}`,
    `image_state: ${fields.image_state}`,
    `REUSE: ${fields.reuse_permission}`,
    `PUBLIC_DOMAIN: ${fields.public_domain_status}`,
    "CAVEAT: Verify the source page before reuse; this experiment does not grant rights."
  ].join("\n");
}

function compactAnswerPrompt(query, label, records) {
  const required = label.required_fields?.length ? label.required_fields : ["record_id", "title", "source"];
  return [
    "You are a cautious archive assistant in a browser-local research experiment.",
    "Generated text is not archive evidence.",
    "Do not output hidden reasoning or <think> tags.",
    "Use only the evidence fields below. If a required field is not available, say the evidence is insufficient.",
    `Question: ${query.query_text}`,
    `Intent: ${label.intent}`,
    `Required fields to cite visibly: ${required.join(", ")}`,
    "",
    "Evidence fields:",
    ...records.map((record) => recordSummary(record, required)),
    "",
    "Answer briefly, then append this exact field block using values from evidence:",
    evidenceTagBlock(records, required)
  ].join("\n");
}

function buildRound02Prompt(query, label, records) {
  if (label.refusal_expected) return refusalPrompt(query, label);
  if (["archive_orientation", "casual_archive_help"].includes(label.intent)) {
    return orientationPrompt(query, label, records);
  }
  if (label.intent === "source_rights_question") return sourceRightsPrompt(query, label, records);
  return compactAnswerPrompt(query, label, records);
}

function main() {
  const {
    labelsPath,
    queriesPath,
    recordsPath,
    retrievalPath,
    outputJsonPath,
    outputMdPath,
    variantId,
    tokenBudget,
    roundId
  } = parseArgs(process.argv.slice(2));
  const labels = readJsonl(labelsPath);
  const queries = new Map(readJsonl(queriesPath).map((query) => [query.query_id, query]));
  const records = new Map(readJsonl(recordsPath).map((record) => [record.record_id, record]));
  const retrieval = readJson(retrievalPath).rows.filter((row) => row.variant_id === variantId);
  const retrievalByQuery = new Map(retrieval.map((row) => [row.query_id, row]));

  const rows = labels.map((label) => {
    const query = queries.get(label.query_id);
    const retrievalRow = retrievalByQuery.get(label.query_id);
    const retrievedIds = splitIds(retrievalRow?.retrieved_ids);
    const retrievedRecords = retrievedIds.map((id) => records.get(id)).filter(Boolean);
    const prompt = buildContractPrompt({ query, label, evidence: retrievedRecords, retrievedIds });
    const promptTokensEst = estimateTokens(prompt);
    const row = {
      query_id: label.query_id,
      intent: label.intent,
      lane: label.gold_lane,
      refusal_expected: label.refusal_expected,
      retrieved_count: retrievedRecords.length,
      prompt_chars: prompt.length,
      prompt_tokens_est: promptTokensEst,
      token_budget: tokenBudget,
      token_budget_status: promptTokensEst <= tokenBudget ? "pass" : "fail",
      prompt_mode: promptModeForLabel(label),
      retry_required_from_round01: ["BQ11", "BQ22"].includes(label.query_id)
    };
    row.prompt_audit_failures = auditPromptText({ prompt, label });
    row.prompt_audit_status = row.prompt_audit_failures.length === 0 ? "pass" : "fail";
    return row;
  });

  const failRows = rows.filter((row) => row.token_budget_status === "fail");
  const auditFailRows = rows.filter((row) => row.prompt_audit_status === "fail");
  const retryRows = rows.filter((row) => row.retry_required_from_round01);
  const summary = {
    round_id: roundId,
    variant_id: variantId,
    total: rows.length,
    token_budget: tokenBudget,
    token_budget_fail_count: failRows.length,
    prompt_audit_fail_count: auditFailRows.length,
    max_prompt_tokens_est: Math.max(...rows.map((row) => row.prompt_tokens_est)),
    avg_prompt_tokens_est: rows.reduce((sum, row) => sum + row.prompt_tokens_est, 0) / rows.length,
    round01_retry_rows: retryRows.map((row) => row.query_id)
  };

  const report = {
    _provenance: {
      step: `${roundId}_preflight`,
      timestamp: new Date().toISOString(),
      commit: gitCommit(),
      input_paths: [
        path.relative(repoRoot, queriesPath),
        path.relative(repoRoot, labelsPath),
        path.relative(repoRoot, recordsPath),
        path.relative(repoRoot, retrievalPath)
      ],
      packet_variant: variantId,
      token_budget: tokenBudget
    },
    summary,
    rows
  };
  fs.writeFileSync(outputJsonPath, `${JSON.stringify(report, null, 2)}\n`);

  const rowMd = rows.map((row) => `| ${row.query_id} | ${row.intent} | ${row.prompt_mode} | ${row.prompt_tokens_est} | ${row.token_budget_status} | ${row.prompt_audit_status} | ${row.retry_required_from_round01 ? "yes" : "no"} |`).join("\n");
  const roundTitle = String(roundId).replaceAll("_", " ").toUpperCase();
  fs.writeFileSync(outputMdPath, `# ${roundTitle} Design

Generated: ${report._provenance.timestamp}

## Round 01 Diagnosis

Round 01 proved that the WebLLM/Qwen runtime path works, but it is not yet a
quality-passing RAG setup:

- 30 rows executed; 28 completed and 2 hit context-window errors.
- BQ11 and BQ22 exceeded the 4096 context window.
- The generation contract reported 9 fail findings and 43 warnings.
- The dominant failure modes were refusal-missing answers, oversized prompts,
  and insufficient field externalization.

## Round 02 Objective

Round 02 is a repair round, not a paper-quality ablation round. Its goal is to
remove preventable runtime/prompt failures before broader comparison:

- 0 token-budget errors before WebLLM generation.
- 0 completed rows missing metric fields.
- Refusal-expected rows must start with the exact refusal phrase.
- Source/rights answers must copy exact evidence field text, not interpret it.
- Required fields should be visible enough for the generation contract.

## Prompt Strategy

- Orientation/help lanes use archive-structure facts, not object-level JSON.
- Refusal lanes use a hard refusal template and do not include tempting object
  facts.
- Source/rights lanes use explicit field summaries with exact rights strings.
- Other answerable lanes use compact required-field summaries instead of raw
  evidence JSON.

## Token Budget Preflight

- Token budget: ${tokenBudget}
- Rows checked: ${summary.total}
- Token-budget failures: ${summary.token_budget_fail_count}
- Prompt-audit failures: ${summary.prompt_audit_fail_count}
- Max estimated prompt tokens: ${summary.max_prompt_tokens_est}
- Average estimated prompt tokens: ${summary.avg_prompt_tokens_est.toFixed(1)}
- Round 01 retry rows: ${summary.round01_retry_rows.join(", ")}

| Query | Intent | Prompt mode | Est. tokens | Budget | Prompt audit | Round 01 retry |
|---|---|---|---:|---|---|---|
${rowMd}

## Round 02 Run Protocol

1. Implement the Round 02 prompt modes in the browser runner.
2. Run \`npm run round2:preflight\` and require 0 token-budget failures.
3. Run the browser WebLLM round with cache state recorded as
   \`warm_from_previous\`, \`cold_cleared\`, or \`ambiguous\`.
4. Retry each runtime error at most once with the compact prompt mode.
5. Import the browser export.
6. Treat contract fail findings as blockers, not as qualitative caveats.
`);

  console.log(JSON.stringify({
    report: path.relative(repoRoot, outputMdPath),
    json: path.relative(repoRoot, outputJsonPath),
    ...summary
  }, null, 2));
  if (failRows.length > 0 || auditFailRows.length > 0) process.exitCode = 1;
}

main();
