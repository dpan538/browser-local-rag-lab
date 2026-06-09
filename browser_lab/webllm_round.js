import * as webllm from "https://esm.run/@mlc-ai/web-llm";
import { generateDeterministicAnswer } from "../scripts/deterministic_responder.mjs?v=2";
import { buildPrompt as buildContractPrompt, finalizeAnswerText } from "../scripts/prompt_builder.mjs?v=8";

const params = new URLSearchParams(window.location.search);
const config = {
  queriesPath: params.get("queries") || "../fixtures/gold/queries.jsonl",
  labelsPath: params.get("labels") || "../fixtures/gold/labels.jsonl",
  recordsPath: params.get("records") || "../fixtures/gold/records.jsonl",
  retrievalPath: params.get("retrieval") || "../reports/retrieval_sufficiency_v0.json",
  variantId: params.get("variant") || "top3_compressed_topology_source_rights",
  promptVariant: params.get("promptVariant") || "r03_v0_baseline",
  roundId: params.get("round") || "webllm_round_02",
  queryStart: Math.max(1, Number(params.get("start") || 1)),
  queryLimit: Math.max(1, Number(params.get("limit") || 50)),
  skipCompleted: params.get("skipCompleted") !== "false",
  queryIds: params.get("queryIds")
    ? params.get("queryIds").split(",").map((id) => id.trim()).filter(Boolean)
    : null
};

const state = {
  queries: [],
  labelsByQuery: new Map(),
  recordsById: new Map(),
  retrievalByQuery: new Map(),
  engine: null,
  loadMs: null,
  webgpu: null,
  results: [],
  lastPrompt: ""
};

const el = {
  runtimeStatus: document.querySelector("#runtimeStatus"),
  modelId: document.querySelector("#modelId"),
  modelUrl: document.querySelector("#modelUrl"),
  modelLibUrl: document.querySelector("#modelLibUrl"),
  probeButton: document.querySelector("#probeButton"),
  loadButton: document.querySelector("#loadButton"),
  querySelect: document.querySelector("#querySelect"),
  maxTokens: document.querySelector("#maxTokens"),
  temperature: document.querySelector("#temperature"),
  cacheState: document.querySelector("#cacheState"),
  runStart: document.querySelector("#runStart"),
  runLimit: document.querySelector("#runLimit"),
  runOneButton: document.querySelector("#runOneButton"),
  runScopeButton: document.querySelector("#runScopeButton"),
  runAllButton: document.querySelector("#runAllButton"),
  clearCheckpointButton: document.querySelector("#clearCheckpointButton"),
  downloadButton: document.querySelector("#downloadButton"),
  exportBuffer: document.querySelector("#exportBuffer"),
  metricLoad: document.querySelector("#metricLoad"),
  metricTtft: document.querySelector("#metricTtft"),
  metricTotal: document.querySelector("#metricTotal"),
  metricTps: document.querySelector("#metricTps"),
  metricWebgpu: document.querySelector("#metricWebgpu"),
  answerOutput: document.querySelector("#answerOutput"),
  runLog: document.querySelector("#runLog")
};

function log(message) {
  const stamp = new Date().toLocaleTimeString();
  el.runLog.textContent += `[${stamp}] ${message}\n`;
  el.runLog.scrollTop = el.runLog.scrollHeight;
}

function setStatus(message) {
  el.runtimeStatus.textContent = message;
}

function updateRoundChrome() {
  document.title = `${config.roundId} WebLLM Qwen runtime`;
  const titleNode = document.querySelector("[data-round-title]");
  if (titleNode) titleNode.textContent = config.roundId.replaceAll("_", " ");
}

function checkpointKey() {
  return `webllm-round-results:${config.roundId}:${config.variantId}:${config.promptVariant}`;
}

function loadCheckpoint() {
  try {
    const raw = localStorage.getItem(checkpointKey());
    if (!raw) return [];
    const rows = JSON.parse(raw);
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function saveCheckpoint() {
  localStorage.setItem(checkpointKey(), JSON.stringify(state.results));
}

function upsertResult(row) {
  const existingIndex = state.results.findIndex((item) => item.query_id === row.query_id);
  if (existingIndex >= 0) {
    state.results[existingIndex] = row;
  } else {
    state.results.push(row);
  }
  saveCheckpoint();
}

function clearCheckpoint() {
  localStorage.removeItem(checkpointKey());
  state.results = [];
  syncExportBuffer();
  log("Cleared checkpoint for this round and variant.");
}

function completedQueryIds() {
  return new Set(state.results.filter((row) => row.generation_status === "completed").map((row) => row.query_id));
}

function scopedQueries({ all = false } = {}) {
  if (all) return state.queries;
  const start = Math.max(1, Number(el.runStart.value || config.queryStart));
  const limit = Math.max(1, Number(el.runLimit.value || config.queryLimit));
  return state.queries.slice(start - 1, start - 1 + limit);
}

function filterQueries(queries) {
  if (!config.queryIds) return queries;
  const selected = new Set(config.queryIds);
  return queries.filter((query) => selected.has(query.query_id));
}

function ms(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${Math.round(value)} ms`;
}

function tokensPerSecond(outputTokens, totalMs, ttftMs) {
  const decodeMs = Math.max(1, Number(totalMs || 0) - Number(ttftMs || 0));
  if (!outputTokens || !totalMs) return null;
  return outputTokens / (decodeMs / 1000);
}

function approxTokens(text) {
  return String(text || "").split(/\s+/).filter(Boolean).length;
}

function stripThinking(text) {
  const raw = String(text || "");
  if (!raw.includes("<think>")) return raw.trim();
  if (raw.includes("</think>")) {
    return raw.split("</think>").slice(1).join("</think>").trim();
  }
  return raw.replace(/<think>[\s\S]*$/i, "").trim();
}

function splitIds(value) {
  return String(value || "").split("|").filter(Boolean);
}

function parseJsonl(text) {
  return text.trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

async function fetchJsonl(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return parseJsonl(await res.text());
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

function compactRecord(record) {
  if (!record) return null;
  return {
    record_id: record.record_id,
    title: record.title,
    creator: record.creator,
    date_text: record.date_text,
    region: record.region,
    source: record.source,
    rights: record.rights,
    rights_interpretation: record.rights_interpretation,
    image_state: record.image_state,
    topology: record.topology,
    notes: {
      compact: record.notes?.compact,
      packet_version: record.notes?.packet_version
    },
    first_or_earliest_claim: record.first_or_earliest_claim,
    chronology_proof: record.chronology_proof,
    method_context: record.method_context
  };
}

function list(value) {
  if (!value) return "not available";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "not available";
  return String(value);
}

function clip(value, max = 320) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function fieldValue(record, field) {
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
  return clip(values[field] || "not available", 420);
}

function evidenceTagBlock(records, fields) {
  const uniqueFields = [...new Set(fields)];
  return [
    "Evidence Tags:",
    ...uniqueFields.map((field) => {
      const values = [...new Set(records.map((record) => fieldValue(record, field)).filter((value) => value && value !== "not available"))];
      return `${field}: ${values.length ? values.join(" | ") : "not available"}`;
    })
  ].join("\n");
}

function recordSummary(record, fields) {
  return [
    "Record:",
    ...fields.map((field) => `${field}: ${fieldValue(record, field)}`),
    `compact_note: ${clip(record.notes?.compact, 360)}`
  ].join("\n");
}

function evidenceSummary(records) {
  return records.map((record, index) => [
    `Evidence ${index + 1}`,
    `record_id: ${record.record_id || "not available"}`,
    `title: ${record.title || "not available"}`,
    `creator: ${record.creator || "not available"}`,
    `date_text: ${record.date_text || "not available"}`,
    `region: ${record.region || "not available"}`,
    `source_name: ${record.source?.name || "not available"}`,
    `source_url: ${record.source?.url || "not available"}`,
    `rights_label: ${record.rights?.label || "not available"}`,
    `reuse_permission: ${record.rights_interpretation?.reuse_permission || "not available"}`,
    `public_domain_status: ${record.rights_interpretation?.public_domain_status || "not available"}`,
    `image_state: ${record.image_state?.code || "not available"} / ${record.image_state?.display_mode || "not available"}`,
    `topology_surface_type: ${record.topology?.surface_type || "not available"}`,
    `topology_publication_role: ${record.topology?.publication_role || "not available"}`,
    `topology_folder_titles: ${list(record.topology?.folder_titles)}`,
    `compact_note: ${record.notes?.compact || "not available"}`
  ].join("\n")).join("\n\n");
}

function orientationEvidenceSummary(records) {
  const folderTitles = [...new Set(records.flatMap((record) => record.topology?.folder_titles || []))];
  const surfaceTypes = [...new Set(records.map((record) => record.topology?.surface_type).filter(Boolean))];
  const publicationRoles = [...new Set(records.map((record) => record.topology?.publication_role).filter(Boolean))];
  const sourceNames = [...new Set(records.map((record) => record.source?.name).filter(Boolean))];
  const rightsStates = [...new Set(records.map((record) => record.rights?.state).filter(Boolean))];
  const imageStates = [...new Set(records.map((record) => record.image_state?.code).filter(Boolean))];
  const compactNotes = records.map((record) => record.notes?.compact).filter(Boolean).slice(0, 3);
  return [
    "Archive structure evidence, synthesized from retrieved records:",
    `topology_folder_titles: ${list(folderTitles)}`,
    `topology_surface_types: ${list(surfaceTypes)}`,
    `topology_publication_roles: ${list(publicationRoles)}`,
    `source_families: ${list(sourceNames)}`,
    `rights_states: ${list(rightsStates)}`,
    `image_states: ${list(imageStates)}`,
    "compact_note_examples:",
    ...compactNotes.map((note) => `- ${note}`)
  ].join("\n");
}

function evidenceBlock(packet) {
  if (["archive_orientation", "casual_archive_help"].includes(packet.label.intent)) {
    return [
      "EVIDENCE_SUMMARY:",
      orientationEvidenceSummary(packet.evidence),
      "",
      "EVIDENCE_PACKET:",
      "Object-level ids and titles are intentionally hidden for this orientation/help lane. Use the archive structure evidence above."
    ].join("\n");
  }
  return [
    "EVIDENCE_SUMMARY:",
    evidenceSummary(packet.evidence),
    "",
    "EVIDENCE_PACKET:",
    JSON.stringify(packet.evidence, null, 2)
  ].join("\n");
}

function buildOrientationPrompt(packet, contract) {
  const records = packet.evidence;
  const folderTitles = [...new Set(records.flatMap((record) => record.topology?.folder_titles || []))];
  const surfaceTypes = [...new Set(records.map((record) => record.topology?.surface_type).filter(Boolean))];
  const publicationRoles = [...new Set(records.map((record) => record.topology?.publication_role).filter(Boolean))];
  const sourceNames = [...new Set(records.map((record) => record.source?.name).filter(Boolean))];
  const rightsStates = [...new Set(records.map((record) => record.rights?.state).filter(Boolean))];
  const imageStates = [...new Set(records.map((record) => record.image_state?.code).filter(Boolean))];
  return [
    "You are running a research-only browser-local Qwen RAG experiment.",
    "Generated text is not archive evidence.",
    "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
    "Never write the literal words EVIDENCE_SUMMARY, EVIDENCE_PACKET, CONTRACT, or RESPONSE_PLAN.",
    "",
    `Question: ${packet.query.query_text}`,
    `Intent: ${contract.intent}`,
    "Required behavior: answer about the archive view as a whole, not about one object.",
    "",
    "Facts you may use:",
    "- This is a source-linked research archive for graphic design and visual communication records.",
    `- It organizes records through folders/topology: ${list(folderTitles)}.`,
    `- Surface types in the packet: ${list(surfaceTypes)}.`,
    `- Publication roles in the packet: ${list(publicationRoles)}.`,
    `- Source families represented: ${list(sourceNames)}.`,
    `- Rights states represented: ${list(rightsStates)}.`,
    `- Image-state codes represented: ${list(imageStates)}.`,
    "",
    "Write exactly three short bullet points:",
    "- what the archive is for;",
    "- how the view is organized;",
    "- one concrete next step for the user.",
    "",
    "Do not name a single record as the archive.",
    "",
    "After the three bullets, append this exact field block:",
    evidenceTagBlock(records, ["topology"])
  ].join("\n");
}

function buildHardRefusalPrompt(packet) {
  return [
    "You are an archival assistant with strict evidence rules.",
    "The evidence for this query is intentionally empty or insufficient.",
    "",
    `QUERY: ${packet.query.query_text}`,
    "",
    "INSTRUCTION: You MUST answer with exactly the following sentence and nothing else:",
    "\"I cannot answer this question because the evidence is insufficient.\"",
    "",
    "Do not explain. Do not provide any factual information. Do not speculate."
  ].join("\n");
}

function buildSourceRightsPrompt(packet) {
  const record = packet.evidence[0] || {};
  return [
    "You are an archival rights assistant.",
    "Use ONLY the evidence below. Do not interpret or summarize rights.",
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
    "INSTRUCTION: Answer in exactly this format, with no extra text:",
    "",
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

function buildCompactAnswerPrompt(packet) {
  const required = packet.label.required_fields?.length ? packet.label.required_fields : ["record_id", "title", "source"];
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
    ...packet.evidence.map((record) => recordSummary(record, required)),
    "",
    "Answer briefly, then append this exact field block using values from evidence:",
    evidenceTagBlock(packet.evidence, required)
  ].join("\n");
}

function selectedQueryId() {
  return el.querySelect.value;
}

function selectedQuery() {
  return state.queries.find((query) => query.query_id === selectedQueryId());
}

function buildPacket(queryId) {
  const query = state.queries.find((item) => item.query_id === queryId);
  const label = state.labelsByQuery.get(queryId);
  const retrieval = state.retrievalByQuery.get(queryId);
  const retrievedIds = splitIds(retrieval?.retrieved_ids);
  const evidence = retrievedIds.map((id) => compactRecord(state.recordsById.get(id))).filter(Boolean);
  return { query, label, retrieval, retrievedIds, evidence };
}

function responsePlan(label) {
  if (["archive_orientation", "casual_archive_help"].includes(label.intent)) {
    return [
      "Answer about the archive view as a source-linked research index, not about one evidence record.",
      "Do not begin by saying 'The archive is RECORD_ID' or by naming a single item as the archive.",
      "Use record ids only as examples if needed.",
      "Mention that the archive organizes source-linked graphic design or visual communication records through folders/topology, compact notes, source links, rights labels, and image-state.",
      "End with a concrete next step for the user."
    ];
  }
  if (label.intent === "current_object_explanation") {
    return [
      "Explain the active object compactly.",
      "Include title, date, region, source, and the evidence boundary.",
      "Do not generalize beyond the cited record."
    ];
  }
  if (label.intent === "source_rights_question") {
    return [
      "Answer source and rights conservatively.",
      "Include source name/url, rights label, image_state, reuse_permission, and public_domain_status when available.",
      "Do not grant reuse permission beyond the evidence."
    ];
  }
  if (label.refusal_expected) {
    return [
      "Refuse briefly because the contract expects refusal.",
      "Do not provide protected title/date/source/rights claims as if they answer the query.",
      "Ask for narrower context or stronger evidence."
    ];
  }
  return [
    "Answer from the evidence packet only.",
    "Use required fields when available.",
    "Keep source/rights and evidence limits visible."
  ];
}

function buildPrompt(packet) {
  return buildContractPrompt(packet, { promptVariant: config.promptVariant });

  /* legacy generic prompt retained for reference only */
  return [
    "You are running a research-only browser-local Qwen RAG experiment.",
    "Use only the EVIDENCE_PACKET. Do not invent title, date, source, rights, creator, chronology, or reuse permission.",
    "Generated text is not archive evidence.",
    "If refusal_expected is true, or if the evidence packet cannot support the requested fields, refuse briefly and ask for narrower context.",
    "Prefer a compact answer. Preserve source/rights caveats when relevant.",
    "Do not output hidden reasoning, chain-of-thought, or <think> tags.",
    "When required_fields includes topology, use the topology_* lines in EVIDENCE_SUMMARY. Do not say topology is missing if those lines have values.",
    "When answering archive orientation/help queries, explain what the archive view is for and where to go next using topology and compact notes.",
    "For archive orientation/help queries, do not treat a single evidence record as the archive itself; synthesize across the packet.",
    "",
    "CONTRACT:",
    JSON.stringify(contract, null, 2),
    "",
    "RESPONSE_PLAN:",
    responsePlan(packet.label).map((line) => `- ${line}`).join("\n"),
    "",
    evidenceBlock(packet),
    "",
    "Answer the query now."
  ].join("\n");
}

function updatePromptPreview(packet, answer = "") {
  const deterministic = generateDeterministicAnswer(packet, { promptVariant: config.promptVariant });
  if (deterministic) {
    state.lastPrompt = "";
    el.answerOutput.textContent = [
      "DETERMINISTIC HYBRID LANE",
      `lane: ${deterministic.lane}`,
      "No Qwen/WebLLM prompt is sent for this query.",
      "",
      "ANSWER",
      answer || deterministic.answer_text
    ].join("\n");
    return;
  }
  const prompt = buildPrompt(packet);
  state.lastPrompt = prompt;
  el.answerOutput.textContent = [
    "PROMPT",
    prompt,
    "",
    "ANSWER",
    answer || "(not generated yet)"
  ].join("\n");
}

function updateMetrics(result = {}) {
  el.metricLoad.textContent = ms(result.model_load_ms ?? state.loadMs);
  el.metricTtft.textContent = ms(result.ttft_ms);
  el.metricTotal.textContent = ms(result.total_latency_ms);
  el.metricTps.textContent = result.tokens_per_second ? result.tokens_per_second.toFixed(2) : "-";
  el.metricWebgpu.textContent = state.webgpu?.status || "not probed";
}

async function loadData() {
  const [queries, labels, records, retrieval] = await Promise.all([
    fetchJsonl(config.queriesPath),
    fetchJsonl(config.labelsPath),
    fetchJsonl(config.recordsPath),
    fetchJson(config.retrievalPath)
  ]);

  state.queries = filterQueries(queries);
  state.labelsByQuery = new Map(labels.map((label) => [label.query_id, label]));
  state.recordsById = new Map(records.map((record) => [record.record_id, record]));
  state.retrievalByQuery = new Map(
    retrieval.rows
      .filter((row) => row.variant_id === config.variantId)
      .map((row) => [row.query_id, row])
  );
  state.results = loadCheckpoint();

  el.querySelect.innerHTML = "";
  for (const query of state.queries) {
    const option = document.createElement("option");
    option.value = query.query_id;
    option.textContent = `${query.query_id} · ${query.intent} · ${query.query_text}`;
    el.querySelect.append(option);
  }

  el.runStart.value = String(config.queryStart);
  el.runLimit.value = String(config.queryLimit);
  el.runAllButton.textContent = `Run all ${state.queries.length}`;
  updatePromptPreview(buildPacket(selectedQueryId()));
  syncExportBuffer();
  log(`Loaded ${state.queries.length}/${queries.length} benchmark queries and ${records.length} records for ${config.roundId}.`);
  if (config.queryIds) log(`Active queryIds filter: ${config.queryIds.join(",")}.`);
  log(`Checkpoint contains ${state.results.length} result rows.`);
}

async function probeWebGPU() {
  const result = {
    status: "unavailable",
    has_navigator_gpu: Boolean(navigator.gpu),
    adapter_info: null,
    error: null
  };

  try {
    if (!navigator.gpu) {
      result.error = "navigator.gpu is not available";
      return result;
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      result.error = "requestAdapter returned null";
      return result;
    }
    result.status = "available";
    if (adapter.info) result.adapter_info = adapter.info;
    if (typeof adapter.requestAdapterInfo === "function") {
      result.adapter_info = await adapter.requestAdapterInfo();
    }
  } catch (error) {
    result.status = "error";
    result.error = error?.message || String(error);
  }
  return result;
}

async function loadEngine() {
  if (state.engine) {
    log("WebLLM engine already loaded; using warm engine.");
    setStatus("loaded");
    return;
  }

  setStatus("loading");
  log("Loading WebLLM custom Qwen runtime. This may download/cache model artifacts in the browser.");
  const appConfig = {
    model_list: [
      {
        model: el.modelUrl.value.trim(),
        model_id: el.modelId.value.trim(),
        model_lib: el.modelLibUrl.value.trim(),
        overrides: {
          context_window_size: 4096
        }
      }
    ]
  };

  const start = performance.now();
  state.engine = await webllm.CreateMLCEngine(el.modelId.value.trim(), {
    appConfig,
    initProgressCallback: (report) => {
      if (report?.text) log(report.text);
    }
  });
  state.loadMs = performance.now() - start;
  setStatus("loaded");
  updateMetrics();
  log(`Engine loaded in ${Math.round(state.loadMs)} ms.`);
}

async function streamCompletion(prompt) {
  const messages = [
    {
      role: "system",
      content: "You are a cautious rights-aware archive research assistant. Ground every answer in the provided evidence packet."
    },
    { role: "user", content: prompt }
  ];
  const temperature = Number(el.temperature.value || 0.2);
  const maxTokens = Number(el.maxTokens.value || 160);
  const started = performance.now();
  let firstTokenAt = null;
  let answerText = "";

  const completion = await state.engine.chat.completions.create({
    messages,
    temperature,
    max_tokens: maxTokens,
    extra_body: {
      enable_thinking: false,
      chat_template_kwargs: {
        enable_thinking: false
      }
    },
    stream: true
  });

  for await (const chunk of completion) {
    const delta = chunk.choices?.[0]?.delta?.content || "";
    if (!delta) continue;
    if (firstTokenAt === null) firstTokenAt = performance.now();
    answerText += delta;
    const cleanedAnswerText = stripThinking(answerText);
    el.answerOutput.textContent = [
      "PROMPT",
      prompt,
      "",
      "ANSWER",
      cleanedAnswerText || "(thinking output suppressed until final answer appears)"
    ].join("\n");
  }

  const ended = performance.now();
  const cleanedAnswerText = stripThinking(answerText);
  const outputTokens = approxTokens(cleanedAnswerText);
  const ttftMs = firstTokenAt === null ? null : firstTokenAt - started;
  const totalMs = ended - started;
  return {
    answer_text: cleanedAnswerText,
    raw_answer_text: answerText,
    ttft_ms: ttftMs,
    total_latency_ms: totalMs,
    output_tokens: outputTokens,
    tokens_per_second: tokensPerSecond(outputTokens, totalMs, ttftMs)
  };
}

async function runQuery(queryId) {
  const packet = buildPacket(queryId);
  const promptBuildStarted = performance.now();
  const deterministic = generateDeterministicAnswer(packet, { promptVariant: config.promptVariant });
  const prompt = deterministic ? "" : buildPrompt(packet);
  if (deterministic) {
    state.lastPrompt = "";
    el.answerOutput.textContent = [
      "DETERMINISTIC HYBRID LANE",
      `lane: ${deterministic.lane}`,
      "No Qwen/WebLLM prompt is sent for this query.",
      "",
      "ANSWER",
      deterministic.answer_text
    ].join("\n");
  } else {
    updatePromptPreview(packet);
  }
  const promptBuildMs = performance.now() - promptBuildStarted;

  const base = {
    query_id: queryId,
    intent: packet.label.intent,
    lane: packet.label.gold_lane,
    variant_id: config.variantId,
    prompt_variant: config.promptVariant,
    producer: deterministic ? "deterministic_hybrid_system_v1" : "webllm_qwen3_5_0_8b_research_runtime",
    generation_status: "running",
    retrieved_ids: packet.retrievedIds.join("|"),
    candidate_count: Number(packet.retrieval?.candidate_count || 0),
    prompt_chars: prompt.length,
    prompt_tokens_est: Math.ceil(prompt.length / 4),
    prompt_build_ms: promptBuildMs,
    model_load_ms: deterministic ? 0 : state.loadMs,
    tokenization_ms: null,
    cache_state: el.cacheState.value,
    device_error: null,
    deterministic: Boolean(deterministic),
    hybrid_lane: deterministic?.lane || null,
    latency_bucket: deterministic?.latency_bucket || "qwen_generation_latency"
  };

  try {
    if (deterministic) {
      const row = {
        ...base,
        generation_status: "completed",
        ttft_ms: deterministic.elapsed_ms,
        total_latency_ms: deterministic.elapsed_ms,
        output_tokens: approxTokens(deterministic.answer_text),
        tokens_per_second: 0,
        raw_answer_text: "",
        model_answer_text: "",
        answer_text: deterministic.answer_text,
        answer_postprocess: "deterministic_hybrid_lane_v1"
      };
      upsertResult(row);
      syncExportBuffer();
      updateMetrics(row);
      log(`Completed ${queryId} via deterministic ${deterministic.lane} lane: total ${ms(row.total_latency_ms)}.`);
      return row;
    }

    if (!state.engine) throw new Error("Load WebLLM before running generation.");
    log(`Running ${queryId} (${packet.label.intent}).`);
    const generated = await streamCompletion(prompt);
    const finalizedAnswerText = finalizeAnswerText(packet, generated.answer_text, { promptVariant: config.promptVariant });
    const row = {
      ...base,
      generation_status: "completed",
      ...generated,
      model_answer_text: generated.answer_text,
      answer_text: finalizedAnswerText,
      answer_postprocess: "deterministic_contract_fields_v1"
    };
    upsertResult(row);
    syncExportBuffer();
    updateMetrics(row);
    log(`Completed ${queryId}: TTFT ${ms(row.ttft_ms)}, total ${ms(row.total_latency_ms)}, ${row.output_tokens} approx output tokens.`);
    return row;
  } catch (error) {
    const row = {
      ...base,
      generation_status: "error",
      ttft_ms: null,
      total_latency_ms: null,
      output_tokens: 0,
      tokens_per_second: null,
      answer_text: "",
      error: error?.message || String(error),
      device_error: error?.message || String(error)
    };
    upsertResult(row);
    syncExportBuffer();
    updateMetrics(row);
    log(`ERROR ${queryId}: ${row.error}`);
    return row;
  }
}

function downloadablePayload() {
  return {
    meta: {
      round_id: config.roundId,
      generated_at: new Date().toISOString(),
      research_only: true,
      note: "Browser-local WebLLM custom-model run. AI output is experimental and not archive evidence.",
      model_id: el.modelId.value.trim(),
      model_url: el.modelUrl.value.trim(),
      model_lib_url: el.modelLibUrl.value.trim(),
      variant_id: config.variantId,
      prompt_variant: config.promptVariant,
      queries_path: config.queriesPath,
      labels_path: config.labelsPath,
      records_path: config.recordsPath,
      retrieval_path: config.retrievalPath,
      user_agent: navigator.userAgent,
      webgpu: state.webgpu,
      cache_state: el.cacheState.value,
      run_scope: {
        query_start: Math.max(1, Number(el.runStart.value || config.queryStart)),
        query_limit: Math.max(1, Number(el.runLimit.value || config.queryLimit)),
        skip_completed: config.skipCompleted,
        query_ids: config.queryIds
      },
      result_count: state.results.length
    },
    results: state.results
  };
}

window.webllmRoundExport = downloadablePayload;

function syncExportBuffer() {
  if (!el.exportBuffer) return;
  el.exportBuffer.value = JSON.stringify(downloadablePayload(), null, 2);
}

function downloadResults() {
  syncExportBuffer();
  const payload = JSON.stringify(downloadablePayload(), null, 2);
  const blob = new Blob([payload, "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${config.roundId}_${new Date().toISOString().replaceAll(":", "-")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

el.probeButton.addEventListener("click", async () => {
  state.webgpu = await probeWebGPU();
  el.metricWebgpu.textContent = state.webgpu.status;
  log(`WebGPU probe: ${JSON.stringify(state.webgpu)}`);
});

el.loadButton.addEventListener("click", async () => {
  try {
    if (!state.webgpu) {
      state.webgpu = await probeWebGPU();
      el.metricWebgpu.textContent = state.webgpu.status;
    }
    await loadEngine();
  } catch (error) {
    setStatus("load error");
    log(`Load error: ${error?.message || String(error)}`);
  }
});

el.querySelect.addEventListener("change", () => {
  updatePromptPreview(buildPacket(selectedQueryId()));
});

el.runOneButton.addEventListener("click", async () => {
  try {
    await runQuery(selectedQueryId());
  } catch (error) {
    log(error?.message || String(error));
  }
});

async function runQueries(queries, label) {
  const completed = completedQueryIds();
  const pending = queries.filter((query) => !(config.skipCompleted && completed.has(query.query_id)));
  log(`${label}: ${pending.length}/${queries.length} rows pending; skipCompleted=${config.skipCompleted}.`);
  for (const query of pending) {
    await runQuery(query.query_id);
  }
  log(`${label} complete: ${state.results.length} result rows in checkpoint.`);
}

el.runScopeButton.addEventListener("click", async () => {
  try {
    await runQueries(scopedQueries(), "Scoped run");
  } catch (error) {
    log(error?.message || String(error));
  }
});

el.runAllButton.addEventListener("click", async () => {
  try {
    await runQueries(scopedQueries({ all: true }), "Run all");
  } catch (error) {
    log(error?.message || String(error));
  }
});

el.clearCheckpointButton.addEventListener("click", clearCheckpoint);
el.downloadButton.addEventListener("click", downloadResults);

updateRoundChrome();

loadData().catch((error) => {
  setStatus("data error");
  log(error?.message || String(error));
});
