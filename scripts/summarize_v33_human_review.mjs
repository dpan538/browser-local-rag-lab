#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  fixturePath: path.join(repoRoot, "reports/review_fixture_v33_300_stratified.json"),
  jsonOutPath: path.join(repoRoot, "reports/quality_review_summary_v33_300.json"),
  mdOutPath: path.join(repoRoot, "reports/QUALITY_REVIEW_SUMMARY_V33_300.md"),
  strict: false
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--fixture") parsed.fixturePath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.jsonOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
    else if (arg === "--strict") parsed.strict = true;
  }
  return parsed;
}

function readFixture(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (Array.isArray(parsed)) return { rows: parsed };
  return { ...parsed, rows: parsed.rows || [] };
}

function isPending(value) {
  return !value || value === "pending" || value === "unreviewed";
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedObject(map) {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function summarizeRows(rows) {
  const decisionCounts = new Map();
  const faithfulnessCounts = new Map();
  const usabilityCounts = new Map();
  const adjudicationCounts = new Map();
  const byIntent = new Map();
  const byFlag = new Map();
  let reviewedRows = 0;
  let pendingRows = 0;
  let rowsWithNotes = 0;

  for (const row of rows) {
    const decision = row.reviewer_decision || "pending";
    const faithfulness = row.reviewer_faithfulness || "pending";
    const usability = row.reviewer_usability || "pending";
    const adjudication = row.adjudication_state || "unreviewed";
    const reviewed = !isPending(decision) && !isPending(faithfulness) && !isPending(usability);

    increment(decisionCounts, decision);
    increment(faithfulnessCounts, faithfulness);
    increment(usabilityCounts, usability);
    increment(adjudicationCounts, adjudication);
    if (reviewed) reviewedRows += 1;
    else pendingRows += 1;
    if (String(row.reviewer_notes || "").trim()) rowsWithNotes += 1;

    const intent = row.intent || "unknown";
    if (!byIntent.has(intent)) {
      byIntent.set(intent, { total: 0, reviewed: 0, pending: 0, decisions: new Map() });
    }
    const intentSummary = byIntent.get(intent);
    intentSummary.total += 1;
    if (reviewed) intentSummary.reviewed += 1;
    else intentSummary.pending += 1;
    increment(intentSummary.decisions, decision);

    for (const flag of row.automated_flags || []) {
      if (!byFlag.has(flag)) {
        byFlag.set(flag, { total: 0, reviewed: 0, pending: 0, decisions: new Map() });
      }
      const flagSummary = byFlag.get(flag);
      flagSummary.total += 1;
      if (reviewed) flagSummary.reviewed += 1;
      else flagSummary.pending += 1;
      increment(flagSummary.decisions, decision);
    }
  }

  return {
    total_rows: rows.length,
    reviewed_rows: reviewedRows,
    pending_rows: pendingRows,
    review_complete: rows.length > 0 && pendingRows === 0,
    rows_with_notes: rowsWithNotes,
    decision_counts: sortedObject(decisionCounts),
    faithfulness_counts: sortedObject(faithfulnessCounts),
    usability_counts: sortedObject(usabilityCounts),
    adjudication_counts: sortedObject(adjudicationCounts),
    by_intent: Object.fromEntries([...byIntent.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([intent, summary]) => [
      intent,
      {
        total: summary.total,
        reviewed: summary.reviewed,
        pending: summary.pending,
        decisions: sortedObject(summary.decisions)
      }
    ])),
    by_automated_flag: Object.fromEntries([...byFlag.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([flag, summary]) => [
      flag,
      {
        total: summary.total,
        reviewed: summary.reviewed,
        pending: summary.pending,
        decisions: sortedObject(summary.decisions)
      }
    ]))
  };
}

function tableFromObjectRows(rows, headers) {
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`
  ];
  for (const row of rows) {
    lines.push(`| ${headers.map((header) => row[header] ?? "").join(" | ")} |`);
  }
  return lines.join("\n");
}

function buildMarkdown(fixture, summary, fixturePath) {
  const intentRows = Object.entries(summary.by_intent).map(([intent, row]) => ({
    Intent: intent,
    Total: row.total,
    Reviewed: row.reviewed,
    Pending: row.pending,
    Decisions: Object.entries(row.decisions).map(([key, value]) => `${key}:${value}`).join(", ")
  }));
  const flagRows = Object.entries(summary.by_automated_flag).map(([flag, row]) => ({
    Flag: flag,
    Total: row.total,
    Reviewed: row.reviewed,
    Pending: row.pending,
    Decisions: Object.entries(row.decisions).map(([key, value]) => `${key}:${value}`).join(", ")
  }));

  return `# V3.3 Human Review Summary

Generated: ${new Date().toISOString()}

Fixture: \`${path.relative(repoRoot, fixturePath)}\`

Condition: \`${fixture.condition_id || "v3.3_contract_top3_300_delivered"}\`

## Status

| Metric | Value |
|---|---:|
| Total rows | ${summary.total_rows} |
| Reviewed rows | ${summary.reviewed_rows} |
| Pending rows | ${summary.pending_rows} |
| Rows with reviewer notes | ${summary.rows_with_notes} |
| Review complete | ${summary.review_complete ? "yes" : "no"} |

This summary is paper-facing only after \`Pending rows\` reaches 0. Until then,
it documents the review queue rather than a completed semantic-quality result.

## Decision Counts

\`\`\`json
${JSON.stringify(summary.decision_counts, null, 2)}
\`\`\`

## Faithfulness Counts

\`\`\`json
${JSON.stringify(summary.faithfulness_counts, null, 2)}
\`\`\`

## Usability Counts

\`\`\`json
${JSON.stringify(summary.usability_counts, null, 2)}
\`\`\`

## Per-Intent Review State

${tableFromObjectRows(intentRows, ["Intent", "Total", "Reviewed", "Pending", "Decisions"])}

## Automated-Flag Review State

${flagRows.length ? tableFromObjectRows(flagRows, ["Flag", "Total", "Reviewed", "Pending", "Decisions"]) : "No automated-flag rows found."}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const fixture = readFixture(options.fixturePath);
  const summary = summarizeRows(fixture.rows);
  fs.mkdirSync(path.dirname(options.jsonOutPath), { recursive: true });
  fs.mkdirSync(path.dirname(options.mdOutPath), { recursive: true });
  fs.writeFileSync(options.jsonOutPath, `${JSON.stringify({ generated_at: new Date().toISOString(), fixture: path.relative(repoRoot, options.fixturePath), ...summary }, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, buildMarkdown(fixture, summary, options.fixturePath));
  console.log(JSON.stringify({
    summary: path.relative(repoRoot, options.mdOutPath),
    total_rows: summary.total_rows,
    reviewed_rows: summary.reviewed_rows,
    pending_rows: summary.pending_rows,
    review_complete: summary.review_complete
  }, null, 2));
  if (options.strict && !summary.review_complete) process.exit(1);
}
