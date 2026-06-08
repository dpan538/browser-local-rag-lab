#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function splitIds(value) {
  return String(value || "").split("|").filter(Boolean);
}

function parseArgs(args) {
  const parsed = {
    labelsPath: path.join(repoRoot, "fixtures/expansion/round02_200/labels.jsonl"),
    retrievalPath: path.join(repoRoot, "reports/retrieval_sufficiency_200.json"),
    sourceVariantId: "top3_compressed_topology_source_rights",
    contractVariantId: "top3_gold_contract_source_rights",
    outputJsonPath: path.join(repoRoot, "reports/retrieval_sufficiency_200_contract.json"),
    outputMdPath: path.join(repoRoot, "reports/RETRIEVAL_SUFFICIENCY_200_CONTRACT.md"),
    topK: 3
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--retrieval") parsed.retrievalPath = path.resolve(args[++index]);
    else if (arg === "--source-variant") parsed.sourceVariantId = args[++index];
    else if (arg === "--contract-variant") parsed.contractVariantId = args[++index];
    else if (arg === "--json-out") parsed.outputJsonPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.outputMdPath = path.resolve(args[++index]);
    else if (arg === "--top-k") parsed.topK = Number(args[++index]);
  }
  return parsed;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function markdown(report) {
  const changedRows = report.rows.filter((row) => row.gold_injected_count > 0);
  const rows = changedRows.length === 0
    ? "| none | none | none |"
    : changedRows.slice(0, 120).map((row) => `| ${row.query_id} | ${row.intent} | ${row.gold_injected_count} | ${row.retrieved_ids} |`).join("\n");
  return `# Retrieval Sufficiency Contract Variant

Generated: ${report.meta.generated_at}

This is a research-only controlled evidence-packet variant. It injects each
answerable label's gold evidence IDs into the packet before adding filler
records from the original retrieval result. It does not represent product
retrieval quality.

## Summary

- Source variant: ${report.meta.source_variant_id}
- Contract variant: ${report.meta.contract_variant_id}
- Rows: ${report.summary.rows}
- Rows with injected gold evidence: ${report.summary.rows_with_gold_injection}
- Total injected gold IDs: ${report.summary.total_gold_injected}

## Changed Rows

| Query | Intent | Injected gold count | Retrieved IDs |
|---|---|---:|---|
${rows}
`;
}

export function buildContractRetrievalVariant(options) {
  const labels = readJsonl(options.labelsPath);
  const retrieval = readJson(options.retrievalPath);
  const sourceRows = retrieval.rows.filter((row) => row.variant_id === options.sourceVariantId);
  const sourceByQuery = new Map(sourceRows.map((row) => [row.query_id, row]));

  const rows = labels.map((label) => {
    const source = sourceByQuery.get(label.query_id) || {
      query_id: label.query_id,
      intent: label.intent,
      gold_lane: label.gold_lane,
      candidate_count: 0,
      retrieval_ms: null,
      sufficient_context: label.sufficient_context,
      refusal_expected: label.refusal_expected,
      review_state: label.review_state
    };
    const goldIds = label.refusal_expected ? [] : label.gold_evidence_ids || [];
    const sourceIds = label.refusal_expected ? [] : splitIds(source.retrieved_ids);
    const targetCount = Math.max(options.topK, goldIds.length);
    const retrievedIds = unique([...goldIds, ...sourceIds]).slice(0, targetCount);
    const injected = goldIds.filter((id) => !sourceIds.includes(id));
    const retrievedSet = new Set(retrievedIds);
    const coveredGoldIds = goldIds.filter((id) => retrievedSet.has(id));
    const missingGoldIds = goldIds.filter((id) => !retrievedSet.has(id));
    const evidenceCovered = missingGoldIds.length === 0;
    return {
      ...source,
      variant_id: options.contractVariantId,
      top_k: targetCount,
      retrieved_ids: retrievedIds.join("|"),
      gold_evidence_ids: (label.gold_evidence_ids || []).join("|"),
      candidate_count: retrievedIds.length,
      covered_gold_evidence_ids: coveredGoldIds.join("|"),
      missing_gold_evidence_ids: missingGoldIds.join("|"),
      gold_evidence_total: goldIds.length,
      gold_evidence_covered: coveredGoldIds.length,
      gold_id_coverage_rate: goldIds.length > 0 ? Number((coveredGoldIds.length / goldIds.length).toFixed(4)) : 1,
      evidence_covered: evidenceCovered,
      sufficient_packet: label.refusal_expected || evidenceCovered,
      contract_retrieval_variant: true,
      contract_retrieval_note: "research-only gold evidence injection for generation contract testing; not product retrieval",
      gold_injected_count: injected.length,
      gold_injected_ids: injected.join("|")
    };
  });

  const report = {
    meta: {
      generated_at: new Date().toISOString(),
      source_path: path.relative(repoRoot, options.retrievalPath),
      labels_path: path.relative(repoRoot, options.labelsPath),
      source_variant_id: options.sourceVariantId,
      contract_variant_id: options.contractVariantId,
      research_only: true
    },
    summary: {
      rows: rows.length,
      rows_with_gold_injection: rows.filter((row) => row.gold_injected_count > 0).length,
      total_gold_injected: rows.reduce((sum, row) => sum + row.gold_injected_count, 0)
    },
    rows
  };
  fs.writeFileSync(options.outputJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(options.outputMdPath, markdown(report));
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const report = buildContractRetrievalVariant(options);
  console.log(JSON.stringify({
    report: path.relative(repoRoot, options.outputMdPath),
    json: path.relative(repoRoot, options.outputJsonPath),
    ...report.summary
  }, null, 2));
}
