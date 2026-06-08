#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function parseArgs(args) {
  const parsed = {
    labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
    recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
    outputJsonPath: path.join(repoRoot, "reports/intent_saturation_round03_300.json"),
    outputMdPath: path.join(repoRoot, "reports/INTENT_SATURATION_ROUND_03_300.md")
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--json-out") parsed.outputJsonPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.outputMdPath = path.resolve(args[++index]);
  }
  return parsed;
}

function addValue(target, field, value) {
  if (value === null || value === undefined) return;
  const normalized = typeof value === "string" ? value.trim() : String(value);
  if (!normalized) return;
  if (!target[field]) target[field] = new Set();
  target[field].add(normalized);
}

function hostFromUrl(value) {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function collectRecordValues(record, fields) {
  addValue(fields, "record_id", record.record_id);
  addValue(fields, "region", record.region);
  addValue(fields, "date_text", record.date_text);
  addValue(fields, "object_type", record.object_type);
  addValue(fields, "creator", record.creator);
  addValue(fields, "source_name", record.source?.name);
  addValue(fields, "source_domain", hostFromUrl(record.source?.url));
  addValue(fields, "rights_state", record.rights?.state);
  addValue(fields, "rights_label", record.rights?.label);
  addValue(fields, "reuse_permission", record.rights_interpretation?.reuse_permission);
  addValue(fields, "public_domain_status", record.rights_interpretation?.public_domain_status);
  addValue(fields, "image_state_code", record.image_state?.code);
  addValue(fields, "topology_surface_type", record.topology?.surface_type);
  addValue(fields, "topology_publication_role", record.topology?.publication_role);
  if (record.method_context) addValue(fields, "method_context_kind", record.method_context.kind || "method_context");
}

function sortedSample(set, limit = 5) {
  return [...set].sort().slice(0, limit);
}

export function checkSaturation(labelsPath, recordsPath) {
  const labels = readJsonl(labelsPath);
  const records = readJsonl(recordsPath);
  const recordMap = new Map(records.map((record) => [record.record_id || record.id, record]));
  const byIntent = new Map();

  for (const label of labels) {
    if (!byIntent.has(label.intent)) {
      byIntent.set(label.intent, {
        intent: label.intent,
        query_count: 0,
        answerable_count: 0,
        refusal_count: 0,
        gold_evidence_references: 0,
        unique_fields: {}
      });
    }
    const bucket = byIntent.get(label.intent);
    bucket.query_count += 1;
    if (label.refusal_expected) bucket.refusal_count += 1;
    else bucket.answerable_count += 1;
    const recordsForLabel = (label.gold_evidence_ids || []).map((id) => recordMap.get(id)).filter(Boolean);
    bucket.gold_evidence_references += recordsForLabel.length;
    for (const record of recordsForLabel) collectRecordValues(record, bucket.unique_fields);
  }

  const intents = [...byIntent.values()]
    .sort((a, b) => a.intent.localeCompare(b.intent))
    .map((bucket) => ({
      intent: bucket.intent,
      query_count: bucket.query_count,
      answerable_count: bucket.answerable_count,
      refusal_count: bucket.refusal_count,
      gold_evidence_references: bucket.gold_evidence_references,
      unique_counts: Object.fromEntries(
        Object.entries(bucket.unique_fields)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([field, values]) => [field, values.size])
      ),
      samples: Object.fromEntries(
        Object.entries(bucket.unique_fields)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([field, values]) => [field, sortedSample(values)])
      )
    }));

  return {
    _provenance: {
      step: "intent_saturation_check",
      timestamp: new Date().toISOString(),
      labels_path: path.relative(repoRoot, labelsPath),
      records_path: path.relative(repoRoot, recordsPath)
    },
    summary: {
      label_count: labels.length,
      record_count: records.length,
      intent_count: intents.length
    },
    intents
  };
}

function markdown(report) {
  const overviewRows = report.intents.map((item) => {
    const rightsStates = item.unique_counts.rights_state || 0;
    const regions = item.unique_counts.region || 0;
    const dates = item.unique_counts.date_text || 0;
    const domains = item.unique_counts.source_domain || 0;
    const records = item.unique_counts.record_id || 0;
    return `| ${item.intent} | ${item.query_count} | ${item.answerable_count} | ${item.refusal_count} | ${records} | ${regions} | ${dates} | ${rightsStates} | ${domains} |`;
  }).join("\n");
  const detailSections = report.intents.map((item) => {
    const lines = Object.entries(item.unique_counts)
      .map(([field, count]) => {
        const samples = (item.samples[field] || []).join("; ");
        return `- ${field}: ${count}${samples ? ` (sample: ${samples})` : ""}`;
      })
      .join("\n");
    return `### ${item.intent}\n\n${lines || "- No evidence-field saturation values; this is expected for empty-evidence refusal intents."}`;
  }).join("\n\n");
  return `# Intent Saturation Report

Generated: ${report._provenance.timestamp}

This report measures evidence-field diversity by intent for the research-only
fixture. It is a design diagnostic: it does not claim generation quality.

## Overview

| Intent | Queries | Answerable | Refusal | Unique Records | Regions | Dates | Rights States | Source Domains |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
${overviewRows}

## Field Details

${detailSections}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const report = checkSaturation(options.labelsPath, options.recordsPath);
  fs.writeFileSync(options.outputJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(options.outputMdPath, markdown(report));
  console.log(JSON.stringify({
    json: path.relative(repoRoot, options.outputJsonPath),
    report: path.relative(repoRoot, options.outputMdPath),
    label_count: report.summary.label_count,
    intent_count: report.summary.intent_count
  }, null, 2));
}
