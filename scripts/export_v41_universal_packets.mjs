#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  buildPrompt,
  evidenceTagBlock,
  fieldValue,
  fieldsForLabel,
  sourceRightsBlock,
  mandatoryRefusalPhrase
} from "./prompt_builder.mjs";
import { generateDeterministicAnswer } from "./deterministic_responder.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  retrievalPath: path.join(repoRoot, "reports/retrieval_sufficiency_300_contract.json"),
  variantId: "top3_gold_contract_source_rights",
  promptVariant: "r03_v33_postprocessed_prose",
  outputPath: path.join(repoRoot, "reports/v41_universal_packets_300.json"),
  start: 1,
  limit: null
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--retrieval") parsed.retrievalPath = path.resolve(args[++index]);
    else if (arg === "--variant") parsed.variantId = args[++index];
    else if (arg === "--prompt-variant") parsed.promptVariant = args[++index];
    else if (arg === "--out") parsed.outputPath = path.resolve(args[++index]);
    else if (arg === "--start") parsed.start = Math.max(1, Number(args[++index]));
    else if (arg === "--limit") parsed.limit = Math.max(1, Number(args[++index]));
  }
  return parsed;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function splitIds(value) {
  return String(value || "").split("|").map((id) => id.trim()).filter(Boolean);
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function rowId(row) {
  return row.query_id || row.id;
}

function modelAgnosticPrompt(prompt) {
  return String(prompt || "")
    .replace(/\bbrowser-local Qwen RAG experiment\b/g, "browser-local RAG experiment")
    .replace(/\bQwen\/WebLLM\b/g, "the local browser model")
    .replace(/\bQwen\b/g, "the local model");
}

function evidenceSummaryForPacket(evidence, label) {
  const fields = fieldsForLabel(label);
  return evidence.map((record, recordIndex) => {
    return {
      record_index: recordIndex + 1,
      values_in_required_field_order: fields.map((field) => ({
        field,
        value: fieldValue(record, field)
      }))
    };
  });
}

export function exportUniversalPackets(options) {
  const queriesById = new Map(readJsonl(options.queriesPath).map((query) => [rowId(query), query]));
  const labels = readJsonl(options.labelsPath);
  const recordsById = new Map(readJsonl(options.recordsPath).map((record) => [record.record_id || record.id, record]));
  const retrievalRows = readJson(options.retrievalPath).rows.filter((row) => row.variant_id === options.variantId);
  const retrievalById = new Map(retrievalRows.map((row) => [row.query_id, row]));

  const startIndex = options.start - 1;
  const scopedLabels = labels.slice(startIndex, options.limit ? startIndex + options.limit : undefined);
  const rows = scopedLabels.map((label) => {
    const query = queriesById.get(rowId(label));
    const retrieval = retrievalById.get(rowId(label));
    const retrievedIds = splitIds(retrieval?.retrieved_ids);
    const evidence = retrievedIds.map((id) => recordsById.get(id)).filter(Boolean);
    const fields = fieldsForLabel(label);
    const packet = { query, label, evidence, retrievedIds, retrieval };
    const deterministic = generateDeterministicAnswer(packet, { promptVariant: options.promptVariant });
    const prompt = deterministic ? null : modelAgnosticPrompt(buildPrompt(packet, { promptVariant: options.promptVariant }));
    return {
      query_id: rowId(label),
      query_text: query?.query_text || query?.text || "",
      intent: label.intent,
      lane: label.gold_lane,
      refusal_expected: label.refusal_expected === true,
      deterministic_lane: deterministic?.lane || null,
      deterministic_answer_text: deterministic?.answer_text || null,
      model_prompt: prompt,
      prompt_variant: options.promptVariant,
      packet_variant: options.variantId,
      retrieved_ids: retrievedIds,
      required_fields: fields,
      must_not_invent_fields: label.must_not_invent_fields || [],
      expected_evidence_tags: evidenceTagBlock(evidence, fields),
      expected_source_rights_answer: label.intent === "source_rights_question" && evidence[0] ? sourceRightsBlock(evidence[0]) : null,
      expected_refusal_answer: label.refusal_expected === true ? mandatoryRefusalPhrase() : null,
      evidence_summary: evidenceSummaryForPacket(evidence, label),
      evidence_records: evidence
    };
  });

  const deterministicCount = rows.filter((row) => row.deterministic_lane).length;
  const report = {
    _provenance: {
      step: "export_v41_universal_packets",
      timestamp: new Date().toISOString(),
      commit: gitCommit(),
      inputs: {
        queries: path.relative(repoRoot, options.queriesPath),
        labels: path.relative(repoRoot, options.labelsPath),
        records: path.relative(repoRoot, options.recordsPath),
        retrieval: path.relative(repoRoot, options.retrievalPath)
      },
      packet_variant: options.variantId,
      prompt_variant: options.promptVariant,
      start: options.start,
      limit: options.limit
    },
    summary: {
      rows: rows.length,
      deterministic_rows: deterministicCount,
      model_generation_rows: rows.length - deterministicCount,
      purpose: "Model-agnostic V4.1 input packets for cross-runtime validation."
    },
    rows
  };
  fs.writeFileSync(options.outputPath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = exportUniversalPackets(options);
  console.log(JSON.stringify({
    output: path.relative(repoRoot, options.outputPath),
    rows: report.summary.rows,
    deterministic_rows: report.summary.deterministic_rows,
    model_generation_rows: report.summary.model_generation_rows
  }, null, 2));
}
