# Round 03 300 Latency Triage

Generated: 2026-06-09T13:43:47.476Z

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
| Gate performance observations | 3 |
| Avg TTFT ms | 1836 |
| P95 TTFT ms | 4886.9 |
| Avg total latency ms | 7378.2 |
| P50 total latency ms | 8043 |
| P95 total latency ms | 16615.8 |
| Max total latency ms | 20602.5 |
| Avg tokens/s | 9.69 |
| Qwen avg TTFT ms | 2550 |
| Qwen P95 TTFT ms | 5374.8 |
| Qwen avg total latency ms | 10247.5 |
| Qwen P95 total latency ms | 17027.7 |
| Qwen avg tokens/s | 13.45 |
| Hybrid avg total latency ms | 0.1 |
| Slow rows > 10000 ms | 13 |
| Low-speed rows < 6.73 tokens/s | 3 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.906 | 0.708 |
| prompt_tokens_est -> total_latency_ms | 0.516 | 0.599 |
| output_tokens -> total_latency_ms | -0.243 | -0.097 |
| evidence_chars -> prompt_tokens_est | 0.219 | 0.312 |
| candidate_count -> total_latency_ms | -0.063 | -0.199 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| archive_orientation | 16 | 9538.1 | 17027.7 | 17257.4 | 1959.9 | 15.72 | 3 | 1 |
| more_context | 2 | 15919.7 | 16177.3 | 16205.9 | 6595.3 | 7.88 | 2 | 0 |
| casual_archive_help | 9 | 9150.2 | 15882.2 | 20602.5 | 1800.5 | 14.27 | 1 | 1 |
| region_period_recommendation | 5 | 5286.6 | 13592.2 | 13842.7 | 1895 | 3.51 | 2 | 0 |
| current_object_explanation | 3 | 12288.8 | 13585.2 | 13659.9 | 3839.8 | 8.66 | 3 | 1 |
| comparison | 2 | 11182.4 | 11207.5 | 11210.3 | 3354.4 | 8.24 | 2 | 0 |
| method_process_question | 2 | 8222.4 | 9118.6 | 9218.2 | 1672.5 | 14.35 | 0 | 0 |
| source_rights_question | 5 | 0.1 | 0.4 | 0.4 | 0.1 | 0 | 0 | 0 |
| first_earliest_claim | 3 | 0 | 0.1 | 0.1 | 0 | 0 | 0 | 0 |
| no_evidence_refusal | 3 | 0 | 0.1 | 0.1 | 0 | 0 | 0 | 0 |

## Slow Query Triage

Rows above 10000 ms:

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens | Output tokens | Evidence chars | Main signal | Recommendation |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BQ04 | casual_archive_help | 20602.5 | 2748.300000190735 | 5.0968399592797295 | 405 | 91 | 7213 | total_latency_tail+low_decode_speed | Monitor under current prompt budget. |
| BQ01 | archive_orientation | 17257.39999961853 | 4307.800000190735 | 8.340025947115912 | 409 | 108 | 8191 | total_latency_tail+long_output | Monitor under current prompt budget. |
| BQ03 | archive_orientation | 16951.099999427795 | 1908.2999992370605 | 6.248836652671586 | 465 | 94 | 9539 | total_latency_tail+low_decode_speed+large_evidence_text | Monitor under current prompt budget. |
| BQ26 | more_context | 16205.89999961853 | 6660.800000190735 | 8.171732093396182 | 1223 | 78 | 11715 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ25 | more_context | 15633.5 | 6529.89999961853 | 7.579419130575672 | 1223 | 69 | 11715 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ16 | region_period_recommendation | 13842.699999809265 | 4989.800000190735 | 8.81067220948627 | 918 | 78 | 11038 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ05 | current_object_explanation | 13659.900000572205 | 4454.800000190735 | 12.818980781861137 | 705 | 118 | 8831 | total_latency_tail+long_output | Prefer one primary object and move evidence tags before prose. |
| BQ07 | current_object_explanation | 12912.70000076294 | 4761.10000038147 | 5.7657392411061075 | 773 | 47 | 9695 | total_latency_tail+low_decode_speed+large_evidence_text | Prefer one primary object and move evidence tags before prose. |
| BQ14 | region_period_recommendation | 12590.39999961853 | 4485 | 8.759592370930678 | 728 | 71 | 8045 | total_latency_tail | Use route-specific field summaries and length control. |
| BQ13 | comparison | 11210.300000190735 | 3373.5 | 9.442629644523143 | 628 | 74 | 7285 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ12 | comparison | 11154.5 | 3335.300000190735 | 7.033967669498366 | 601 | 55 | 7285 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ06 | current_object_explanation | 10293.79999923706 | 2303.5 | 7.383953043769759 | 527 | 59 | 4234 | total_latency_tail | Prefer one primary object and move evidence tags before prose. |
| BQ032 | archive_orientation | 10220.39999961853 | 1865.3999996185303 | 14.721723518850986 | 498 | 123 | 11003 | total_latency_tail+long_output+large_evidence_text | Monitor under current prompt budget. |

## Repeated Evidence In Slow Rows

| Evidence ID | Slow rows | All rows | Avg total ms | Avg evidence chars |
| --- | ---: | ---: | ---: | ---: |
| SURF-COM1970R007 | 4 | 6 | 11725.7 | 9892.5 |
| SURF-GAX1970R001 | 4 | 16 | 6475.2 | 8500.3 |
| LAB-METHOD-CONTEXT-V0 | 3 | 6 | 10157.8 | 5635.3 |
| SURF-ER1830R015 | 2 | 2 | 18929.9 | 7702 |
| SURF-CRG2026R0274 | 2 | 3 | 13375.2 | 11923.3 |
| SURF-CRG2026R0051 | 2 | 3 | 13265.3 | 9919.7 |
| SURF-CRG2026R0071 | 2 | 4 | 12387.6 | 11519 |
| SURF-CRG2026R0235 | 2 | 4 | 9299.5 | 9219.5 |
| SURF-GAX1970R002 | 2 | 4 | 7485.7 | 8766.3 |
| SURF-CRG2026R0001 | 2 | 9 | 7461.1 | 10385.4 |

## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | 9 | 0.3 | 0 | hybrid_system_latency |
| Source/rights | 5 | 0.6 | 0.1 | hybrid_system_latency |
| Combined deterministic candidates | 14 | 0.9 | 0.1 | hybrid_system_latency |

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
