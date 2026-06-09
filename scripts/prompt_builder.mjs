const REFUSAL_PHRASE = "I cannot answer this question because the evidence is insufficient.";

export function mandatoryRefusalPhrase() {
  return REFUSAL_PHRASE;
}

export function clip(value, max = 420) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

export function fieldValue(record = {}, field, max = 420) {
  const values = {
    record_id: record.record_id,
    title: record.title,
    creator: record.creator,
    date_text: record.date_text,
    date: record.date_text,
    region: record.region,
    source: `${record.source?.name || "not available"} / ${record.source?.url || "not available"}`,
    rights: record.rights?.label,
    image_state: `${record.image_state?.code || "not available"} / ${record.image_state?.display_mode || "not available"}`,
    reuse_permission: record.rights_interpretation?.reuse_permission,
    public_domain_status: record.rights_interpretation?.public_domain_status,
    topology: [
      record.topology?.surface_type,
      record.topology?.publication_role,
      ...(record.topology?.folder_titles || [])
    ].filter(Boolean).join(" / "),
    method_context: Object.values(record.method_context || {}).join(" "),
    first_or_earliest_claim: record.first_or_earliest_claim
  };
  return clip(values[field] || "not available", max);
}

function list(value) {
  if (!value) return "not available";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "not available";
  return String(value);
}

export function fieldsForLabel(label = {}) {
  if (label.refusal_expected) return [];
  if (label.required_fields?.length) return label.required_fields;
  if (label.intent === "source_rights_question") {
    return ["record_id", "title", "source", "rights", "image_state", "reuse_permission", "public_domain_status"];
  }
  return ["record_id", "title", "source"];
}

export function evidenceTagBlock(records = [], fields = []) {
  const uniqueFields = [...new Set(fields)];
  return [
    "EVIDENCE TAGS:",
    ...uniqueFields.map((field) => {
      const values = [
        ...new Set(
          records
            .map((record) => fieldValue(record, field))
            .filter((value) => value && value !== "not available")
        )
      ];
      return `${field}: ${values.length ? values.join(" | ") : "none"}`;
    })
  ].join("\n");
}

export function sourceRightsBlock(record = {}) {
  return [
    `record_id: ${fieldValue(record, "record_id")}`,
    `title: ${fieldValue(record, "title")}`,
    `source: ${fieldValue(record, "source")}`,
    `RIGHTS: ${fieldValue(record, "rights")}`,
    `image_state: ${fieldValue(record, "image_state")}`,
    `REUSE: ${fieldValue(record, "reuse_permission")}`,
    `PUBLIC_DOMAIN: ${fieldValue(record, "public_domain_status")}`,
    "CAVEAT: Verify the source page before reuse; this experiment does not grant rights."
  ].join("\n");
}

function isEvidenceCompress(options = {}) {
  return options.promptVariant === "r03_v2_evidence_compress";
}

function isV31EvidencePruneTagInjection(options = {}) {
  return options.promptVariant === "r03_v31_evidence_prune_tag_injection";
}

function isV32GuardedProse(options = {}) {
  return options.promptVariant === "r03_v32_guarded_prose_budgeted_generation";
}

function isPrunedTagInjection(options = {}) {
  return isV31EvidencePruneTagInjection(options) || isV32GuardedProse(options);
}

function promptFieldValue(record, field, options = {}) {
  if (!isEvidenceCompress(options) && !isPrunedTagInjection(options)) return fieldValue(record, field);
  const maxByField = {
    source: 180,
    topology: 180,
    method_context: 220,
    image_state: 140,
    rights: 140,
    reuse_permission: 140,
    public_domain_status: 140
  };
  return fieldValue(record, field, maxByField[field] || 220);
}

function reorderEvidence(records = [], label = {}) {
  const primaryId = label.primary_evidence_id || label.gold_evidence_ids?.[0];
  if (!primaryId) return records;
  const primaryRecord = records.find((record) => record.record_id === primaryId);
  if (!primaryRecord) return records;
  return [
    primaryRecord,
    ...records
      .filter((record) => record.record_id !== primaryId)
      .sort((left, right) => String(left.record_id || "").localeCompare(String(right.record_id || "")))
  ];
}

function summaryFieldsForV31(label = {}, records = []) {
  const required = fieldsForLabel(label);
  const safeRequired = required.filter((field) => {
    return !["record_id", "source", "rights", "image_state", "reuse_permission", "public_domain_status"].includes(field);
  });
  const contextualFields = [];
  if (records.some((record) => record?.date_text)) contextualFields.push("date_text");
  if (records.some((record) => record?.region)) contextualFields.push("region");
  if (["archive_orientation", "casual_archive_help", "more_context"].includes(label.intent)) contextualFields.push("topology");
  if (label.intent === "method_process_question") contextualFields.push("method_context");
  if (label.intent === "first_earliest_claim") contextualFields.push("first_or_earliest_claim");
  return [...new Set(["title", ...safeRequired, ...contextualFields])];
}

function modelEvidenceForV31(records = [], label = {}) {
  const reordered = reorderEvidence(records, label);
  if (label.intent === "current_object_explanation") return reordered.slice(0, 1);
  return reordered;
}

function valueOnlyRecordLine(record, fields, options = {}) {
  return fields.map((field) => promptFieldValue(record, field, options)).join(" | ");
}

function valueOnlyEvidenceSummary(records = [], fields = [], options = {}) {
  return records.map((record, index) => `Record ${index + 1}: ${valueOnlyRecordLine(record, fields, options)}`).join("\n");
}

function uniqueValues(records = [], field, max = 160) {
  return [
    ...new Set(records.map((record) => fieldValue(record, field, max)).filter((value) => value && value !== "not available"))
  ];
}

function compactList(values = [], limit = 2) {
  const shown = values.slice(0, limit);
  if (shown.length === 0) return "the listed evidence";
  return shown.length < values.length ? `${shown.join("; ")} and related records` : shown.join("; ");
}

function recordSummary(record, fields, options = {}) {
  const compactNoteMax = isEvidenceCompress(options) ? 90 : 360;
  return [
    "Record:",
    ...fields.map((field) => `${field}: ${promptFieldValue(record, field, options)}`),
    `compact_note: ${clip(record.notes?.compact, compactNoteMax)}`
  ].join("\n");
}

function isLengthControl(options = {}) {
  return options.promptVariant === "r03_v1_length_control";
}

function lengthControlLine(label = {}) {
  if (["archive_orientation", "casual_archive_help"].includes(label.intent)) {
    return "Keep the generated answer body under 45 words.";
  }
  if (label.intent === "current_object_explanation") {
    return "Keep the generated answer body under 55 words.";
  }
  if (label.intent === "method_process_question") {
    return "Keep the generated answer body under 65 words.";
  }
  if (["comparison", "region_period_recommendation", "more_context"].includes(label.intent)) {
    return "Keep the generated answer body under 95 words.";
  }
  return "Keep the generated answer body concise.";
}

function guardedLengthLine(label = {}) {
  if (["archive_orientation", "casual_archive_help"].includes(label.intent)) {
    return "Keep the answer body to 35-55 words.";
  }
  if (label.intent === "current_object_explanation") {
    return "Keep the answer body to 35-55 words.";
  }
  if (label.intent === "method_process_question") {
    return "Keep the answer body to 55-80 words.";
  }
  if (label.intent === "comparison") {
    return "Keep the answer body to 75-105 words.";
  }
  if (["region_period_recommendation", "more_context"].includes(label.intent)) {
    return "Keep the answer body to 80-120 words.";
  }
  return "Keep the answer body concise.";
}

function guardedProseLines(label = {}) {
  const firstClaimLine = label.intent === "first_earliest_claim"
    ? "Only mention first, earliest, or original if the evidence values explicitly include chronology proof."
    : "Do not use the words first, earliest, or original for historical priority claims.";
  return [
    "Begin the answer body with: Based on these records,",
    "Use cautious, source-limited language.",
    "Do not use absolute words such as all, every, never, always, certainly, definitely, or proves.",
    "Do not use inference words such as therefore, thus, implies, consequently, or as a result.",
    firstClaimLine
  ];
}

function orientationEvidenceSummary(records) {
  const folderTitles = [...new Set(records.flatMap((record) => record.topology?.folder_titles || []))];
  const surfaceTypes = [...new Set(records.map((record) => record.topology?.surface_type).filter(Boolean))];
  const publicationRoles = [...new Set(records.map((record) => record.topology?.publication_role).filter(Boolean))];
  const sourceNames = [...new Set(records.map((record) => record.source?.name).filter(Boolean))];
  const rightsStates = [...new Set(records.map((record) => record.rights?.state).filter(Boolean))];
  const imageStates = [...new Set(records.map((record) => record.image_state?.code).filter(Boolean))];
  return [
    "- This is a source-linked research archive for graphic design and visual communication records.",
    `- It organizes records through folders/topology: ${list(folderTitles)}.`,
    `- Surface types in the packet: ${list(surfaceTypes)}.`,
    `- Publication roles in the packet: ${list(publicationRoles)}.`,
    `- Source families represented: ${list(sourceNames)}.`,
    `- Rights states represented: ${list(rightsStates)}.`,
    `- Image-state codes represented: ${list(imageStates)}.`
  ].join("\n");
}

export function promptModeForLabel(label = {}) {
  if (label.refusal_expected) return "hard_refusal";
  if (label.intent === "source_rights_question") return "source_rights_strict";
  if (["archive_orientation", "casual_archive_help"].includes(label.intent)) return "orientation_structure_with_tags";
  return "answerable_with_evidence_tags";
}

function buildHardRefusalPrompt(packet) {
  return [
    "You are an archival assistant with strict evidence rules.",
    "The evidence for this query is intentionally empty or insufficient.",
    "",
    `QUERY: ${packet.query.query_text}`,
    "",
    "INSTRUCTION: You MUST answer with exactly the following sentence and nothing else:",
    `"${REFUSAL_PHRASE}"`,
    "",
    "Do not explain. Do not provide any factual information. Do not speculate."
  ].join("\n");
}

function buildSourceRightsPrompt(packet) {
  const record = packet.evidence[0] || {};
  return [
    "You are a rights-reporting assistant.",
    "Use ONLY the exact evidence below. Do not interpret, summarize, or shorten field values.",
    "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
    "",
    "EVIDENCE:",
    `record_id: ${fieldValue(record, "record_id")}`,
    `title: ${fieldValue(record, "title")}`,
    `source: ${fieldValue(record, "source")}`,
    `rights: ${fieldValue(record, "rights")}`,
    `image_state: ${fieldValue(record, "image_state")}`,
    `reuse_permission: ${fieldValue(record, "reuse_permission")}`,
    `public_domain_status: ${fieldValue(record, "public_domain_status")}`,
    "",
    `QUERY: ${packet.query.query_text}`,
    "",
    "OUTPUT FORMAT:",
    "Respond with exactly these lines and no other text:",
    sourceRightsBlock(record)
  ].join("\n");
}

function buildOrientationPrompt(packet, options = {}) {
  if (isPrunedTagInjection(options)) {
    const records = reorderEvidence(packet.evidence, packet.label);
    return [
      "You are running a research-only browser-local Qwen RAG experiment.",
      "Generated text is not archive evidence.",
      "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
      "",
      `Question: ${packet.query.query_text}`,
      `Intent: ${packet.label.intent}`,
      "Required behavior: answer about the archive view as a whole, not about one object.",
      isV32GuardedProse(options) ? guardedLengthLine(packet.label) : "Keep the generated answer body under 45 words.",
      ...(isV32GuardedProse(options) ? guardedProseLines(packet.label) : []),
      "",
      "Archive facts you may use:",
      orientationEvidenceSummary(records),
      "",
      "OUTPUT FORMAT:",
      "Write only the concise natural-language answer body.",
      "Do not write the official evidence tag block or field labels; the browser lab appends exact tags after generation.",
      "Do not name a single record as the archive."
    ].join("\n");
  }

  if (isLengthControl(options)) {
    return [
      "You are running a research-only browser-local Qwen RAG experiment.",
      "Generated text is not archive evidence.",
      "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
      "",
      `Question: ${packet.query.query_text}`,
      `Intent: ${packet.label.intent}`,
      "Required behavior: answer about the archive view as a whole, not about one object.",
      lengthControlLine(packet.label),
      "",
      "Facts you may use:",
      orientationEvidenceSummary(packet.evidence),
      "",
      "OUTPUT FORMAT:",
      "Write only the concise answer body.",
      "Do not write EVIDENCE TAGS; the browser lab appends exact tags after generation.",
      "Do not name a single record as the archive."
    ].join("\n");
  }

  return [
    "You are running a research-only browser-local Qwen RAG experiment.",
    "Generated text is not archive evidence.",
    "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
    "Never write the literal words EVIDENCE_SUMMARY, EVIDENCE_PACKET, CONTRACT, or RESPONSE_PLAN.",
    "",
    `Question: ${packet.query.query_text}`,
    `Intent: ${packet.label.intent}`,
    "Required behavior: answer about the archive view as a whole, not about one object.",
    "",
    "Facts you may use:",
    orientationEvidenceSummary(packet.evidence),
    "",
    "Write exactly three short bullet points:",
    "- what the archive is for;",
    "- how the view is organized;",
    "- one concrete next step for the user.",
    "",
    "Do not name a single record as the archive.",
    "",
    "After the three bullets, append this exact field block. Do not skip it.",
    evidenceTagBlock(packet.evidence, fieldsForLabel(packet.label))
  ].join("\n");
}

function buildAnswerablePrompt(packet, options = {}) {
  const required = fieldsForLabel(packet.label);
  if (isPrunedTagInjection(options)) {
    const records = modelEvidenceForV31(packet.evidence, packet.label);
    const fields = summaryFieldsForV31(packet.label, records);
    return [
      "You are a cautious archive assistant in a browser-local research experiment.",
      "Generated text is not archive evidence.",
      "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
      "Use only the evidence values below. If the values cannot support the query, keep the answer narrow.",
      "Do not infer dates from record IDs, object IDs, source page numbers, or URL numbers. Use date_text values only for dates.",
      `Question: ${packet.query.query_text}`,
      `Intent: ${packet.label.intent}`,
      isV32GuardedProse(options) ? guardedLengthLine(packet.label) : lengthControlLine(packet.label),
      ...(isV32GuardedProse(options) ? guardedProseLines(packet.label) : []),
      packet.label.intent === "current_object_explanation" ? "For this intent, describe Record 1 only; related records are not the current object." : "",
      "",
      `Evidence value order: ${fields.join(" | ")}`,
      "Primary record is listed first when a primary evidence id is available.",
      valueOnlyEvidenceSummary(records, fields, options),
      "",
      "OUTPUT FORMAT:",
      "Write only the concise natural-language answer body.",
      "Do not write the official evidence tag block, field labels, or key-value blocks; the browser lab appends exact tags after generation.",
      "Do not restate long source URLs unless they are necessary for the prose."
    ].join("\n");
  }

  if (isLengthControl(options)) {
    return [
      "You are a cautious archive assistant in a browser-local research experiment.",
      "Generated text is not archive evidence.",
      "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
      "Use only the evidence fields below. If a required field is not available, say the evidence is insufficient.",
      `Question: ${packet.query.query_text}`,
      `Intent: ${packet.label.intent}`,
      `Required fields available for browser-appended EVIDENCE TAGS: ${required.join(", ")}`,
      lengthControlLine(packet.label),
      "",
      "Evidence fields:",
      ...packet.evidence.map((record) => recordSummary(record, required, options)),
      "",
      "OUTPUT FORMAT:",
      "Write only the concise answer body.",
      "Do not write EVIDENCE TAGS; the browser lab appends exact tags after generation.",
      "Do not restate long source URLs unless they are needed in the prose."
    ].join("\n");
  }

  return [
    "You are a cautious archive assistant in a browser-local research experiment.",
    "Generated text is not archive evidence.",
    "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
    "Use only the evidence fields below. If a required field is not available, say the evidence is insufficient.",
    `Question: ${packet.query.query_text}`,
    `Intent: ${packet.label.intent}`,
    `Required fields to cite visibly: ${required.join(", ")}`,
    "",
    "Evidence fields:",
    ...packet.evidence.map((record) => recordSummary(record, required, options)),
    "",
    "OUTPUT FORMAT:",
    "1. Write a brief answer based only on the evidence fields.",
    "2. End with the exact EVIDENCE TAGS block below.",
    "3. Do not skip, rename, paraphrase, or reorder fields in the tag block.",
    "",
    evidenceTagBlock(packet.evidence, required)
  ].join("\n");
}

function normalizeForRefusalCheck(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function bodyLooksLikeRefusal(text) {
  const normalized = normalizeForRefusalCheck(text);
  return [
    "not enough evidence",
    "insufficient evidence",
    "cannot determine",
    "can not determine",
    "cannot answer",
    "can not answer",
    "need more context",
    "not supported by the evidence",
    "i do not have evidence",
    "refuse the request",
    "assistant to refuse",
    "should refuse",
    "must refuse"
  ].some((phrase) => normalized.includes(phrase));
}

function packetDateTokens(packet = {}) {
  const dateText = packet.evidence
    .flatMap((record) => [record?.date_text, record?.title, record?.notes?.compact])
    .filter(Boolean)
    .join(" ");
  return new Set((dateText.match(/\b(?:circa\s+)?\d{4}(?:s|-\d{2}(?:-\d{2})?)?\b/gi) || [])
    .map((value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()));
}

function dateTokenIsSupported(value, knownDates) {
  const normalized = String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (knownDates.has(normalized)) return true;
  const yearMatch = normalized.match(/\b(\d{4})s?\b/);
  if (!yearMatch) return false;
  const year = Number(yearMatch[1]);
  if (!Number.isFinite(year)) return false;
  if (normalized.endsWith("s")) {
    const decadeStart = Math.floor(year / 10) * 10;
    return [...knownDates].some((known) => {
      const knownYear = Number(known.match(/\b(\d{4})\b/)?.[1]);
      return Number.isFinite(knownYear) && knownYear >= decadeStart && knownYear < decadeStart + 10;
    });
  }
  return false;
}

function bodyContainsUnsupportedDates(packet, text) {
  const knownDates = packetDateTokens(packet);
  const dates = String(text || "").match(/\b(?:circa\s+)?\d{4}(?:s|-\d{2}(?:-\d{2})?)?\b/gi) || [];
  return dates.some((date) => !dateTokenIsSupported(date, knownDates));
}

function bodyLooksLikePromptEcho(text) {
  return [
    /evidence value order/i,
    /primary record is listed first/i,
    /output:\s*write/i,
    /do not write the official/i,
    /browser lab appends/i,
    /generate concise answer/i,
    /^record\s+\d+\s*:/im,
    /explain record \d+ using only/i
  ].some((pattern) => pattern.test(String(text || "")));
}

function bodyLooksUnsafe(packet, text) {
  return bodyLooksLikePromptEcho(text) || bodyContainsUnsupportedDates(packet, text);
}

function deterministicAnswerBody(packet) {
  const titles = uniqueValues(packet.evidence, "title", 140);
  const dates = uniqueValues(packet.evidence, "date_text", 80);
  const regions = uniqueValues(packet.evidence, "region", 120);
  if (packet.label.intent === "method_process_question") {
    return "The archive treats source-linked metadata, compact text, source, rights, image-state, and topology fields as retrieval evidence; generated AI text remains experimental and cannot become archive evidence.";
  }
  if (packet.label.intent === "current_object_explanation") {
    return `This record is represented by ${titles[0] || "the listed title"}${dates[0] ? `, dated ${dates[0]}` : ""}${regions[0] ? `, with region ${regions[0]}` : ""}.`;
  }
  if (packet.label.intent === "comparison") {
    return `Compare the source-linked records ${compactList(titles, 2)} using the exact evidence tags below.`;
  }
  if (packet.label.intent === "region_period_recommendation") {
    return `Use ${compactList(titles, 2)} as a source-backed route through ${compactList(regions, 2)}${dates.length ? ` around ${compactList(dates, 2)}` : ""}.`;
  }
  if (packet.label.intent === "more_context") {
    return `Use ${titles[0] || "the primary record"} with the related records in the evidence tags below for context.`;
  }
  if (["archive_orientation", "casual_archive_help"].includes(packet.label.intent)) {
    return "This archive view organizes source-linked records by topology, folders, surface type, and evidence fields.";
  }
  return "This answer is grounded in the evidence fields listed below.";
}

function hedgeBodyForV32(body) {
  const text = String(body || "").trim();
  if (/^based on these records,/i.test(text)) return text;
  if (!text) return "Based on these records, the answer is grounded in the evidence fields listed below.";
  return `Based on these records, ${text.replace(/^[A-Z]/, (letter) => letter.toLowerCase())}`;
}

export function buildPrompt(packet, options = {}) {
  if (packet.label.refusal_expected) return buildHardRefusalPrompt(packet);
  if (packet.label.intent === "source_rights_question") return buildSourceRightsPrompt(packet);
  if (["archive_orientation", "casual_archive_help"].includes(packet.label.intent)) {
    return buildOrientationPrompt(packet, options);
  }
  return buildAnswerablePrompt(packet, options);
}

export function finalizeAnswerText(packet, generatedText, options = {}) {
  if (packet.label.refusal_expected) return `"${REFUSAL_PHRASE}"`;
  if (packet.label.intent === "source_rights_question") return sourceRightsBlock(packet.evidence[0] || {});
  const tags = evidenceTagBlock(packet.evidence, fieldsForLabel(packet.label));
  const body = String(generatedText || "").replace(/EVIDENCE TAGS:[\s\S]*$/i, "").trim();
  const safeBody = !body || bodyLooksLikeRefusal(body) || bodyLooksUnsafe(packet, body)
    ? deterministicAnswerBody(packet)
    : body;
  const finalBody = isV32GuardedProse(options) ? hedgeBodyForV32(safeBody) : safeBody;
  return [finalBody, tags].join("\n\n");
}

export function auditPromptText({ prompt, label }) {
  const failures = [];
  const mode = promptModeForLabel(label);
  if (mode === "hard_refusal" && !prompt.includes(REFUSAL_PHRASE)) {
    failures.push("hard_refusal_missing_magic_phrase");
  }
  if (mode === "source_rights_strict") {
    for (const token of ["RIGHTS:", "REUSE:", "PUBLIC_DOMAIN:", "source:"]) {
      if (!prompt.includes(token)) failures.push(`source_rights_missing_${token.replace(":", "").toLowerCase()}_tag`);
    }
  }
  if (
    !label.refusal_expected &&
    mode !== "source_rights_strict" &&
    !prompt.includes("EVIDENCE TAGS:") &&
    !prompt.includes("browser lab appends exact tags")
  ) {
    failures.push("answerable_prompt_missing_evidence_tags");
  }
  if (prompt.includes("???")) failures.push("prompt_contains_placeholder");
  return failures;
}
