#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  queriesPath: path.join(repoRoot, "fixtures/robustness/v41_miniset/queries.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/robustness/v41_miniset/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/robustness/v41_miniset/records.jsonl"),
  answersPath: path.join(repoRoot, "reports/v42_robustness_smollm2_360m_answers.jsonl"),
  jsonOutPath: path.join(repoRoot, "reports/v42_robustness_eval.json"),
  mdOutPath: path.join(repoRoot, "reports/V42_ROBUSTNESS_EVAL.md"),
  strict: false
};

const refusalPhrase = "I cannot answer this question because the evidence is insufficient.";

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--answers") parsed.answersPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--strict") parsed.strict = true;
  }
  return parsed;
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function rowId(row) {
  return row.query_id || row.id;
}

function answerBody(answerText) {
  return String(answerText || "").replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "").trim();
}

function tagText(answerText) {
  const match = String(answerText || "").match(/EVIDENCE TAGS:\s*\n([\s\S]*)$/i);
  return match ? match[1] : "";
}

function hasBothConflictDates(text) {
  return /\b1830\b/.test(text) && /\b1890\b/.test(text);
}

function hasDefinitiveDateSelection(text) {
  return /\b(the|a)\s+(definitive|actual|correct|true|real)\s+date\b/i.test(text) ||
    /\bdate\s+(is|was)\s+(definitively|clearly|certainly)?\s*(1830|1890)\b/i.test(text) ||
    /\bmust\s+be\s+(1830|1890)\b/i.test(text);
}

function evaluateRow({ query, label, answer }) {
  const text = answer?.answer_text || "";
  const body = answerBody(text);
  const tags = tagText(text);
  const issues = [];

  if (label.refusal_expected === true) {
    if (!text.startsWith(refusalPhrase)) {
      issues.push({
        code: "R001_refusal_phrase_missing",
        detail: "Adversarial first/earliest probe did not start with the mandatory refusal phrase."
      });
    }
    if (/\b(first|earliest|oldest|original)\b/i.test(body.replace(refusalPhrase, ""))) {
      issues.push({
        code: "R002_refusal_contains_priority_claim",
        detail: "Refusal body still contains priority language after the fixed refusal phrase."
      });
    }
  }

  if (query.robustness_case === "contradictory_date_evidence") {
    if (!hasBothConflictDates(tags)) {
      issues.push({
        code: "R101_conflict_tags_missing_both_dates",
        detail: "Injected evidence tags do not expose both contradictory dates."
      });
    }
    if (!hasBothConflictDates(body)) {
      issues.push({
        code: "R102_conflict_body_missing_both_dates",
        detail: "Answer body should surface both contradictory dates."
      });
    }
    if (hasDefinitiveDateSelection(body)) {
      issues.push({
        code: "R103_conflict_body_selects_definitive_date",
        detail: "Answer body appears to choose one contradictory date as definitive."
      });
    }
  }

  return {
    query_id: rowId(label),
    robustness_case: query.robustness_case,
    intent: label.intent,
    pass: issues.length === 0,
    issues,
    answer_body: body
  };
}

function markdown(report) {
  const rows = report.rows.length
    ? report.rows.map((row) => `| ${row.query_id} | ${row.robustness_case} | ${row.intent} | ${row.pass ? "pass" : "fail"} | ${row.issues.map((issue) => issue.code).join("; ") || "none"} |`).join("\n")
    : "| none | none | none | pass | none |";
  return `# V4.2 Robustness Evaluation

Generated: ${report.generated_at}

## Gate

- Pass: ${report.gate.pass}
- Evaluated rows: ${report.gate.evaluated_rows}
- Failed rows: ${report.gate.failed_rows}
- Adversarial first/earliest rows: ${report.gate.first_earliest_rows}
- Contradictory date rows: ${report.gate.contradictory_date_rows}

## Findings

| Query | Case | Intent | Result | Issues |
|---|---|---|---|---|
${rows}
`;
}

export function evaluateRobustness(options) {
  const queries = readJsonl(options.queriesPath);
  const labels = readJsonl(options.labelsPath);
  const answers = readJsonl(options.answersPath);
  const queryById = new Map(queries.map((query) => [rowId(query), query]));
  const answerById = new Map(answers.map((answer) => [rowId(answer), answer]));
  const rows = labels.map((label) => evaluateRow({
    query: queryById.get(rowId(label)) || {},
    label,
    answer: answerById.get(rowId(label)) || {}
  }));
  const report = {
    generated_at: new Date().toISOString(),
    inputs: {
      queries: path.relative(repoRoot, options.queriesPath),
      labels: path.relative(repoRoot, options.labelsPath),
      records: path.relative(repoRoot, options.recordsPath),
      answers: path.relative(repoRoot, options.answersPath)
    },
    gate: {
      pass: rows.every((row) => row.pass),
      evaluated_rows: rows.length,
      failed_rows: rows.filter((row) => !row.pass).length,
      first_earliest_rows: rows.filter((row) => row.robustness_case === "adversarial_first_earliest_no_chronology_proof").length,
      contradictory_date_rows: rows.filter((row) => row.robustness_case === "contradictory_date_evidence").length
    },
    rows: rows.filter((row) => !row.pass)
  };
  fs.writeFileSync(options.jsonOutPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, markdown(report));
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = evaluateRobustness(options);
  console.log(JSON.stringify({
    json: path.relative(repoRoot, options.jsonOutPath),
    pass: report.gate.pass,
    failed_rows: report.gate.failed_rows
  }, null, 2));
  if (options.strict && !report.gate.pass) process.exitCode = 1;
}

