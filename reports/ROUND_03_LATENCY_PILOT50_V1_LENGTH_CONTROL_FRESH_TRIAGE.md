# Round 03 300 Latency Triage

Generated: 2026-06-09T10:42:17.138Z

This is a post-run analysis of the existing Round 03 300-query
`top3_gold_contract_source_rights` WebLLM/Qwen run. It does not rerun the
model, change prompts, alter labels, or modify evidence. Generated answers
remain experimental outputs and are not archive evidence.

## Summary

| Metric | Value |
|---|---:|
| Rows | 50 |
| Contract failures | 0 |
| Contract warnings | 0 |
| Gate blocking findings | 0 |
| Gate performance observations | 9 |
| Avg TTFT ms | 2823.3 |
| P95 TTFT ms | 6227.5 |
| Avg total latency ms | 6649.8 |
| P50 total latency ms | 7002.2 |
| P95 total latency ms | 15987.7 |
| Max total latency ms | 17315.6 |
| Avg tokens/s | 11.78 |
| Slow rows > 10000 ms | 5 |
| Low-speed rows < 5.89 tokens/s | 9 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.873 | 0.938 |
| prompt_tokens_est -> total_latency_ms | 0.643 | 0.656 |
| output_tokens -> total_latency_ms | 0.719 | 0.674 |
| evidence_chars -> prompt_tokens_est | 0.699 | 0.521 |
| candidate_count -> total_latency_ms | 0.598 | 0.632 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| region_period_recommendation | 12 | 9371.8 | 16704.2 | 16738 | 3671.3 | 6.32 | 3 | 4 |
| more_context | 12 | 8827.1 | 16122.3 | 17315.6 | 4632.4 | 10 | 2 | 2 |
| source_rights_question | 10 | 7221.6 | 7926 | 8343.9 | 1687.9 | 8.42 | 0 | 1 |
| comparison | 4 | 4727.8 | 5355.5 | 5378.6 | 2714.5 | 6.24 | 0 | 2 |
| current_object_explanation | 2 | 4750 | 5073.5 | 5109.4 | 2999.8 | 13.79 | 0 | 0 |
| archive_orientation | 3 | 2077.4 | 2521.2 | 2590.2 | 1267.5 | 24.76 | 0 | 0 |
| method_process_question | 2 | 1737.6 | 1786.9 | 1792.4 | 1026 | 23.17 | 0 | 0 |
| first_earliest_claim | 3 | 753.9 | 760.1 | 760.4 | 383.5 | 27 | 0 | 0 |
| no_evidence_refusal | 2 | 753.9 | 758.4 | 758.9 | 389.5 | 27.45 | 0 | 0 |

## Slow Query Triage

Rows above 10000 ms:

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens | Output tokens | Evidence chars | Main signal | Recommendation |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BQ173 | more_context | 17315.599999427795 | 6240.599999427795 | 9.300225733634312 | 913 | 103 | 11128 | total_latency_tail+long_output+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ131 | region_period_recommendation | 16738 | 5742.300000190735 | 6.002346371867627 | 793 | 66 | 10115 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ136 | region_period_recommendation | 16676.5 | 5336 | 4.232617609452846 | 711 | 48 | 10062 | total_latency_tail+low_decode_speed+large_evidence_text | Use route-specific field summaries and length control. |
| BQ176 | more_context | 15145.900000572205 | 4911.700000762939 | 8.305485529067651 | 817 | 85 | 9475 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ130 | region_period_recommendation | 10564.400000572205 | 3428.9000005722046 | 9.950248756218905 | 745 | 71 | 10115 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |

## Repeated Evidence In Slow Rows

| Evidence ID | Slow rows | All rows | Avg total ms | Avg evidence chars |
| --- | ---: | ---: | ---: | ---: |
| SURF-CRG2026R0052 | 3 | 3 | 14149.4 | 9901.7 |
| SURF-GAX1970R001 | 3 | 15 | 9014.5 | 9510.1 |
| SURF-CRG2026R0175 | 2 | 7 | 11082.7 | 11027.1 |

## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | 5 | 3769.5 | 753.9 | hybrid_system_latency |
| Source/rights | 10 | 72215.6 | 7221.6 | hybrid_system_latency |
| Combined deterministic candidates | 15 | 75985.1 | 5065.7 | hybrid_system_latency |

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
