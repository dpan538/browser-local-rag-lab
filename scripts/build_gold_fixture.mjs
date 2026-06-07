#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const fixturePath = path.join(repoRoot, "fixtures/archive_fixture_v0.json");
const queryPath = path.join(repoRoot, "fixtures/benchmark_queries_v0.json");
const outDir = path.join(repoRoot, "fixtures/gold");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hashText(text) {
  return crypto.createHash("sha256").update(String(text || "")).digest("hex").slice(0, 16);
}

function writeJsonl(filePath, rows) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function mapLane(query, refusalExpected = false) {
  if (refusalExpected) return "refusal_more_context";
  const laneByIntent = {
    archive_orientation: "help",
    casual_archive_help: "help",
    current_object_explanation: "fast_answer",
    source_rights_question: "source_rights",
    first_earliest_claim: "research_answer",
    comparison: "research_answer",
    region_period_recommendation: "research_answer",
    method_process_question: "research_answer",
    more_context: "research_answer",
    no_evidence_refusal: "refusal_more_context"
  };
  return laneByIntent[query.queryType] || (query.expectedLane === "research" ? "research_answer" : "fast_answer");
}

function requiredFieldsFor(query, refusalExpected = false) {
  if (refusalExpected) return [];
  const shared = ["record_id", "title"];
  const byIntent = {
    archive_orientation: ["topology"],
    casual_archive_help: ["topology"],
    current_object_explanation: [...shared, "date_text", "region", "source"],
    source_rights_question: [...shared, "source", "rights", "image_state", "reuse_permission", "public_domain_status"],
    first_earliest_claim: [...shared, "date_text", "source"],
    comparison: [...shared, "source"],
    region_period_recommendation: [...shared, "date_text", "region", "source"],
    method_process_question: ["method_context"],
    more_context: [...shared, "date_text", "region", "source", "topology"],
    no_evidence_refusal: []
  };
  return byIntent[query.queryType] || shared;
}

function mustNotInventFor(query) {
  const base = ["title", "creator", "date", "source", "rights"];
  if (query.queryType === "source_rights_question") return [...base, "reuse_permission", "public_domain_status"];
  if (query.queryType === "first_earliest_claim") return [...base, "first_or_earliest_claim"];
  return base;
}

function rightsInterpretationFor(record) {
  const label = `${record.rights?.state || ""} ${record.rights?.label || ""}`.toLowerCase();
  const publicDomainMentioned = label.includes("public-domain") || label.includes("public domain");
  const openLicenseMentioned = label.includes("cc by") || label.includes("open-license");
  const sourceOnly = record.rights?.displayPolicy === "open_image_frame";
  return {
    reuse_permission: openLicenseMentioned || publicDomainMentioned
      ? "source_metadata_supports_open_or_public_domain_candidate_with_source_verification_required"
      : "not_determined_from_fixture",
    public_domain_status: publicDomainMentioned
      ? "source_metadata_mentions_public_domain_but_global_public_domain_status_not_determined"
      : "not_determined_from_fixture",
    interpretation_basis: sourceOnly
      ? "derived_from_source_rights_label_and_image_state; source page remains authority"
      : "derived_from_source_rights_label; source page remains authority"
  };
}

function methodRecord() {
  const raw = [
    "The lab treats archive evidence as source-linked metadata, text summaries, rights labels, image-state, and topology hints.",
    "Generated model text is not archive evidence; it is an experimental output judged against the evidence packet.",
    "Assistant answers should choose a lane before generation: help, fast answer, source/rights, research answer, or refusal/more-context.",
    "If a query asks for a claim not supported by the packet, the correct behavior is to refuse or request narrower context."
  ].join(" ");
  return {
    record_id: "LAB-METHOD-CONTEXT-V0",
    object_id: "LAB-METHOD-CONTEXT-V0",
    title: "Browser-local RAG lab method context",
    creator: "browser-local-rag-lab",
    date_text: "2026-06-07",
    date_start: 2026,
    date_end: 2026,
    region: "Research method",
    object_type: "method_context",
    medium: "research-only fixture record",
    source: {
      name: "browser-local-rag-lab method files",
      url: "https://github.com/dpan538/browser-local-rag-lab",
      access_date: "2026-06-07"
    },
    rights: {
      state: "research_fixture",
      display_policy: "text_only",
      label: "Research-only method fixture; not archive object evidence."
    },
    rights_interpretation: {
      reuse_permission: "not_applicable_to_archive_object_reuse",
      public_domain_status: "not_applicable_to_archive_object_reuse",
      interpretation_basis: "method fixture record"
    },
    image_state: {
      code: "IMG00",
      display_mode: "no_image",
      has_image_frame: false,
      model_image_eligible: false
    },
    topology: {
      surface_type: "method",
      publication_role: "method_context",
      folder_titles: ["Research lab method"],
      historical_node_ids: [],
      movement_ids: []
    },
    method_context: {
      evidence_definition: "Use source-linked metadata, compact text, source, rights, image-state, and topology fields as retrieval evidence.",
      answer_lane_policy: "Choose help, fast_answer, source_rights, research_answer, or refusal_more_context before generation.",
      non_evidence_rule: "AI output is experimental text and cannot become archive evidence.",
      refusal_rule: "Refuse or request narrower context when required fields or claim support are absent."
    },
    notes: {
      raw,
      compact: raw,
      raw_note_hash: hashText(raw),
      packet_version: "packet.v0"
    }
  };
}

function terms(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2);
}

function rankRecords(records, query, limit) {
  if (query.queryType === "no_evidence_refusal") return [];
  const queryTerms = terms(query.question);
  const exact = query.surfaceContext ? records.find((record) => record.surfaceId === query.surfaceContext) : null;
  const ranked = records
    .map((record) => {
      const haystack = [
        record.surfaceId,
        record.title,
        record.creator,
        record.dateText,
        record.region,
        record.objectType,
        record.medium,
        record.source?.name,
        record.rights?.label,
        record.imageState?.code,
        record.topology?.folderTitles?.join(" "),
        Object.values(record.text || {}).join(" ")
      ].join(" ").toLowerCase();
      let score = 0;
      for (const term of queryTerms) {
        if (haystack.includes(term)) score += 1;
        if (record.title.toLowerCase().includes(term)) score += 2;
      }
      if (query.surfaceContext && record.surfaceId === query.surfaceContext) score += 100;
      if (query.queryType === "source_rights_question" && record.rights?.label) score += 4;
      if (query.queryType === "region_period_recommendation" && record.region) score += 2;
      if (query.queryType === "first_earliest_claim" && record.dateStart) score += Math.max(0, 4 - record.dateStart / 1000);
      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.record.dateStart || 9999) - (b.record.dateStart || 9999))
    .map((item) => item.record);

  if (exact && !ranked.some((record) => record.surfaceId === exact.surfaceId)) ranked.unshift(exact);
  return ranked.slice(0, limit);
}

function mentionedRecords(records, query) {
  const text = query.question.toLowerCase();
  return records.filter((record) => {
    const id = record.surfaceId || record.record_id || "";
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

function routeRecords(records, query, limit = 3) {
  return records
    .filter((record) => recordMatchesRegion(record, query.question) && recordMatchesPeriod(record, query.question))
    .filter((record) => record.title && record.source?.url && record.region && record.dateText)
    .sort((a, b) => (a.dateStart || 9999) - (b.dateStart || 9999))
    .slice(0, limit);
}

function contextRecords(records, query, limit = 3) {
  const active = query.surfaceContext ? records.find((record) => record.surfaceId === query.surfaceContext) : null;
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

function toGoldRecord(record) {
  const raw = [
    record.text?.descriptionSummary,
    record.text?.sourceDescription,
    record.text?.sourceNotes,
    record.text?.sourceSubjects,
    record.text?.historicalContextNote,
    record.text?.classificationRationale,
    record.text?.uncertaintyNote
  ].filter(Boolean).join(" ");
  const compact = [
    record.text?.sourceDescription,
    record.text?.sourceNotes,
    record.text?.uncertaintyNote
  ].filter(Boolean).join(" ");
  return {
    record_id: record.surfaceId,
    object_id: record.sourceRecordId,
    title: record.title,
    creator: record.creator,
    date_text: record.dateText,
    date_start: record.dateStart,
    date_end: record.dateEnd,
    region: record.region,
    object_type: record.objectType,
    medium: record.medium,
    source: {
      name: record.source.name,
      url: record.source.url,
      access_date: record.source.accessDate
    },
    rights: {
      state: record.rights.state,
      display_policy: record.rights.displayPolicy,
      label: record.rights.label
    },
    rights_interpretation: rightsInterpretationFor(record),
    image_state: {
      code: record.imageState.code,
      display_mode: record.imageState.displayMode,
      has_image_frame: record.imageState.hasImageFrame,
      model_image_eligible: record.imageState.modelImageEligible
    },
    topology: {
      surface_type: record.topology.surfaceType,
      publication_role: record.topology.publicationRole,
      folder_titles: record.topology.folderTitles,
      historical_node_ids: record.topology.historicalNodeIds,
      movement_ids: record.topology.movementIds
    },
    notes: {
      raw,
      compact,
      raw_note_hash: hashText(raw),
      packet_version: "packet.v0"
    }
  };
}

function toGoldQuery(query, label) {
  return {
    query_id: query.queryId,
    query_text: query.question,
    intent: query.queryType,
    active_object_id: query.surfaceContext,
    expected_lane: label.gold_lane,
    requires_evidence: Boolean(query.requiresEvidence)
  };
}

function toGoldLabel(query, records) {
  const candidatesByIntent = {
    comparison: () => mentionedRecords(records, query).slice(0, 2),
    method_process_question: () => [methodRecord()],
    more_context: () => contextRecords(records, query, 3),
    region_period_recommendation: () => routeRecords(records, query, 3)
  };
  const firstClaimNeedsRefusal = query.queryType === "first_earliest_claim";
  const selectedRecords = candidatesByIntent[query.queryType]
    ? candidatesByIntent[query.queryType]()
    : query.surfaceContext
      ? records.filter((record) => record.surfaceId === query.surfaceContext)
      : rankRecords(records, query, query.queryType === "first_earliest_claim" ? 3 : 2);
  const routeOrComparisonNeedsRefusal = ["comparison", "region_period_recommendation", "more_context"].includes(query.queryType)
    && selectedRecords.length < (query.queryType === "more_context" ? 1 : 2);
  const refusalExpected = query.queryType === "no_evidence_refusal" || firstClaimNeedsRefusal || routeOrComparisonNeedsRefusal;
  const lane = mapLane(query, refusalExpected);
  const goldEvidenceIds = refusalExpected
    ? []
    : selectedRecords.map((record) => record.record_id || record.surfaceId);
  const requiredFields = requiredFieldsFor(query, refusalExpected);
  return {
    query_id: query.queryId,
    intent: query.queryType,
    gold_lane: lane,
    sufficient_context: !refusalExpected && (query.requiresEvidence ? goldEvidenceIds.length > 0 : true),
    refusal_expected: refusalExpected || query.question.toLowerCase().includes("upgrade the rights state"),
    gold_evidence_ids: goldEvidenceIds,
    required_fields: requiredFields,
    must_not_invent_fields: mustNotInventFor(query),
    allowed_guidance: !refusalExpected,
    gold_answer_slots: requiredFields.filter((field) => !["method_context", "topology"].includes(field)),
    review_state: "seed_auto_needs_human_review",
    notes: firstClaimNeedsRefusal
      ? "First/earliest claims require chronology proof not present in the seed fixture; correct behavior is refusal or request for a narrower chronology packet."
      : refusalExpected
        ? "Insufficient evidence in the seed fixture; correct behavior is refusal or request for narrower context."
      : "Seed label generated from fixture/query metadata; review before paper claims."
  };
}

const fixture = readJson(fixturePath);
const queries = readJson(queryPath).queries;
const records = [...fixture.records.map(toGoldRecord), methodRecord()];
const labRecords = [...fixture.records, methodRecord()];
const labels = queries.map((query) => toGoldLabel(query, labRecords));
const goldQueries = queries.map((query, index) => toGoldQuery(query, labels[index]));

writeJsonl(path.join(outDir, "records.jsonl"), records);
writeJsonl(path.join(outDir, "queries.jsonl"), goldQueries);
writeJsonl(path.join(outDir, "labels.jsonl"), labels);

console.log(JSON.stringify({
  records: records.length,
  queries: goldQueries.length,
  labels: labels.length,
  outDir: path.relative(repoRoot, outDir)
}, null, 2));
