import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const variantId = "top3_compressed_topology_source_rights";
const roundId = "webllm_round_01";

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
  runOneButton: document.querySelector("#runOneButton"),
  runAllButton: document.querySelector("#runAllButton"),
  downloadButton: document.querySelector("#downloadButton"),
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

function buildPrompt(packet) {
  const contract = {
    query_id: packet.query.query_id,
    query_text: packet.query.query_text,
    intent: packet.label.intent,
    lane: packet.label.gold_lane,
    refusal_expected: packet.label.refusal_expected,
    sufficient_context: packet.label.sufficient_context,
    required_fields: packet.label.required_fields,
    must_not_invent_fields: packet.label.must_not_invent_fields,
    retrieved_ids: packet.retrievedIds,
    variant_id: variantId
  };

  return [
    "You are running a research-only browser-local Qwen RAG experiment.",
    "Use only the EVIDENCE_PACKET. Do not invent title, date, source, rights, creator, chronology, or reuse permission.",
    "Generated text is not archive evidence.",
    "If refusal_expected is true, or if the evidence packet cannot support the requested fields, refuse briefly and ask for narrower context.",
    "Prefer a compact answer. Preserve source/rights caveats when relevant.",
    "",
    "CONTRACT:",
    JSON.stringify(contract, null, 2),
    "",
    "EVIDENCE_PACKET:",
    JSON.stringify(packet.evidence, null, 2),
    "",
    "Answer the query now."
  ].join("\n");
}

function updatePromptPreview(packet, answer = "") {
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
    fetchJsonl("../fixtures/gold/queries.jsonl"),
    fetchJsonl("../fixtures/gold/labels.jsonl"),
    fetchJsonl("../fixtures/gold/records.jsonl"),
    fetchJson("../reports/retrieval_sufficiency_v0.json")
  ]);

  state.queries = queries;
  state.labelsByQuery = new Map(labels.map((label) => [label.query_id, label]));
  state.recordsById = new Map(records.map((record) => [record.record_id, record]));
  state.retrievalByQuery = new Map(
    retrieval.rows
      .filter((row) => row.variant_id === variantId)
      .map((row) => [row.query_id, row])
  );

  el.querySelect.innerHTML = "";
  for (const query of queries) {
    const option = document.createElement("option");
    option.value = query.query_id;
    option.textContent = `${query.query_id} · ${query.intent} · ${query.query_text}`;
    el.querySelect.append(option);
  }

  updatePromptPreview(buildPacket(selectedQueryId()));
  log(`Loaded ${queries.length} benchmark queries and ${records.length} records.`);
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
    stream: true
  });

  for await (const chunk of completion) {
    const delta = chunk.choices?.[0]?.delta?.content || "";
    if (!delta) continue;
    if (firstTokenAt === null) firstTokenAt = performance.now();
    answerText += delta;
    el.answerOutput.textContent = [
      "PROMPT",
      prompt,
      "",
      "ANSWER",
      answerText
    ].join("\n");
  }

  const ended = performance.now();
  const outputTokens = approxTokens(answerText);
  const ttftMs = firstTokenAt === null ? null : firstTokenAt - started;
  const totalMs = ended - started;
  return {
    answer_text: answerText,
    ttft_ms: ttftMs,
    total_latency_ms: totalMs,
    output_tokens: outputTokens,
    tokens_per_second: tokensPerSecond(outputTokens, totalMs, ttftMs)
  };
}

async function runQuery(queryId) {
  if (!state.engine) throw new Error("Load WebLLM before running generation.");
  const packet = buildPacket(queryId);
  const prompt = buildPrompt(packet);
  const promptBuildStarted = performance.now();
  updatePromptPreview(packet);
  const promptBuildMs = performance.now() - promptBuildStarted;

  const base = {
    query_id: queryId,
    intent: packet.label.intent,
    lane: packet.label.gold_lane,
    variant_id: variantId,
    producer: "webllm_qwen3_5_0_8b_research_runtime",
    generation_status: "running",
    retrieved_ids: packet.retrievedIds.join("|"),
    candidate_count: Number(packet.retrieval?.candidate_count || 0),
    prompt_chars: prompt.length,
    prompt_tokens_est: Math.ceil(prompt.length / 4),
    prompt_build_ms: promptBuildMs,
    model_load_ms: state.loadMs,
    tokenization_ms: null,
    device_error: null
  };

  try {
    log(`Running ${queryId} (${packet.label.intent}).`);
    const generated = await streamCompletion(prompt);
    const row = {
      ...base,
      generation_status: "completed",
      ...generated
    };
    state.results.push(row);
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
    state.results.push(row);
    updateMetrics(row);
    log(`ERROR ${queryId}: ${row.error}`);
    return row;
  }
}

function downloadablePayload() {
  return {
    meta: {
      round_id: roundId,
      generated_at: new Date().toISOString(),
      research_only: true,
      note: "Browser-local WebLLM custom-model run. AI output is experimental and not archive evidence.",
      model_id: el.modelId.value.trim(),
      model_url: el.modelUrl.value.trim(),
      model_lib_url: el.modelLibUrl.value.trim(),
      variant_id: variantId,
      user_agent: navigator.userAgent,
      webgpu: state.webgpu,
      result_count: state.results.length
    },
    results: state.results
  };
}

function downloadResults() {
  const payload = JSON.stringify(downloadablePayload(), null, 2);
  const blob = new Blob([payload, "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${roundId}_${new Date().toISOString().replaceAll(":", "-")}.json`;
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

el.runAllButton.addEventListener("click", async () => {
  try {
    for (const query of state.queries) {
      await runQuery(query.query_id);
    }
    log(`Run all complete: ${state.results.length} result rows in memory.`);
  } catch (error) {
    log(error?.message || String(error));
  }
});

el.downloadButton.addEventListener("click", downloadResults);

loadData().catch((error) => {
  setStatus("data error");
  log(error?.message || String(error));
});
