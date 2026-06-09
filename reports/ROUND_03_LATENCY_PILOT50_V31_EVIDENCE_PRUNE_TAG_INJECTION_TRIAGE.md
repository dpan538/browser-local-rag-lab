# Round 03 300 Latency Triage

Generated: 2026-06-09T13:58:04.503Z

This is a post-run analysis of the existing Round 03 300-query
`top3_gold_contract_source_rights` WebLLM/Qwen run. It does not rerun the
model, change prompts, alter labels, or modify evidence. Generated answers
remain experimental outputs and are not archive evidence.

## Summary

| Metric | Value |
|---|---:|
| Rows | 50 |
| Qwen model-generation rows | 36 |
| Deterministic hybrid rows | 14 |
| Contract failures | 0 |
| Contract warnings | 0 |
| Gate blocking findings | 0 |
| Gate performance observations | 0 |
| Avg TTFT ms | 1027.6 |
| P95 TTFT ms | 1847.3 |
| Avg total latency ms | 2440.9 |
| P50 total latency ms | 2170.1 |
| P95 total latency ms | 8650.5 |
| Max total latency ms | 8944.2 |
| Avg tokens/s | 10.6 |
| Qwen avg TTFT ms | 1427.2 |
| Qwen P95 TTFT ms | 1931.7 |
| Qwen avg total latency ms | 3390.1 |
| Qwen P95 total latency ms | 8718.8 |
| Qwen avg tokens/s | 14.72 |
| Hybrid avg total latency ms | 0 |
| Slow rows > 10000 ms | 0 |
| Low-speed rows < 7.36 tokens/s | 0 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.898 | 0.912 |
| prompt_tokens_est -> total_latency_ms | 0.385 | 0.664 |
| output_tokens -> total_latency_ms | 0.969 | 0.763 |
| evidence_chars -> prompt_tokens_est | 0.714 | 0.812 |
| candidate_count -> total_latency_ms | 0.211 | 0.265 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| archive_orientation | 16 | 4438 | 8801.3 | 8944.2 | 1471.6 | 16.59 | 0 | 0 |
| more_context | 2 | 4144.8 | 4400.8 | 4429.2 | 2078.3 | 11.14 | 0 | 0 |
| comparison | 2 | 3829.9 | 3974.8 | 3990.9 | 1377.8 | 8.42 | 0 | 0 |
| current_object_explanation | 3 | 2477.7 | 3023.9 | 3065.5 | 1549.2 | 9.4 | 0 | 0 |
| region_period_recommendation | 5 | 1103.4 | 2950.3 | 3078.2 | 667.3 | 4.88 | 0 | 0 |
| casual_archive_help | 9 | 2084.2 | 2319.2 | 2356.8 | 1226.8 | 14.9 | 0 | 0 |
| method_process_question | 2 | 1689.8 | 1874.2 | 1894.7 | 948.1 | 19.31 | 0 | 0 |
| source_rights_question | 5 | 0.1 | 0.2 | 0.2 | 0.1 | 0 | 0 | 0 |
| first_earliest_claim | 3 | 0 | 0.1 | 0.1 | 0 | 0 | 0 | 0 |
| no_evidence_refusal | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Slow Query Triage

Rows above 10000 ms:

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens | Output tokens | Evidence chars | Main signal | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Repeated Evidence In Slow Rows

| Evidence ID | Slow rows | All rows | Avg total ms | Avg evidence chars |
| --- | --- | --- | --- | --- |

## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | 9 | 0.1 | 0 | hybrid_system_latency |
| Source/rights | 5 | 0.3 | 0.1 | hybrid_system_latency |
| Combined deterministic candidates | 14 | 0.4 | 0 | hybrid_system_latency |

## Interpretation

- Round 03 is contract-clean at scale; the next bottleneck is latency and
  answer usability, not basic reliability.
- Prompt size has a visible relationship with TTFT, but the latency tail is
  lane-dependent. The heaviest tail is concentrated in `more_context`,
  `region_period_recommendation`, `comparison`, and
  `current_object_explanation`.
- Output length contributes to total latency, but low tokens/s rows show that
  generation speed also varies by lane and evidence shape, not just token
  count.
- Deterministic refusal and source/rights lanes are not a claim about Qwen
  generation capability. They should be measured separately as hybrid system
  latency because the system can return exact evidence fields or mandatory
  refusals without asking the model to paraphrase.

## Next Round 03 Optimization Order

1. Build `r03_v1_length_control`: same evidence, stricter answer length and
   evidence-tag placement.
2. Build `r03_v2_evidence_compress`: required-field-preserving evidence
   compression for context-heavy lanes.
3. Build `r03_v3_hybrid_deterministic_lanes`: deterministic refusal and
   source/rights output, reported as hybrid system latency.
4. Run 50-query pilots only. Expand to 300 only if contract fail remains 0
   and latency improves meaningfully.
