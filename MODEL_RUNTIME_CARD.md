# Model Runtime Card

## Primary Browser Runtime

- model id: `Qwen3.5-0.8B-q4f16_1-MLC`
- runtime: WebLLM/MLC custom browser runtime
- browser path: `browser_lab/webllm_round.html`
- product status: research-only, not an archive product runtime path

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
