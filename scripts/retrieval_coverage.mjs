#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const labelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const retrievalPath = path.join(repoRoot, "reports/retrieval_sufficiency_v0.json");
const reportJsonPath = path.join(repoRoot, "reports/retrieval_coverage_v0.json");
const reportMdPath = path.join(repoRoot, "reports/RETRIEVAL_COVERAGE_v0.md");

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function readRetrievalRows(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  if (filePath.endsWith(".json")) {
    const parsed = JSON.parse(text);
    return parsed.rows || parsed;
  }
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function splitIds(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "").split("|").filter(Boolean);
}

export function computeRetrievalCoverage(labelsFile = labelsPath, retrievalFile = retrievalPath) {
  const labels = new Map(readJsonl(labelsFile).map((label) => [label.query_id, label]));
  const rows = readRetrievalRows(retrievalFile);
  const variants = new Map();

  for (const row of rows) {
    const variant = row.variant_id || "default";
    if (!variants.has(variant)) {
      variants.set(variant, { variant_id: variant, query_count: 0, total_gold_ids: 0, covered_gold_ids: 0, missing: [] });
    }
    const stats = variants.get(variant);
    const label = labels.get(row.query_id);
    if (!label) continue;
    const goldIds = label.gold_evidence_ids || [];
    const retrieved = new Set(splitIds(row.retrieved_ids));
    const missing = goldIds.filter((id) => !retrieved.has(id));
    stats.query_count += 1;
    stats.total_gold_ids += goldIds.length;
    stats.covered_gold_ids += goldIds.length - missing.length;
    if (missing.length > 0) {
      stats.missing.push({
        query_id: row.query_id,
        intent: label.intent,
        gold_lane: label.gold_lane,
        missing_ids: missing
      });
    }
  }

  const summary = [...variants.values()].map((stats) => ({
    ...stats,
    coverage_rate: stats.total_gold_ids === 0
      ? 1
      : Number((stats.covered_gold_ids / stats.total_gold_ids).toFixed(3)),
    missing_query_count: stats.missing.length
  })).sort((a, b) => b.coverage_rate - a.coverage_rate || a.variant_id.localeCompare(b.variant_id));

  return {
    variant_count: summary.length,
    summary
  };
}

function writeReports(result) {
  fs.writeFileSync(reportJsonPath, JSON.stringify({ generated_at: new Date().toISOString(), ...result }, null, 2) + "\n");
  const summaryRows = result.summary.map((row) => `| ${row.variant_id} | ${row.query_count} | ${row.coverage_rate} | ${row.covered_gold_ids}/${row.total_gold_ids} | ${row.missing_query_count} |`).join("\n");
  const missingRows = result.summary.flatMap((row) => row.missing.map((item) => `| ${row.variant_id} | ${item.query_id} | ${item.intent} | ${item.missing_ids.join("|")} |`));
  fs.writeFileSync(reportMdPath, `# Retrieval Coverage v0

Generated: ${new Date().toISOString()}

This report checks whether retrieved packets include the exact
\`gold_evidence_ids\`, not only equivalent required fields.

## Summary

| Variant | Queries | Gold-id coverage | Covered | Queries with missing ids |
|---|---:|---:|---:|---:|
${summaryRows}

## Missing Gold Evidence

| Variant | Query | Intent | Missing ids |
|---|---|---|---|
${missingRows.length === 0 ? "| none | none | none | none |" : missingRows.join("\n")}
`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const result = computeRetrievalCoverage(positional[0] || labelsPath, positional[1] || retrievalPath);
  writeReports(result);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, reportMdPath),
    best_variant: result.summary[0]?.variant_id,
    best_coverage_rate: result.summary[0]?.coverage_rate
  }, null, 2));
}
