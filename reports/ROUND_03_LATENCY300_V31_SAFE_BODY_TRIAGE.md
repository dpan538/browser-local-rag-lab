# Round 03 300 Latency Triage

Generated: 2026-06-09T14:45:09.813Z

This is a post-run analysis of the existing Round 03 300-query
`top3_gold_contract_source_rights` WebLLM/Qwen run. It does not rerun the
model, change prompts, alter labels, or modify evidence. Generated answers
remain experimental outputs and are not archive evidence.

## Summary

| Metric | Value |
|---|---:|
| Rows | 300 |
| Qwen model-generation rows | 191 |
| Deterministic hybrid rows | 109 |
| Contract failures | null |
| Contract warnings | null |
| Gate blocking findings | null |
| Gate performance observations | null |
| Avg TTFT ms | 765.4 |
| P95 TTFT ms | 1469.7 |
| Avg total latency ms | 1973.8 |
| P50 total latency ms | 1924.3 |
| P95 total latency ms | 6368.4 |
| Max total latency ms | 8766.7 |
| Avg tokens/s | 9.33 |
| Qwen avg TTFT ms | 1202.2 |
| Qwen P95 TTFT ms | 1520.5 |
| Qwen avg total latency ms | 3100.3 |
| Qwen P95 total latency ms | 7861.1 |
| Qwen avg tokens/s | 14.66 |
| Hybrid avg total latency ms | 0 |
| Slow rows > 10000 ms | 0 |
| Low-speed rows < 7.33 tokens/s | 26 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.633 | 0.591 |
| prompt_tokens_est -> total_latency_ms | 0.117 | 0.15 |
| output_tokens -> total_latency_ms | 0.914 | 0.651 |
| evidence_chars -> prompt_tokens_est | 0.438 | 0.572 |
| candidate_count -> total_latency_ms | 0.126 | 0.012 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| archive_orientation | 22 | 3247.5 | 8747.6 | 8766.7 | 1367.4 | 20.68 | 0 | 0 |
| region_period_recommendation | 34 | 3628.2 | 8245.7 | 8510.3 | 1088.9 | 15.19 | 0 | 0 |
| casual_archive_help | 22 | 3593.5 | 7845.7 | 7951.4 | 1175.3 | 16.8 | 0 | 0 |
| comparison | 38 | 3576.2 | 5585.8 | 8146.7 | 1230.2 | 7.32 | 0 | 23 |
| more_context | 24 | 2914.4 | 3767 | 6799.1 | 1373.9 | 13.38 | 0 | 1 |
| method_process_question | 22 | 2082.4 | 3376.4 | 3788.4 | 1027.5 | 21.42 | 0 | 0 |
| current_object_explanation | 32 | 2082.4 | 2858.3 | 3182.8 | 1072.8 | 12.15 | 0 | 2 |
| source_rights_question | 36 | 0 | 0.1 | 0.2 | 0 | 0 | 0 | 0 |
| first_earliest_claim | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| no_evidence_refusal | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

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
| Refusal expected | 73 | 0 | 0 | hybrid_system_latency |
| Source/rights | 36 | 1.5 | 0 | hybrid_system_latency |
| Combined deterministic candidates | 109 | 1.5 | 0 | hybrid_system_latency |

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
