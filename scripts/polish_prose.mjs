const HEDGE = "Based on these records,";

function flatten(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => flatten(item));
  if (typeof value === "object") return Object.values(value).flatMap((item) => flatten(item));
  return [];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function chronologyProofPresent(records = []) {
  return records.some((record) => {
    return record?.chronology_proof === true ||
      Boolean(record?.first_or_earliest_claim) ||
      flatten(record).some((value) => /\bchronology proof\b/i.test(value));
  });
}

function evidenceStringValues(records = []) {
  return [...new Set(records.flatMap((record) => flatten(record))
    .map((value) => String(value || "").replace(/\s+/g, " ").trim())
    .filter((value) => value.length >= 6 && /\S\s+\S/.test(value)))]
    .sort((left, right) => right.length - left.length);
}

function protectEvidenceSpans(text, records) {
  let protectedText = String(text || "");
  const spans = [];
  for (const value of evidenceStringValues(records)) {
    const token = `__EVIDENCE_SPAN_${spans.length}__`;
    const pattern = new RegExp(escapeRegExp(value), "gi");
    if (!pattern.test(protectedText)) continue;
    protectedText = protectedText.replace(pattern, token);
    spans.push({ token, value });
  }
  return { protectedText, spans };
}

function restoreEvidenceSpans(text, spans) {
  let restored = String(text || "");
  for (const { token, value } of spans) {
    restored = restored.replace(new RegExp(escapeRegExp(token), "g"), value);
  }
  return restored;
}

function recordAction(actions, code, from, to, count) {
  if (count > 0) actions.push({ code, from, to, count });
}

function replaceAndLog(text, regex, replacement, actions, code) {
  const matches = text.match(regex) || [];
  if (matches.length === 0) return text;
  const next = text.replace(regex, replacement);
  recordAction(actions, code, matches[0], typeof replacement === "string" ? replacement : "contextual replacement", matches.length);
  return next;
}

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wordCount(text) {
  return (String(text || "").match(/\b[\w'-]+\b/g) || []).length;
}

function splitLongSentences(text, actions) {
  const sentences = String(text || "").match(/[^.!?]+[.!?]?/g) || [];
  let splitCount = 0;
  const next = sentences.map((sentence) => {
    if (wordCount(sentence) <= 32) return sentence;
    let revised = sentence;
    revised = revised.replace(/,\s+serving as\s+/i, ". It serves as ");
    revised = revised.replace(/,\s+ensuring\s+/i, ". This helps ensure ");
    revised = revised.replace(/,\s+with rights states and image-state codes defining\s+/i, ". Rights states and image-state codes define ");
    revised = revised.replace(/,\s+with rights states\s+/i, ". Rights states ");
    revised = revised.replace(/,\s+with image-state codes\s+/i, ". Image-state codes ");
    revised = revised.replace(/,\s+which\s+/i, ". This ");
    if (revised !== sentence) splitCount += 1;
    return revised;
  }).join(" ");
  recordAction(actions, "split_long_sentence", "long sentence", "sentence split", splitCount);
  return next;
}

function ensureHedge(text, actions) {
  const trimmed = normalizeWhitespace(text);
  if (!trimmed) {
    actions.push({ code: "insert_empty_hedge", from: "", to: `${HEDGE} the answer is grounded in the cited evidence.`, count: 1 });
    return `${HEDGE} the answer is grounded in the cited evidence.`;
  }
  if (/^based on these records,\s*based on these records,/i.test(trimmed)) {
    actions.push({ code: "dedupe_hedge", from: "duplicated hedge", to: HEDGE, count: 1 });
    return trimmed.replace(/^based on these records,\s*/i, "");
  }
  if (/^based on these records,/i.test(trimmed)) return trimmed;
  if (/^based on\b/i.test(trimmed)) return trimmed;
  actions.push({ code: "insert_hedge", from: "missing hedge", to: HEDGE, count: 1 });
  return `${HEDGE} ${trimmed.replace(/^[A-Z]/, (letter) => letter.toLowerCase())}`;
}

export function polishProse(text, { label = {}, evidence = [] } = {}) {
  const actions = [];
  const { protectedText, spans } = protectEvidenceSpans(text, evidence);
  let polished = normalizeWhitespace(protectedText)
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/EVIDENCE TAGS:\s*\n[\s\S]*$/i, "")
    .trim();

  polished = replaceAndLog(polished, /\ball\s+(records?|items?|sources?|evidence)\b/gi, (match, noun) => {
    const replacement = noun.toLowerCase() === "evidence" ? "this evidence" : `these ${noun}`;
    return /^[A-Z]/.test(match) ? replacement.replace(/^[a-z]/, (letter) => letter.toUpperCase()) : replacement;
  }, actions, "soften_all_scope");
  polished = replaceAndLog(polished, /\bevery\s+(records?|items?|sources?)\b/gi, "the cited $1", actions, "soften_every_scope");
  polished = replaceAndLog(polished, /\b(certainly|definitely)\s+implies\b/gi, "may suggest", actions, "soften_strong_implies");
  polished = replaceAndLog(polished, /\bnever\b/gi, "does not appear to", actions, "soften_never");
  polished = replaceAndLog(polished, /\balways\b/gi, "generally", actions, "soften_always");
  polished = replaceAndLog(polished, /\bcertainly\b/gi, "likely", actions, "soften_certainly");
  polished = replaceAndLog(polished, /\bdefinitely\b/gi, "clearly", actions, "soften_definitely");
  polished = replaceAndLog(polished, /\bprove\b/gi, "support", actions, "soften_prove");
  polished = replaceAndLog(polished, /\bproves\b/gi, "supports", actions, "soften_proves");
  polished = replaceAndLog(polished, /\bproved\b/gi, "supported", actions, "soften_proved");
  polished = replaceAndLog(polished, /\btherefore\b/gi, "", actions, "remove_therefore");
  polished = replaceAndLog(polished, /\bthus\b/gi, "", actions, "remove_thus");
  polished = replaceAndLog(polished, /\bconsequently\b/gi, "", actions, "remove_consequently");
  polished = replaceAndLog(polished, /\bas a result\b/gi, "", actions, "remove_as_a_result");
  polished = replaceAndLog(polished, /\bimplies\b/gi, "may suggest", actions, "soften_implies");

  if (!chronologyProofPresent(evidence)) {
    polished = replaceAndLog(polished, /\bthe first\b/gi, "an early", actions, "soften_the_first");
    polished = replaceAndLog(polished, /\bthe earliest\b/gi, "one of the early", actions, "soften_the_earliest");
    if (label.intent !== "first_earliest_claim") {
      polished = replaceAndLog(polished, /\bfirst\s+(example|case|instance|use|appearance)\b/gi, "early $1", actions, "soften_first_claim");
      polished = replaceAndLog(polished, /\bfirst\s+(published|printed|issued|released|created|made|produced|recorded|appeared)\b/gi, "$1", actions, "remove_adverbial_first_claim");
      polished = replaceAndLog(polished, /\bearliest\s+(example|case|instance|use|appearance)\b/gi, "early $1", actions, "soften_earliest_claim");
      polished = replaceAndLog(polished, /\bearliest\s+(published|printed|issued|released|created|made|produced|recorded|appeared)\b/gi, "$1", actions, "remove_adverbial_earliest_claim");
      polished = replaceAndLog(polished, /\boriginal\s+(example|case|instance|use|appearance)\b/gi, "early $1", actions, "soften_original_claim");
    }
  }

  polished = restoreEvidenceSpans(normalizeWhitespace(polished), spans);
  polished = splitLongSentences(polished, actions);
  polished = ensureHedge(polished, actions);
  return { text: polished, actions };
}

export function polishProseText(text, context = {}) {
  return polishProse(text, context).text;
}
