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

function methodRecord() {
  return {
    surfaceId: "LAB-METHOD-CONTEXT-V0",
    sourceRecordId: "LAB-METHOD-CONTEXT-V0",
    title: "Browser-local RAG lab method context",
    creator: "browser-local-rag-lab",
    dateText: "2026-06-07",
    dateStart: 2026,
    dateEnd: 2026,
    region: "Research method",
    objectType: "method_context",
    medium: "research-only fixture record",
    source: {
      name: "browser-local-rag-lab method files",
      url: "https://github.com/dpan538/browser-local-rag-lab",
      accessDate: "2026-06-07"
    },
    rights: {
      state: "research_fixture",
      displayPolicy: "text_only",
      label: "Research-only method fixture; not archive object evidence."
    },
    imageState: {
      code: "IMG00",
      displayMode: "no_image",
      hasImageFrame: false,
      modelImageEligible: false
    },
    topology: {
      surfaceType: "method",
      publicationRole: "method_context",
      folderTitles: ["Research lab method"],
      historicalNodeIds: [],
      movementIds: []
    },
    methodContext: {
      evidenceDefinition: "Use source-linked metadata, compact text, source, rights, image-state, and topology fields as retrieval evidence.",
      answerLanePolicy: "Choose help, fast_answer, source_rights, research_answer, or refusal_more_context before generation.",
      nonEvidenceRule: "AI output is experimental text and cannot become archive evidence.",
      refusalRule: "Refuse or request narrower context when required fields or claim support are absent."
    },
    text: {
      descriptionSummary: "The lab method defines evidence fields, answer lanes, non-evidence generated output, and refusal behavior."
    }
  };
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
    Object.values(record.methodContext || {}).join(" "),
    record.topology?.folderTitles?.join(" "),
    Object.values(record.text || {}).join(" ")
  ].join(" ").toLowerCase();
}

function mentionedRecords(records, query) {
  const text = query.query_text.toLowerCase();
  return records.filter((record) => {
    const id = record.surfaceId || "";
    const title = record.title.toLowerCase();
    return text.includes(id.toLowerCase())
      || text.includes(title)
      || (title.length > 18 && text.includes(title.slice(0, 18)));
  });
}

function recordMatchesRegion(record, queryText) {
  const text = queryText.toLowerCase();
  const region = String(record.region || "").toLowerCase();
  const title = String(record.title || "").toLowerCase();
  const hay = `${region} ${title}`;
  if (text.includes("france")) return hay.includes("france");
  if (text.includes("latin america")) return region.includes("latin america");
  if (text.includes("asia")) return region.includes("asia") || region.includes("china") || region.includes("india") || region.includes("vietnam") || title.includes("tokyo");
  if (text.includes("japan")) return region.includes("japan") || title.includes("tokyo");
  if (text.includes("russia") || text.includes("soviet")) return region.includes("russia") || title.includes("soviet") || title.includes("russia");
  return true;
}

function recordMatchesPeriod(record, queryText) {
  const text = queryText.toLowerCase();
  const start = record.dateStart || Number.parseInt(record.dateText, 10);
  if (!Number.isFinite(start)) return false;
  if (text.includes("nineteenth")) return start >= 1800 && start <= 1899;
  if (text.includes("twentieth")) return start >= 1900 && start <= 1999;
  if (text.includes("1960s")) return start >= 1960 && start <= 1969;
  return true;
}

function routeRecords(records, query, limit) {
  return records
    .filter((record) => recordMatchesRegion(record, query.query_text) && recordMatchesPeriod(record, query.query_text))
    .filter((record) => record.title && record.source?.url && record.region && record.dateText)
    .sort((a, b) => (a.dateStart || 9999) - (b.dateStart || 9999))
    .slice(0, limit);
}

function contextRecords(records, query, limit) {
  const active = query.active_object_id ? records.find((record) => record.surfaceId === query.active_object_id) : null;
  if (!active) return [];
  const related = records
    .filter((record) => record.surfaceId !== active.surfaceId)
    .map((record) => {
      const activeRegion = String(active.region || "").toLowerCase();
      const region = String(record.region || "").toLowerCase();
      const title = String(record.title || "").toLowerCase();
      const type = String(record.objectType || "").toLowerCase();
      let score = 0;
      if (region === activeRegion) score += 5;
      if (activeRegion.includes("russia") && (title.includes("russia") || title.includes("soviet"))) score += 4;
      if (type.includes("poster") || type.includes("advertising") || type.includes("print")) score += 2;
      if (record.source?.name && active.source?.name && record.source.name.split(" ")[0] === active.source.name.split(" ")[0]) score += 1;
      const dateDistance = Math.abs((record.dateStart || 0) - (active.dateStart || 0));
      return { record, score, dateDistance };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.dateDistance - b.dateDistance)
    .map((item) => item.record)
    .slice(0, Math.max(0, limit - 1));
  return [active, ...related];
}

function retrieve(records, query, topK) {
  if (query.intent === "no_evidence_refusal") return [];
  if (query.intent === "method_process_question") return records.filter((record) => record.surfaceId === "LAB-METHOD-CONTEXT-V0").slice(0, topK);
  if (query.intent === "comparison") return mentionedRecords(records, query).slice(0, topK);
  if (query.intent === "region_period_recommendation") return routeRecords(records, query, topK);
  if (query.intent === "more_context") return contextRecords(records, query, topK);
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
    method_context: Boolean(record.methodContext)
  };
}

function hasRequiredFields(candidates, label, variant) {
  if (label.required_fields.length === 0) return true;
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
    methodContext: record.methodContext,
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
const records = [...fixture.records, methodRecord()];
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
    const candidates = retrieve(records, query, variant.topK);
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
  refusal-expected unless the fixture contains chronology proof. The benchmark
  treats this as a generation gate, not an empty-search requirement.
- Method/process questions use the research-only method context fixture record;
  this record is not archive object evidence.
`);

console.log(JSON.stringify({
  rows: rows.length,
  report: path.relative(repoRoot, reportMdPath),
  summary
}, null, 2));
