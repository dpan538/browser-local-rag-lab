# Model Runtime Card

## Primary Browser Runtime

- model id: `Qwen3.5-0.8B-q4f16_1-MLC`
- runtime: WebLLM/MLC custom browser runtime
- browser path: `browser_lab/webllm_round.html`
- final-condition launcher: `browser_lab/webllm_v33.html`
- product status: research-only, not an archive product runtime path

## Runtime Pinning Status

The V3.3 manifest records the runtime URLs used by the browser export, but the
current browser page still imports WebLLM and the custom model library from
remote URLs that are not fully revision-pinned:

- WebLLM import: `https://esm.run/@mlc-ai/web-llm`
- custom model library: GitHub raw URL from `main`

Before a double-anonymous submission artifact is frozen, record or pin:

- the `@mlc-ai/web-llm` package version;
- the custom model-library repository commit SHA;
- the model repository revision;
- model and model-library checksums where feasible;
- model and runtime license notes.

Until then, latency and runtime claims should be tied to the recorded V3.3
browser export and manifest, not presented as a fully reproducible remote
runtime pin.

## Final V3.3 Condition

`v3.3_contract_top3_300_delivered` combines:

- deterministic refusal lane
- deterministic source/rights lane
- Qwen model-generation rows
- V3.3 postprocessed prose
- deterministic evidence-tag injection

The final result is a delivered-answer system, not raw Qwen prose.

## Cross-Model Runtimes

V4.1 uses Node Transformers.js to validate architecture transfer. These runs
are not direct browser/WebLLM speed comparisons because TTFT instrumentation is
different.

## Artifacts Not Committed

- model weights
- model cache
- browser cache
- WebGPU local runtime cache

## Measurement Fields

Browser exports record:

- cache state
- WebGPU status
- TTFT
- total latency
- output tokens
- tokens per second
- deterministic lane markers
- postprocess actions
