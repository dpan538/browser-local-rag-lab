import { mandatoryRefusalPhrase, sourceRightsBlock } from "./prompt_builder.mjs";

const HYBRID_DETERMINISTIC_VARIANTS = new Set([
  "r03_v3_hybrid_deterministic_lanes",
  "r03_v31_evidence_prune_tag_injection",
  "r03_v4_combined"
]);

function nowMs() {
  return globalThis.performance?.now ? globalThis.performance.now() : Date.now();
}

export function isHybridDeterministicVariant(promptVariant) {
  return HYBRID_DETERMINISTIC_VARIANTS.has(String(promptVariant || ""));
}

export function generateDeterministicAnswer(packet, { promptVariant } = {}) {
  if (!isHybridDeterministicVariant(promptVariant)) return null;

  const started = nowMs();
  const label = packet?.label || {};
  const evidence = packet?.evidence || [];
  let answerText = null;
  let lane = null;

  if (label.refusal_expected === true) {
    answerText = mandatoryRefusalPhrase();
    lane = "refusal";
  } else if (label.intent === "source_rights_question" && evidence.length > 0) {
    answerText = sourceRightsBlock(evidence[0]);
    lane = "source_rights";
  }

  if (!answerText) return null;

  return {
    answer_text: answerText,
    is_deterministic: true,
    lane,
    latency_bucket: "hybrid_system_latency",
    elapsed_ms: Math.max(0, nowMs() - started)
  };
}
