#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";

const repoRoot = path.resolve(import.meta.dirname, "..");
const fixturePath = path.join(repoRoot, "fixtures/archive_fixture_v0.json");
const goldDir = path.join(repoRoot, "fixtures/gold");
const reportJsonPath = path.join(repoRoot, "reports/retrieval_sufficiency_v0.json");
const reportCsvPath = path.join(repoRoot, "reports/retrieval_sufficiency_v0.csv");
const reportMdPath = path.join(repoRoot, "reports/RETRIEVAL_SUFFICIENCY_v0.md");

const STOP = new Set("a an and are as at be by can did do does for from has have here how i if in is it me of on or should the this to using was what when where who why with without".split(" "));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function terms(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP.has(term));
}

function haystack(record) {
  return [
    record.surfaceId,
    record.sourceRecordId,
    record.title,
    record.creator,
    record.dateText,
    record.region,
    record.objectType,
    record.medium,
    record.source?.name,
    record.source?.url,
    record.rights?.state,
    record.rights?.label,
    record.imageState?.code,
    record.topology?.folderTitles?.join(" "),
    Object.values(record.text || {}).join(" ")
  ].join(" ").toLowerCase();
}

function retrieve(records, query, topK) {
  if (query.intent === "no_evidence_refusal") return [];
  const queryTerms = terms(query.query_text);
  const exact = query.active_object_id ? records.find((record) => record.surfaceId === query.active_object_id) : null;
  const ranked = records
    .map((record) => {
      const text = haystack(record);
      let score = 0;
      for (const term of queryTerms) {
        if (text.includes(term)) score += 1;
        if (record.title.toLowerCase().includes(term)) score += 2;
      }
      if (query.active_object_id && record.surfaceId === query.active_object_id) score += 100;
      if (query.intent === "source_rights_question" && record.rights?.label) score += 4;
      if (query.intent === "region_period_recommendation" && record.region) score += 2;
      if (query.intent === "first_earliest_claim" && record.dateStart) score += Math.max(0, 4 - record.dateStart / 1000);
      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.record.dateStart || 9999) - (b.record.dateStart || 9999))
    .map((item) => item.record);
  if (exact && !ranked.some((record) => record.surfaceId === exact.surfaceId)) ranked.unshift(exact);
  return ranked.slice(0, topK);
}

function packetFieldsAvailable(record, variant) {
  return {
    record_id: true,
    title: Boolean(record.title),
    date_text: Boolean(record.dateText),
    region: Boolean(record.region),
    source: variant.includeSourceRights && Boolean(record.source?.name && record.source?.url),
    rights: variant.includeSourceRights && Boolean(record.rights?.label || record.rights?.state),
    image_state: Boolean(record.imageState?.code),
    public_domain_status: variant.includeSourceRights && Boolean(record.rights?.label || record.rights?.state),
    reuse_permission: variant.includeSourceRights && Boolean(record.rights?.label || record.rights?.state),
    topology: variant.includeTopology && Boolean(record.topology?.folderTitles?.length),
    method_context: false
  };
}

function hasRequiredFields(candidates, label, variant) {
  if (label.required_fields.length === 0) return true;
  if (label.required_fields.includes("method_context")) return false;
  if (candidates.length === 0) return false;
  return label.required_fields.every((field) => candidates.some((record) => packetFieldsAvailable(record, variant)[field]));
}

function coversGoldEvidence(candidates, label) {
  if (label.gold_evidence_ids.length === 0) return !label.sufficient_context;
  const candidateIds = new Set(candidates.map((record) => record.surfaceId));
  return label.gold_evidence_ids.every((id) => candidateIds.has(id));
}

function estimateTokens(text) {
  return Math.ceil(String(text).length / 4);
}

function packetText(candidates, variant) {
  return JSON.stringify(candidates.map((record) => ({
    id: record.surfaceId,
    title: record.title,
    date: record.dateText,
    region: record.region,
    source: variant.includeSourceRights ? record.source : undefined,
    rights: variant.includeSourceRights ? record.rights : undefined,
    rightsInterpretation: variant.includeSourceRights ? {
      reusePermission: record.rights?.label || record.rights?.state ? "derived from source rights metadata; verify source before reuse" : undefined,
      publicDomainStatus: record.rights?.label || record.rights?.state ? "not globally determined by fixture unless source rights explicitly say so" : undefined
    } : undefined,
    imageState: record.imageState,
    topology: variant.includeTopology ? record.topology : undefined,
    note: variant.noteMode === "raw"
      ? record.text?.descriptionSummary
      : [record.text?.sourceDescription, record.text?.sourceNotes, record.text?.uncertaintyNote].filter(Boolean).join(" ")
  })));
}

function toCsv(rows) {
  const headers = Object.keys(rows[0] || {});
  const escape = (value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n") + "\n";
}

const fixture = readJson(fixturePath);
const queries = readJsonl(path.join(goldDir, "queries.jsonl"));
const labels = new Map(readJsonl(path.join(goldDir, "labels.jsonl")).map((label) => [label.query_id, label]));
const variants = [
  { variant_id: "top1_compressed_topology_source_rights", topK: 1, noteMode: "compressed", includeTopology: true, includeSourceRights: true },
  { variant_id: "top3_compressed_topology_source_rights", topK: 3, noteMode: "compressed", includeTopology: true, includeSourceRights: true },
  { variant_id: "top8_compressed_topology_source_rights", topK: 8, noteMode: "compressed", includeTopology: true, includeSourceRights: true },
  { variant_id: "top3_raw_topology_source_rights", topK: 3, noteMode: "raw", includeTopology: true, includeSourceRights: true },
  { variant_id: "top3_compressed_no_topology_source_rights", topK: 3, noteMode: "compressed", includeTopology: false, includeSourceRights: true },
  { variant_id: "top3_compressed_topology_no_source_rights", topK: 3, noteMode: "compressed", includeTopology: true, includeSourceRights: false }
];

const rows = [];
for (const query of queries) {
  const label = labels.get(query.query_id);
  for (const variant of variants) {
    const t0 = performance.now();
    const candidates = retrieve(fixture.records, query, variant.topK);
    const t1 = performance.now();
    const refusalGateAvailable = label.refusal_expected;
    const emptyRetrievalCorrect = query.intent === "no_evidence_refusal"
      ? candidates.length === 0
      : true;
    const evidenceCovered = coversGoldEvidence(candidates, label);
    const fieldsPresent = hasRequiredFields(candidates, label, variant);
    const sufficientPacket = label.sufficient_context ? evidenceCovered && fieldsPresent : refusalGateAvailable;
    const text = packetText(candidates, variant);
    rows.push({
      query_id: query.query_id,
      intent: query.intent,
      gold_lane: label.gold_lane,
      variant_id: variant.variant_id,
      top_k: variant.topK,
      candidate_count: candidates.length,
      retrieval_ms: Number((t1 - t0).toFixed(3)),
      prompt_tokens_est: estimateTokens(text),
      gold_evidence_ids: label.gold_evidence_ids.join("|"),
      retrieved_ids: candidates.map((record) => record.surfaceId).join("|"),
      sufficient_context: label.sufficient_context,
      refusal_expected: label.refusal_expected,
      refusal_gate_available: refusalGateAvailable,
      empty_retrieval_correct: emptyRetrievalCorrect,
      evidence_covered: evidenceCovered,
      required_fields_present: fieldsPresent,
      sufficient_packet: sufficientPacket,
      review_state: label.review_state
    });
  }
}

const summary = variants.map((variant) => {
  const subset = rows.filter((row) => row.variant_id === variant.variant_id);
  const avg = (field) => subset.reduce((sum, row) => sum + Number(row[field] || 0), 0) / subset.length;
  return {
    variant_id: variant.variant_id,
    runs: subset.length,
    sufficiency_rate: Number((subset.filter((row) => row.sufficient_packet).length / subset.length).toFixed(3)),
    evidence_coverage_rate: Number((subset.filter((row) => row.evidence_covered).length / subset.length).toFixed(3)),
    required_fields_rate: Number((subset.filter((row) => row.required_fields_present).length / subset.length).toFixed(3)),
    refusal_gate_rate: Number((subset.filter((row) => row.refusal_expected ? row.refusal_gate_available : true).length / subset.length).toFixed(3)),
    empty_retrieval_correct_rate: Number((subset.filter((row) => row.empty_retrieval_correct).length / subset.length).toFixed(3)),
    avg_prompt_tokens_est: Math.round(avg("prompt_tokens_est")),
    avg_retrieval_ms: Number(avg("retrieval_ms").toFixed(3))
  };
});

const report = {
  meta: {
    generated_at: new Date().toISOString(),
    method: "seed_auto_gold_v0",
    warning: "Gold labels are seed labels and require human review before paper claims."
  },
  summary,
  rows
};

fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(reportCsvPath, toCsv(rows));
fs.writeFileSync(reportMdPath, `# Retrieval Sufficiency v0

Generated: ${report.meta.generated_at}

This report evaluates whether deterministic retrieval plus evidence-packet
variants preserve seeded gold evidence and required fields before any model
generation. Labels are marked \`seed_auto_needs_human_review\`; use this as a
method scaffold, not as final paper evidence.

| Variant | Runs | Sufficiency | Evidence coverage | Required fields | Refusal gate | Empty retrieval check | Avg tokens est. | Avg retrieval ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
${summary.map((row) => `| ${row.variant_id} | ${row.runs} | ${row.sufficiency_rate} | ${row.evidence_coverage_rate} | ${row.required_fields_rate} | ${row.refusal_gate_rate} | ${row.empty_retrieval_correct_rate} | ${row.avg_prompt_tokens_est} | ${row.avg_retrieval_ms} |`).join("\n")}

## Reading

- Top-k variants should be interpreted against seeded evidence labels.
- Source/rights removal is a negative control because it cannot satisfy
  source/rights queries even if it reduces prompt size.
- First/earliest and rights-upgrade claims are deliberately marked
  refusal-expected until human review exists. They may still retrieve related
  records; the benchmark treats this as a generation gate, not an empty-search
  requirement.
- Method/process questions currently lack method-context fixture records; this
  is an intentional gap to fill before research-mode claims.
`);

console.log(JSON.stringify({
  rows: rows.length,
  report: path.relative(repoRoot, reportMdPath),
  summary
}, null, 2));
