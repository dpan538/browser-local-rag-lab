export const KNOWN_INTENTS = [
  "archive_orientation",
  "casual_archive_help",
  "comparison",
  "current_object_explanation",
  "first_earliest_claim",
  "method_process_question",
  "more_context",
  "no_evidence_refusal",
  "region_period_recommendation",
  "source_rights_question"
];

export const KNOWN_LANES = [
  "fast_answer",
  "help",
  "refusal_more_context",
  "research_answer",
  "source_rights"
];

export const INTENT_LANE_MAP = {
  archive_orientation: ["help"],
  casual_archive_help: ["help"],
  comparison: ["research_answer", "refusal_more_context"],
  current_object_explanation: ["fast_answer", "refusal_more_context"],
  first_earliest_claim: ["research_answer", "refusal_more_context"],
  method_process_question: ["research_answer", "refusal_more_context"],
  more_context: ["research_answer", "refusal_more_context"],
  no_evidence_refusal: ["refusal_more_context"],
  region_period_recommendation: ["research_answer", "refusal_more_context"],
  source_rights_question: ["source_rights", "refusal_more_context"]
};

export const MANDATORY_REFUSAL_INTENTS = [
  "no_evidence_refusal"
];

export const CHRONOLOGY_PROOF_INTENTS = [
  "first_earliest_claim"
];

export const METHOD_REVIEW_INTENTS = [];

export const BASE_MUST_NOT_INVENT_FIELDS = [
  "creator",
  "date",
  "rights",
  "source",
  "title"
];

export const INTENT_SPECIFIC_MUST_NOT_INVENT_FIELDS = {
  first_earliest_claim: ["first_or_earliest_claim"],
  source_rights_question: ["public_domain_status", "reuse_permission"]
};

export const REQUIRED_FIELDS_BY_INTENT = {
  archive_orientation: ["topology"],
  casual_archive_help: ["topology"],
  comparison: ["record_id", "title", "source"],
  current_object_explanation: ["record_id", "title", "date_text", "region", "source"],
  first_earliest_claim: ["record_id", "title", "date_text", "source", "first_or_earliest_claim"],
  method_process_question: ["method_context"],
  more_context: ["record_id", "title", "date_text", "region", "source", "topology"],
  no_evidence_refusal: [],
  region_period_recommendation: ["record_id", "title", "date_text", "region", "source"],
  source_rights_question: ["record_id", "title", "source", "rights", "image_state", "reuse_permission", "public_domain_status"]
};

export const STABLE_RULE_REQUIRED_FIELDS = {
  archive_orientation: ["topology"],
  casual_archive_help: ["topology"],
  comparison: ["record_id", "title", "source"],
  current_object_explanation: ["record_id", "title", "date_text", "region", "source"],
  first_earliest_claim: ["record_id", "title", "date_text", "source", "first_or_earliest_claim"],
  method_process_question: ["method_context"],
  more_context: ["record_id", "title", "date_text", "region", "source", "topology"],
  no_evidence_refusal: [],
  region_period_recommendation: ["record_id", "title", "date_text", "region", "source"],
  source_rights_question: ["record_id", "title", "source", "rights", "image_state", "reuse_permission", "public_domain_status"]
};

export const ANOMALY_THRESHOLDS = {
  evidence_overuse_warn_ratio: 0.3,
  evidence_overuse_fail_ratio: 0.5
};

export function stableRuleConfigFindings() {
  const findings = [];
  for (const [intent, requiredFields] of Object.entries(REQUIRED_FIELDS_BY_INTENT)) {
    const stableFields = STABLE_RULE_REQUIRED_FIELDS[intent];
    if (!stableFields) {
      findings.push({
        severity: "fail",
        code: "R001_missing_stable_rule",
        detail: intent
      });
      continue;
    }
    const missing = requiredFields.filter((field) => !stableFields.includes(field));
    if (missing.length > 0) {
      findings.push({
        severity: "fail",
        code: "R002_stable_rule_required_field_gap",
        detail: `${intent}: ${missing.join("|")}`
      });
    }
  }
  return findings;
}

export const STRUCTURAL_SCHEMA = {
  query: {
    query_id: "string",
    query_text: "string",
    intent: "string",
    expected_lane: "string",
    requires_evidence: "boolean"
  },
  label: {
    query_id: "string",
    intent: "string",
    gold_lane: "string",
    sufficient_context: "boolean",
    refusal_expected: "boolean",
    gold_evidence_ids: "array",
    required_fields: "array",
    must_not_invent_fields: "array",
    review_state: "string"
  }
};

export function expectedMustNotInventFields(intent) {
  return [
    ...new Set([
      ...BASE_MUST_NOT_INVENT_FIELDS,
      ...(INTENT_SPECIFIC_MUST_NOT_INVENT_FIELDS[intent] || [])
    ])
  ].sort();
}

export function intentHintFindings(queryText, labeledIntent) {
  const text = queryText.toLowerCase();
  const checks = {
    archive_orientation: ["archive", "page", "organized", "start", "use"],
    casual_archive_help: ["lost", "help", "next step", "unsupported"],
    comparison: ["compare", "differ", "difference", "versus", " vs "],
    current_object_explanation: ["what is happening", "explain", "sources", "surf-"],
    first_earliest_claim: ["first", "earliest", "oldest", "original"],
    method_process_question: ["evidence", "assistant", "general chatbot", "decide"],
    more_context: ["more context", "related items", "after this", "around this"],
    no_evidence_refusal: ["fictional", "absent", "upgrade the rights", "directly influenced"],
    region_period_recommendation: ["route", "recommend", "region", "century"],
    source_rights_question: ["rights", "reuse", "reused", "source archive", "public domain"]
  };
  const needles = checks[labeledIntent] || [];
  if (needles.length === 0) return [];
  if (needles.some((needle) => text.includes(needle))) return [];
  return [{
    severity: "warn",
    code: "C010_intent_query_hint_mismatch",
    detail: `query text does not contain heuristic markers for ${labeledIntent}`
  }];
}
