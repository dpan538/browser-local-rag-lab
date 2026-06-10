# V4.1 Pilot50 Cross-Model Comparison

Generated: 2026-06-10

## Purpose

V4.1 tests whether the Round 03 reliability architecture is model-agnostic.
The pipeline keeps deterministic refusal/source-rights lanes, post-generation
prose polishing, and evidence tag injection fixed, then swaps the prose model
from Qwen/WebLLM to Node Transformers.js SmolLM2 models.

The pilot uses the first 50 Round 03 queries:

- Total rows: 50
- Deterministic hybrid rows: 14
- External model-generation rows: 36
- Evidence contract variant: `top3_gold_contract_source_rights`
- Prompt family: V3.3 postprocessed prose

Node Transformers.js does not expose true streaming TTFT in this runner. For
these pilot reports, `ttft_ms` is conservatively recorded as equal to total
generation latency. This keeps metric validation strict without claiming a
browser-WebGPU TTFT measurement.

## Results

| Model | Completed | Errors | Contract Fail | Contract Warn | Quality Gate | Model Avg Latency | All-Row Avg Latency | Notes |
|---|---:|---:|---:|---:|---|---:|---:|---|
| SmolLM2-135M-Instruct | 50/50 | 0 | 0 | 0 | Failed hallucination gate | 2200.3 ms | 1584.2 ms | Contract layer works, but prose leaked prompt/HTML artifacts. |
| SmolLM2-360M-Instruct | 50/50 | 0 | 0 | 0 | Passed all gates | 3106.3 ms | 2236.5 ms | Selected for 300-query V4.1 run. |

## Quality Gate Detail

SmolLM2-135M passed contract, guardrail, misreading, and usability checks, but
failed the hallucination/entity gate:

- Unsupported date count: 0
- Unsupported triple ratio: 0
- Unsupported entity ratio: 0.1111, above the 0.10 threshold
- Failure source: prompt/HTML leakage terms such as `Question`, `Intent`,
  `Output`, `DOCTYPE`, and `DTD XHTML`

This is a useful failure mode rather than a pipeline failure. It shows that the
system contract can be made model-independent while prose quality remains
model-capacity dependent.

SmolLM2-360M passed all pilot gates:

- Hallucination: pass, unsupported dates 0, unsupported triples 0, unsupported
  entities 0
- Misreading: pass, prompt leaks 0, overconfidence 0, unwarranted inference 0
- Guardrail compliance: pass, absolute/inference/first-claim violations 0
- Usability: pass, too-short 0, off-topic 0

## Decision

Proceed to the 300-query V4.1 run with `HuggingFaceTB/SmolLM2-360M-Instruct`.

Do not promote SmolLM2-135M to 300. Preserve its pilot output as a negative
control demonstrating that deterministic lanes and tag injection protect the
contract, but cannot fully compensate for weak prose generation.

## Files

- `reports/V41_SMOLLM2_135M_PILOT50.md`
- `reports/V41_SMOLLM2_360M_PILOT50.md`
- `reports/HALLUCINATION_V41_SMOLLM2_135M_PILOT50.md`
- `reports/HALLUCINATION_V41_SMOLLM2_360M_PILOT50.md`
- `reports/MISREADING_V41_SMOLLM2_360M_PILOT50.md`
- `reports/GUARDRAIL_COMPLIANCE_V41_SMOLLM2_360M_PILOT50.md`
- `reports/QUALITY_USABILITY_V41_SMOLLM2_360M_PILOT50.md`

