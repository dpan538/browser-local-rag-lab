#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  INTENT_LANE_MAP,
  REQUIRED_FIELDS_BY_INTENT,
  expectedMustNotInventFields
} from "./audit_rules.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultRecordsPath = path.join(repoRoot, "fixtures/gold/records.jsonl");

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = args[index + 1]?.startsWith("--") ? true : args[index + 1];
    parsed[key] = value === undefined ? true : value;
    if (value !== true) index += 1;
  }
  return parsed;
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function recordHasField(record, field) {
  const valuesByField = {
    record_id: [record.record_id],
    title: [record.title],
    creator: [record.creator],
    date: [record.date_text, record.date_start, record.date_end],
    date_text: [record.date_text],
    region: [record.region],
    source: [record.source?.name, record.source?.url],
    rights: [record.rights?.state, record.rights?.label],
    image_state: [record.image_state?.code, record.image_state?.display_mode],
    reuse_permission: [record.rights_interpretation?.reuse_permission],
    public_domain_status: [record.rights_interpretation?.public_domain_status],
    first_or_earliest_claim: [record.first_or_earliest_claim],
    topology: [
      record.topology?.surface_type,
      record.topology?.publication_role,
      ...(record.topology?.folder_titles || [])
    ],
    method_context: Object.values(record.method_context || {})
  };
  return (valuesByField[field] || [record[field]]).flat().some(hasValue);
}

function chooseLane(intent, sufficient) {
  const lanes = INTENT_LANE_MAP[intent] || [];
  if (!sufficient) return lanes.includes("refusal_more_context") ? "refusal_more_context" : lanes[0];
  if (intent === "current_object_explanation") return "fast_answer";
  if (intent === "source_rights_question") return "source_rights";
  if (lanes.includes("research_answer")) return "research_answer";
  return lanes[0];
}

export function suggestLabel({ queryId, queryText, intent, evidenceIds, recordsPath = defaultRecordsPath }) {
  if (!queryId || !queryText || !intent) {
    throw new Error("queryId, queryText, and intent are required");
  }
  if (!INTENT_LANE_MAP[intent]) throw new Error(`Unknown intent: ${intent}`);

  const records = new Map(readJsonl(recordsPath).map((record) => [record.record_id, record]));
  const goldEvidenceIds = evidenceIds || [];
  const evidenceRecords = goldEvidenceIds.map((id) => records.get(id)).filter(Boolean);
  const requiredFields = REQUIRED_FIELDS_BY_INTENT[intent] || [];
  const sufficient = requiredFields.length === 0
    ? goldEvidenceIds.length === 0
    : evidenceRecords.some((record) => requiredFields.every((field) => recordHasField(record, field)));
  const refusalExpected = intent === "no_evidence_refusal" ? true : !sufficient;
  const finalSufficient = intent === "no_evidence_refusal" ? false : sufficient;

  return {
    query: {
      query_id: queryId,
      query_text: queryText,
      intent,
      active_object_id: null,
      expected_lane: chooseLane(intent, finalSufficient),
      requires_evidence: requiredFields.length > 0
    },
    label: {
      query_id: queryId,
      intent,
      gold_lane: chooseLane(intent, finalSufficient),
      sufficient_context: finalSufficient,
      refusal_expected: refusalExpected,
      gold_evidence_ids: goldEvidenceIds,
      required_fields: finalSufficient ? requiredFields : [],
      must_not_invent_fields: expectedMustNotInventFields(intent),
      allowed_guidance: !refusalExpected,
      gold_answer_slots: finalSufficient ? requiredFields : [],
      review_state: "suggested_needs_human_review",
      notes: "Suggested label scaffold only. Human review and full audit are required before adding to the benchmark."
    },
    diagnostics: {
      missing_evidence_ids: goldEvidenceIds.filter((id) => !records.has(id)),
      sufficient_by_required_fields: sufficient,
      required_fields: requiredFields
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  if (!args["query-id"] || !args["query-text"] || !args.intent) {
    console.error("Usage: node scripts/suggest_label.mjs --query-id BQ31 --query-text \"...\" --intent current_object_explanation --evidence SURF-1,SURF-2");
    process.exit(1);
  }
  try {
    const suggestion = suggestLabel({
      queryId: args["query-id"],
      queryText: args["query-text"],
      intent: args.intent,
      evidenceIds: String(args.evidence || "").split(",").map((id) => id.trim()).filter(Boolean)
    });
    console.log(JSON.stringify(suggestion, null, 2));
  } catch (error) {
    console.error(error?.message || String(error));
    process.exit(1);
  }
}
