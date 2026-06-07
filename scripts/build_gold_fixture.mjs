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

function mapLane(query) {
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

function requiredFieldsFor(query) {
  const shared = ["record_id", "title"];
  const byIntent = {
    archive_orientation: ["topology"],
    casual_archive_help: ["topology"],
    current_object_explanation: [...shared, "date_text", "region", "source"],
    source_rights_question: [...shared, "source", "rights", "image_state"],
    first_earliest_claim: [...shared, "date_text", "source"],
    comparison: [...shared, "source"],
    region_period_recommendation: [...shared, "date_text", "region", "source"],
    method_process_question: ["method_context"],
    more_context: [...shared, "topology"],
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

function toGoldQuery(query) {
  return {
    query_id: query.queryId,
    query_text: query.question,
    intent: query.queryType,
    active_object_id: query.surfaceContext,
    expected_lane: mapLane(query),
    requires_evidence: Boolean(query.requiresEvidence)
  };
}

function toGoldLabel(query, records) {
  const lane = mapLane(query);
  const refusalExpected = query.queryType === "no_evidence_refusal";
  const contextRecords = query.surfaceContext
    ? records.filter((record) => record.surfaceId === query.surfaceContext)
    : rankRecords(records, query, query.queryType === "first_earliest_claim" ? 3 : 2);
  const goldEvidenceIds = refusalExpected || query.queryType === "method_process_question"
    ? []
    : contextRecords.map((record) => record.surfaceId);
  const firstClaimNeedsHuman = query.queryType === "first_earliest_claim";
  return {
    query_id: query.queryId,
    intent: query.queryType,
    gold_lane: lane,
    sufficient_context: !refusalExpected && !firstClaimNeedsHuman && (query.requiresEvidence ? goldEvidenceIds.length > 0 : true),
    refusal_expected: refusalExpected || query.question.toLowerCase().includes("upgrade the rights state") || firstClaimNeedsHuman,
    gold_evidence_ids: goldEvidenceIds,
    required_fields: requiredFieldsFor(query),
    must_not_invent_fields: mustNotInventFor(query),
    allowed_guidance: !refusalExpected,
    gold_answer_slots: requiredFieldsFor(query).filter((field) => !["method_context", "topology"].includes(field)),
    review_state: "seed_auto_needs_human_review",
    notes: firstClaimNeedsHuman
      ? "Chronology or first/earliest claims require human review before they are answerable."
      : "Seed label generated from fixture/query metadata; review before paper claims."
  };
}

const fixture = readJson(fixturePath);
const queries = readJson(queryPath).queries;
const records = fixture.records.map(toGoldRecord);
const goldQueries = queries.map(toGoldQuery);
const labels = queries.map((query) => toGoldLabel(query, fixture.records));

writeJsonl(path.join(outDir, "records.jsonl"), records);
writeJsonl(path.join(outDir, "queries.jsonl"), goldQueries);
writeJsonl(path.join(outDir, "labels.jsonl"), labels);

console.log(JSON.stringify({
  records: records.length,
  queries: goldQueries.length,
  labels: labels.length,
  outDir: path.relative(repoRoot, outDir)
}, null, 2));
