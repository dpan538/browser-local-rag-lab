# Deep Research Prompt: WebGPU Runtime Study

## Title

WebGPU Runtime Study for Browser-Local Small-Model RAG: Qwen 0.8B, WebLLM,
Transformers.js, ONNX Runtime WebGPU, and Reproducible Latency Measurement

## Context

We are creating an independent GitHub research repo for browser-local
small-model RAG. The starting use case is a rights-aware archive fixture, but
the primary research direction is broader: WebGPU/WebLLM/browser-local runtime
behavior for small language models in RAG systems.

The lab should not be treated as a product frontend iteration. It is a
reproducible research environment for measuring how browser-local inference
behaves when paired with retrieval, evidence compression, answer lanes, and
strict refusal behavior.

## Central Research Question

In the browser, how can a local 0.8B small model achieve useful RAG behavior
under realistic WebGPU constraints, including cold load, warm load,
tokenization, TTFT, total generation latency, tokens/s, memory pressure, cache
behavior, and device failure?

## Core Model And Runtime Scope

- `Qwen/Qwen3.5-0.8B` is the primary experimental model.
- `onnx-community/Qwen3.5-0.8B-ONNX` may be used as the ONNX/Transformers.js
  artifact.
- Runtime comparisons are research-only and may include Transformers.js, ONNX
  Runtime WebGPU, WebLLM/MLC, worker-based inference, service-worker/cache
  strategies, and direct browser cache controls.
- Do not recommend switching any production archive product runtime.
- Do not use hosted inference as the normal path.
- Do not download or commit model weights in the repo.
- Do not include browser cache, private data, images, raw HTML, cookies,
  sessions, or secrets.

## Problems To Investigate

1. Runtime decomposition: model discovery, network/model asset fetch, browser
   cache hit/miss, WebGPU adapter/device setup, runtime/session creation,
   tokenizer load, tokenization, prefill, TTFT, decode speed, total generation,
   and WebGPU OOM/device-lost/error recovery.
2. Prompt/evidence effects: top 1 vs top 3 vs top 8 evidence, raw note vs
   compressed note, field-only evidence, source/rights fields, topology hints,
   and prompt token budget.
3. UI/runtime architecture: main thread vs worker, streaming vs non-streaming,
   prewarm after opening panel, model/session reuse, cache invalidation,
   service worker asset caching, and explicit session cleanup after WebGPU
   errors.
4. RAG quality: faithfulness, no fabricated titles/dates/sources/rights,
   refusal correctness when retrieval is empty, whether the answer adds useful
   guidance beyond repeating retrieval, and whether smaller evidence packets
   improve or harm output.
5. Reproducibility: deterministic fixture, benchmark query JSON, benchmark
   result JSON/CSV, browser/hardware metadata, model/runtime version metadata,
   cold/warm cache protocol, and no model weights in repo.

## Research Tasks

- Review primary sources and official docs for WebGPU, WebLLM/MLC,
  Transformers.js, ONNX Runtime WebGPU, browser workers, service workers,
  Cache API, browser model caching, `Qwen/Qwen3.5-0.8B`, and
  `onnx-community/Qwen3.5-0.8B-ONNX`.
- Distinguish official claims from community reports.
- Do not assume server-side KV-cache or speculative decoding results transfer
  to browser WebGPU.
- Explain which optimizations are measurable in browser and which are only
  literature background.
- Propose a benchmark harness that can be run by another researcher from
  GitHub.

## Required Output

1. Executive Summary
2. Browser-Local Runtime Landscape
3. Qwen 0.8B Browser Feasibility Notes
4. Runtime Comparison Matrix
5. Measurement Schema
6. Cold/Warm Cache Protocol
7. Worker/Main-Thread Protocol
8. WebGPU Failure Taxonomy
9. RAG Prompt/Evidence Ablation Plan
10. Reproducibility Repo Structure
11. What Not To Claim Without Measurement
12. Paper Framing
13. Next Implementation Steps

Include a table with:

```text
Runtime | Model artifact | Browser support | Worker support | Cache behavior | Metrics available | Expected bottleneck | Risk | Research value
```

End with:

```text
PRODUCT_RUNTIME_RECOMMENDATION: none / research-only
FIRST_MEASUREMENT_TO_RUN:
MINIMUM_REPRODUCIBLE_PACKAGE:
TOP_5_CLAIMS_THAT_REQUIRE_LOCAL_MEASUREMENT:
```
