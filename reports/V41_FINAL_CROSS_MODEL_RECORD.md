# V4.1 Final Cross-Model Record

Generated: 2026-06-11

## Purpose

This record consolidates the V4.1 cross-model evidence for paper use. V4.1 is
not a speed-optimization round. It is an architecture-validation round that
asks whether the reliability layer remains stable when the prose model and
runtime change.

The fixed architecture across V4.1 runs is:

- deterministic refusal lane
- deterministic source/rights lane
- V3.3 post-generation prose polishing
- deterministic evidence-tag injection
- evidence-field contract validation

## Measurement Protocol Caveat

Qwen/WebLLM and Node Transformers.js expose different timing surfaces.

- Qwen/WebLLM V3.3 reports a streaming browser/WebLLM TTFT.
- Node Transformers.js runs in V4.1 do not expose true streaming TTFT through
  the current runner.
- For Node Transformers.js reports, `ttft_ms` is conservatively recorded as
  equal to total generation latency.

Therefore, Node Transformers.js TTFT-like values are not directly comparable to
Qwen/WebLLM TTFT. Cross-model comparison should focus on contract compliance,
quality-gate outcomes, and model-row total latency, not raw TTFT.

## Cross-Model Summary

| Model / Runtime | Scope | Completed | Contract Fail | Contract Warn | Quality Gates | Model Avg Total Latency | All-Row Avg Total Latency | Interpretation |
|---|---:|---:|---:|---:|---|---:|---:|---|
| Qwen3.5-0.8B / WebLLM V3.3 | 300 | 300/300 | 0 | 0 | Pass | ~2490 ms | ~1590 ms | Fastest complete browser-local path. |
| SmolLM2-135M / Node Transformers.js | pilot50 | 50/50 | 0 | 0 | Failed hallucination/entity gate | 2200.3 ms | 1584.2 ms | Negative prose-capacity control. |
| SmolLM2-360M / Node Transformers.js | 300 | 300/300 | 0 | 0 | Pass | 4161.9 ms | 2649.7 ms | Full non-Qwen-family reliability validation. |
| Llama-3.2-1B / Node Transformers.js | pilot50 | 50/50 | 0 | 0 | Pass | 9513.5 ms | 6849.7 ms | 1B non-Qwen reliability check; too slow for full-run promotion. |

## SmolLM2-135M As A Negative Control

SmolLM2-135M passed the field contract gate with zero contract violations, but
failed the hallucination/entity gate because its prose leaked prompt and HTML
artifacts such as `Question`, `Intent`, `Output`, `DOCTYPE`, and `DTD XHTML`.

This is not a pipeline failure. It is direct evidence for the architecture's
separation of concerns:

- deterministic lanes and tag injection protected the evidence contract even
  when prose quality degraded;
- prose quality remained model-capacity dependent;
- the system can prevent weak prose from corrupting source/rights/refusal
  fields, but it cannot make an underpowered prose model write clean text.

This should be reported as a useful failure mode: field reliability is
decoupled from generative capability, but user-facing prose still requires an
adequate model.

## Llama-3.2-1B Pilot Interpretation

The Llama-3.2-1B pilot strengthens model-family generalization. It passed
contract and quality gates under the same V4.1 pipeline, showing that the
architecture is not Qwen-specific and not SmolLM-specific.

The latency result is the important caveat. The Llama 1B model-row average
latency was 9513.5 ms in this Node Transformers.js path, roughly 3x slower than
SmolLM2-360M pilot latency. This makes Llama 1B useful as a reliability
comparison, not as a full-run latency candidate.

## Paper Claim Supported

V4.1 supports this claim:

> Replacing the prose model while keeping deterministic lanes, evidence-tag
> injection, prose polishing, and contract validation fixed preserves zero
> evidence-field contract failures. Prose quality and latency remain
> model/runtime dependent, but the field reliability architecture is
> model-agnostic.

## Files

- `reports/V41_PILOT50_CROSS_MODEL_COMPARISON.md`
- `reports/V41_300_CROSS_MODEL_SUMMARY.md`
- `reports/V41_05_1B_MODEL_COMPARISON.md`
- `reports/V41_SMOLLM2_135M_PILOT50.md`
- `reports/V41_SMOLLM2_360M_PILOT50.md`
- `reports/V41_SMOLLM2_360M_300.md`
- `reports/V41_LLAMA32_1B_PILOT50.md`

