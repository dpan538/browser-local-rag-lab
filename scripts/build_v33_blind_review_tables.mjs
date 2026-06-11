#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  inputDir: path.join(repoRoot, "reports/human_review"),
  outDir: path.join(repoRoot, "reports/human_review")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--input-dir") parsed.inputDir = path.resolve(args[++index]);
    else if (arg === "--out-dir") parsed.outDir = path.resolve(args[++index]);
  }
  return parsed;
}

function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function evidenceText(evidenceValues) {
  return Object.entries(evidenceValues || {})
    .map(([field, values]) => {
      const list = Array.isArray(values) ? values : [values];
      const joined = list
        .filter((value) => value !== undefined && value !== null && String(value).trim())
        .join(" ; ");
      return `${field}: ${joined || "none"}`;
    })
    .join("\n");
}

function buildRows(fixture) {
  return fixture.rows.map((row) => ({
    review_id: row.review_id,
    query_id: row.query_id,
    intent: row.intent,
    refusal_expected: row.refusal_expected ? "true" : "false",
    query_text: row.query_text,
    required_fields: (row.required_fields || []).join(", "),
    evidence_values: evidenceText(row.evidence_values),
    delivered_answer: row.delivered_answer,
    reviewer_decision: row.reviewer_decision || "pending",
    reviewer_faithfulness: row.reviewer_faithfulness || "pending",
    reviewer_usability: row.reviewer_usability || "pending",
    reviewer_notes: row.reviewer_notes || ""
  }));
}

function writeCsv(rows, outputPath) {
  const headers = [
    "review_id",
    "query_id",
    "intent",
    "refusal_expected",
    "query_text",
    "required_fields",
    "evidence_values",
    "delivered_answer",
    "reviewer_decision",
    "reviewer_faithfulness",
    "reviewer_usability",
    "reviewer_notes"
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ];
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
}

function writeGuide(outDir) {
  const guide = `# V3.3 Blind Review Table Guide

Use the spreadsheet files if the JSON fixtures feel too technical:

- Reviewer A: \`v33_reviewer_a_blind_review.xlsx\`
- Reviewer B: \`v33_reviewer_b_blind_review.xlsx\`

CSV backups are also provided:

- Reviewer A: \`v33_reviewer_a_blind_review.csv\`
- Reviewer B: \`v33_reviewer_b_blind_review.csv\`

Open the XLSX or CSV in Excel, Numbers, Google Sheets, or LibreOffice. Review
one row at a time. Please edit only these columns:

- \`reviewer_decision\`: \`accept\`, \`reject\`, or \`needs_adjudication\`
- \`reviewer_faithfulness\`: \`faithful\`, \`minor_issue\`, or \`unfaithful\`
- \`reviewer_usability\`: \`usable\`, \`partial\`, or \`unusable\`
- \`reviewer_notes\`: short free-text note when useful

Do not edit query, evidence, or answer columns. If a row is difficult to judge,
use \`needs_adjudication\` and explain why in \`reviewer_notes\`.
`;
  fs.writeFileSync(path.join(outDir, "BLIND_REVIEW_TABLE_GUIDE.md"), guide);
}

function convertOne(inputPath, outputPath) {
  const fixture = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  writeCsv(buildRows(fixture), outputPath);
  return { input: path.relative(repoRoot, inputPath), output: path.relative(repoRoot, outputPath), rows: fixture.rows.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  fs.mkdirSync(options.outDir, { recursive: true });
  const outputs = [
    convertOne(
      path.join(options.inputDir, "v33_reviewer_a_blind_fixture.json"),
      path.join(options.outDir, "v33_reviewer_a_blind_review.csv")
    ),
    convertOne(
      path.join(options.inputDir, "v33_reviewer_b_blind_fixture.json"),
      path.join(options.outDir, "v33_reviewer_b_blind_review.csv")
    )
  ];
  writeGuide(options.outDir);
  console.log(JSON.stringify({ outputs, guide: path.relative(repoRoot, path.join(options.outDir, "BLIND_REVIEW_TABLE_GUIDE.md")) }, null, 2));
}
