# Experiment Status

Updated: 2026-06-11

This file is the paper-facing status ledger. It separates claims that are
currently supported from results that remain scaffolding, negative controls, or
review inputs.

## Final Controlled Condition

The current final controlled generation condition is:

```text
v3.3_contract_top3_300_delivered
```

It means:

- retrieval condition: `top3_gold_contract_source_rights`
- runtime: WebLLM custom browser runtime
- prose model: `Qwen3.5-0.8B-q4f16_1-MLC`
- answer system: deterministic refusal lane, deterministic source/rights lane,
  Qwen model-generation rows, V3.3 postprocessed prose, and deterministic
  evidence-tag injection
- scope: 300 total rows, 109 deterministic hybrid rows, 191 Qwen
  model-generation rows

## Claim Ledger

| Claim | Evidence | Paper Status | Boundary |
|---|---|---|---|
| Delivered answers can satisfy the evidence-field generation contract under the controlled packet condition. | `reports/WEBLLM_ROUND_03_LATENCY300_V33_POSTPROCESSED_PROSE.md`, `reports/STATISTICAL_EVIDENCE_V42.md` | Main-text ready with CI wording | Delivered-answer system claim, not raw Qwen claim. |
| V3.3 reduces model-row latency relative to V3.2 guarded prompts. | `reports/STATISTICAL_EVIDENCE_V42.md` | Main-text ready | Paired 191-row comparison; same Qwen/WebLLM setup. |
| Deterministic lanes protect refusal and source/rights fields. | `reports/RAW_VS_DELIVERED_V33.md`, `reports/V42_EVIDENCE_CLOSURE_ANALYSIS.md`, failure-mode reports | Main-text ready after raw-vs-delivered report generation | Architecture claim; source/rights lane is hybrid system latency, not Qwen generation. |
| Automated quality screens show low residual risk. | `reports/HALLUCINATION_V33_300.md`, `reports/MISREADING_V33_300.md`, `reports/GUARDRAIL_COMPLIANCE_V33_300.md`, `reports/QUALITY_USABILITY_V33_300.md` | Main-text ready with limitations | Automated screens are not a substitute for human semantic review. |
| Robustness probes handle unsupported chronology and contradictory dates. | `reports/V42_ROBUSTNESS_EVAL.md`, `reports/V42_ROBUSTNESS_SMOLLM2_360M.md` | Appendix or robustness subsection | 15-row miniset, not a broad adversarial benchmark. |
| Reliability architecture transfers across model families. | `reports/V41_FINAL_CROSS_MODEL_RECORD.md` | Main-text ready as architecture validation | TTFT is not directly comparable across WebLLM and Node Transformers.js. |
| Raw top-3/top-8 retrieval is sufficient for product retrieval claims. | `reports/RETRIEVAL_SUFFICIENCY_300.md`, `reports/RETRIEVAL_SUFFICIENCY_300_CONTRACT.md` | Not supported | Final generation uses controlled gold-injected packets to isolate generation. |
| Human semantic quality is fully adjudicated. | `reports/review_fixture_v33_300_stratified.json`, `reports/QUALITY_REVIEW_PROTOCOL_V33.md` | Pending | Fixture/protocol exists; reviewer decisions must be filled before semantic acceptance claims. |

## Required Wording

Use:

> controlled contract/gold-evidence generation condition

Do not write:

> end-to-end archive retrieval succeeded

Use:

> delivered-answer contract compliance

Do not write:

> raw Qwen output was fully faithful without system support

Use:

> browser-local measurement on this WebGPU setup

Do not write:

> hardware-general latency guarantee
