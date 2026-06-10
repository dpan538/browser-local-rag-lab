# V4.1 0.5-1B Model Comparison

Generated: 2026-06-10

## Purpose

This note adds a 0.5-1B scale comparison to the V4.1 cross-model evidence.
The prior V4.1 runs established:

- SmolLM2-135M: contract-safe but prose-quality limited.
- SmolLM2-360M: contract-safe, quality-gate clean, and selected for the full
  300-query cross-model run.

The additional comparison uses `onnx-community/Llama-3.2-1B-Instruct-ONNX`, a
Transformers.js-compatible ONNX conversion of Meta's Llama 3.2 1B Instruct
model. This gives the paper a non-Qwen, roughly 1B-parameter comparison point.

References checked before the run:

- `https://huggingface.co/onnx-community/Llama-3.2-1B-Instruct-ONNX`
- `https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct`

The Qwen2.5 0.5B ONNX model remains available as a family-internal fallback,
but the first 0.5-1B comparison should be non-Qwen to better support the
model-agnostic architecture claim.

## Pilot50 Result

| Model | Completed | Errors | Contract Fail | Contract Warn | Quality Gates | Model Avg Latency | All-Row Avg Latency | Avg Tokens/s |
|---|---:|---:|---:|---:|---|---:|---:|---:|
| SmolLM2-360M-Instruct | 50/50 | 0 | 0 | 0 | Pass | 3106.3 ms | 2236.5 ms | 14.91 |
| Llama-3.2-1B-Instruct-ONNX | 50/50 | 0 | 0 | 0 | Pass | 9513.5 ms | 6849.7 ms | 4.35 |

As with the other Node Transformers.js runs, this runner does not expose true
streaming TTFT. The report conservatively records `ttft_ms` as equal to total
generation latency.

## Quality Gates

Llama-3.2-1B passed all pilot50 quality gates:

- Hallucination / unsupported fact gate: pass
- Misreading / overconfidence gate: pass
- Guardrail compliance gate: pass
- Usability gate: pass

Detailed Llama-3.2-1B pilot quality:

- Unsupported date count: 0
- Unsupported triple ratio: 0
- Unsupported entity ratio: 0.0278, below the 0.10 threshold
- Prompt leaks: 0
- Overconfidence ratio: 0
- Unwarranted inference ratio: 0
- First-claim violations: 0
- Too-short answers: 0
- Off-topic answers: 0

## Interpretation

The Llama 1B pilot strengthens the architecture claim:

1. The deterministic lanes and tag-injection contract work outside Qwen and
   outside the SmolLM family.
2. Prose quality can remain clean after post-processing on a larger non-Qwen
   model.
3. Larger model size does not automatically improve local runtime suitability:
   Llama-3.2-1B is quality-clean but roughly 3x slower than SmolLM2-360M in the
   same Node Transformers.js pilot path.

For the paper, this should be reported as a model-agnostic reliability
comparison, not a new latency winner. The fastest complete path remains the
Qwen/WebLLM V3.3 result; the cleanest non-Qwen 300-query validation remains
SmolLM2-360M.

## Decision

Do not promote Llama-3.2-1B to a 300-query full run unless the paper needs an
appendix-scale non-Qwen 1B stress run. The pilot50 already supplies the key
evidence: the reliability architecture transfers to a 1B non-Qwen model, but
the runtime cost is substantially higher.

## Files

- `reports/V41_LLAMA32_1B_PILOT50.md`
- `reports/v41_llama32_1b_pilot50.json`
- `reports/v41_llama32_1b_pilot50_answers.jsonl`
- `reports/HALLUCINATION_V41_LLAMA32_1B_PILOT50.md`
- `reports/MISREADING_V41_LLAMA32_1B_PILOT50.md`
- `reports/GUARDRAIL_COMPLIANCE_V41_LLAMA32_1B_PILOT50.md`
- `reports/QUALITY_USABILITY_V41_LLAMA32_1B_PILOT50.md`

