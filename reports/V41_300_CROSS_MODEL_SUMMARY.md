# V4.1 300-Query Cross-Model Summary

Generated: 2026-06-10

## Research Question

V4.1 asks whether the Round 03 architecture remains reliable when the prose
model is replaced by a different browser/local small language model family.

The selected full-run model is `HuggingFaceTB/SmolLM2-360M-Instruct`, executed
through Node Transformers.js. This is not a WebLLM/WebGPU measurement. It is a
cross-model reliability check using the same deterministic lanes, prose
polisher, and evidence-tag injection layer.

## Pipeline

- Dataset: Round 03 300-query fixture
- Evidence variant: `top3_gold_contract_source_rights`
- Deterministic lanes: refusal and source/rights
- Model lanes: all remaining prose-generation rows
- Prose safety: `polish_prose`
- Field contract: post-generation evidence tag injection

## Headline Result

| Metric | Result |
|---|---:|
| Total rows | 300 |
| Completed rows | 300 |
| Runtime errors | 0 |
| Deterministic hybrid rows | 109 |
| SmolLM2-360M model-generation rows | 191 |
| Contract failures | 0 |
| Contract warnings | 0 |
| Metric validity issues | 0 |
| All-row average total latency | 2649.7 ms |
| Model-row average total latency | 4161.9 ms |
| Model-row average tokens/s | 11.68 |
| Average prompt tokens estimate | 344.4 |

Node Transformers.js does not expose true streaming TTFT in this runner, so
`ttft_ms` is conservatively recorded as equal to total generation latency. Do
not compare this TTFT directly with browser WebLLM streaming TTFT.

## Quality Gates

| Gate | Result |
|---|---|
| Hallucination / unsupported facts | Pass |
| Misreading / overconfidence | Pass |
| Guardrail compliance | Pass |
| Usability | Pass |

Detailed quality results:

- Unsupported date count: 0
- Unsupported triple ratio: 0
- Unsupported entity ratio: 0.0314, below the 0.10 threshold
- Prompt leaks: 0
- Overconfidence ratio: 0
- Unwarranted inference ratio: 0
- Absolute term violations: 0
- First-claim violations: 0
- Too-short answers: 0
- Off-topic answers: 0

## Pilot-To-Full Decision Trail

The pilot compared two non-Qwen models:

- SmolLM2-135M passed the field contract but failed the hallucination/entity
  gate because its prose leaked prompt and HTML artifacts.
- SmolLM2-360M passed all pilot quality gates and was promoted to the full
  300-query run.

This distinction is important: the contract layer is model-agnostic, but prose
quality remains model-capacity dependent.

## Interpretation

V4.1 supports the central architecture claim:

1. Deterministic lanes and tag injection keep the field contract stable across
   model families.
2. The prose polisher remains effective outside Qwen/WebLLM.
3. A different small model can preserve zero contract failures and pass the
   quality gates when the system owns refusal, rights, and field citation.

The cost is latency. SmolLM2-360M is slower than the optimized Qwen/WebLLM V3.3
path, and this run should be reported as a cross-model reliability validation,
not as the fastest runtime.

## Files

- `reports/V41_SMOLLM2_360M_300.md`
- `reports/v41_smollm2_360m_300.json`
- `reports/v41_smollm2_360m_300_answers.jsonl`
- `reports/HALLUCINATION_V41_SMOLLM2_360M_300.md`
- `reports/MISREADING_V41_SMOLLM2_360M_300.md`
- `reports/GUARDRAIL_COMPLIANCE_V41_SMOLLM2_360M_300.md`
- `reports/QUALITY_USABILITY_V41_SMOLLM2_360M_300.md`

