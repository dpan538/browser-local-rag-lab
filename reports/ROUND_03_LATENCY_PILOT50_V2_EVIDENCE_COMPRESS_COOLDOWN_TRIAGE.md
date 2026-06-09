# Round 03 300 Latency Triage

Generated: 2026-06-09T11:55:32.045Z

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
| Gate performance observations | 1 |
| Avg TTFT ms | 3113.6 |
| P95 TTFT ms | 4924.1 |
| Avg total latency ms | 10502.1 |
| P50 total latency ms | 11321.7 |
| P95 total latency ms | 14852.7 |
| Max total latency ms | 16129.5 |
| Avg tokens/s | 9.51 |
| Slow rows > 10000 ms | 32 |
| Low-speed rows < 4.76 tokens/s | 1 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.971 | 0.95 |
| prompt_tokens_est -> total_latency_ms | 0.902 | 0.896 |
| output_tokens -> total_latency_ms | 0.529 | 0.362 |
| evidence_chars -> prompt_tokens_est | 0.703 | 0.522 |
| candidate_count -> total_latency_ms | 0.848 | 0.55 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| current_object_explanation | 2 | 14818 | 15846 | 15960.2 | 4930 | 6.32 | 2 | 0 |
| more_context | 12 | 13514.1 | 15438.3 | 16129.5 | 4543.2 | 6.73 | 12 | 0 |
| region_period_recommendation | 12 | 12069.9 | 13402.4 | 13824.9 | 3887.8 | 9.31 | 12 | 0 |
| comparison | 4 | 11040.9 | 12801.5 | 13069.6 | 3097 | 8.44 | 3 | 0 |
| archive_orientation | 3 | 9840.5 | 11768.6 | 12102.5 | 2037.6 | 16.41 | 1 | 0 |
| source_rights_question | 10 | 9554.4 | 10430.9 | 10521.3 | 2042 | 6.17 | 2 | 1 |
| method_process_question | 2 | 6945.6 | 7022.6 | 7031.1 | 1515.3 | 15.47 | 0 | 0 |
| first_earliest_claim | 3 | 1097.4 | 1167.1 | 1178.1 | 556.7 | 18.55 | 0 | 0 |
| no_evidence_refusal | 2 | 1025.3 | 1038.1 | 1039.5 | 514 | 19.56 | 0 | 0 |

## Slow Query Triage

Rows above 10000 ms:

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens | Output tokens | Evidence chars | Main signal | Recommendation |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BQ176 | more_context | 16129.5 | 4850.199999809265 | 8.688482441139326 | 914 | 98 | 9475 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ213 | current_object_explanation | 15960.20000076294 | 5309.300000190735 | 4.976105305387587 | 831 | 53 | 10962 | total_latency_tail+large_evidence_text | Prefer one primary object and move evidence tags before prose. |
| BQ173 | more_context | 14872.699999809265 | 4788.300000190735 | 5.453968506017267 | 1017 | 55 | 11128 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ260 | more_context | 14828.199999809265 | 4816.299999237061 | 7.790729032006124 | 963 | 78 | 10916 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ167 | more_context | 14098.60000038147 | 5197.60000038147 | 5.72969329288844 | 991 | 51 | 11932 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ165 | more_context | 13931.199999809265 | 4297.39999961853 | 6.331873196328789 | 835 | 61 | 10735 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ244 | region_period_recommendation | 13824.900000572205 | 4530.60000038147 | 8.284647579529372 | 852 | 77 | 12549 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ065 | current_object_explanation | 13675.699999809265 | 4550.60000038147 | 7.671148809809148 | 758 | 70 | 8840 | total_latency_tail | Prefer one primary object and move evidence tags before prose. |
| BQ174 | more_context | 13464.39999961853 | 4984.599999427795 | 5.188801622563069 | 984 | 44 | 12020 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ25 | more_context | 13402.79999923706 | 4408.699999809265 | 7.671695890015652 | 966 | 69 | 11715 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ26 | more_context | 13183.199999809265 | 4538.699999809265 | 7.634912372028457 | 966 | 66 | 11715 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ104 | comparison | 13069.599999427795 | 3391.2999992370605 | 7.852618744872781 | 592 | 76 | 8074 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ131 | region_period_recommendation | 13056.70000076294 | 4201.200000762939 | 13.21212805601039 | 849 | 117 | 10115 | total_latency_tail+long_output+large_evidence_text | Use route-specific field summaries and length control. |
| BQ136 | region_period_recommendation | 12711.199999809265 | 3725.800000190735 | 6.900082356114606 | 738 | 62 | 10062 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ166 | more_context | 12684.099999427795 | 4779.699999809265 | 7.590708972584336 | 1000 | 60 | 11063 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ130 | region_period_recommendation | 12634.10000038147 | 4687.60000038147 | 8.683068017366136 | 784 | 69 | 10115 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ169 | more_context | 12398.699999809265 | 4480 | 7.5770012756443865 | 890 | 60 | 8783 | total_latency_tail | Compress context skeleton and cap answer length. |
| BQ132 | region_period_recommendation | 12355.400000572205 | 3535.300000190735 | 10.657475538365155 | 736 | 94 | 10121 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ243 | region_period_recommendation | 12219.39999961853 | 3783.199999809265 | 8.179037955662505 | 887 | 69 | 12108 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ242 | region_period_recommendation | 12158.800000190735 | 4579.900000572205 | 10.159785721394352 | 851 | 77 | 12535 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ032 | archive_orientation | 12102.5 | 1962.8999996185303 | 12.13065604120207 | 498 | 123 | 11003 | total_latency_tail+long_output+large_evidence_text | Monitor under current prompt budget. |
| BQ172 | more_context | 12042.099999427795 | 4097.799999237061 | 5.7903150685265645 | 915 | 46 | 11004 | total_latency_tail+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ138 | region_period_recommendation | 11430.699999809265 | 3578 | 5.603168337141202 | 687 | 44 | 9873 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ141 | region_period_recommendation | 11400.5 | 3721.5 | 10.157572600599035 | 754 | 78 | 10472 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ137 | region_period_recommendation | 11361 | 3446.6000003814697 | 8.465581724859668 | 727 | 67 | 9981 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ110 | comparison | 11282.300000190735 | 3985.8999996185303 | 6.8526944789319195 | 769 | 50 | 8863 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ162 | more_context | 11133.300000190735 | 3278.5999994277954 | 5.347117012224588 | 782 | 42 | 8158 | total_latency_tail | Compress context skeleton and cap answer length. |
| BQ142 | region_period_recommendation | 11055.699999809265 | 3297.300000190735 | 8.635801196547522 | 628 | 67 | 8045 | total_latency_tail | Use route-specific field summaries and length control. |
| BQ129 | region_period_recommendation | 10629.900000572205 | 3567 | 12.742641123718105 | 741 | 90 | 10319 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ226 | source_rights_question | 10521.300000190735 | 2784.699999809265 | 8.530879197159699 | 597 | 66 | 13172 | total_latency_tail+large_evidence_text | Hybrid deterministic source/rights lane can return exact evidence fields. |

## Repeated Evidence In Slow Rows

| Evidence ID | Slow rows | All rows | Avg total ms | Avg evidence chars |
| --- | ---: | ---: | ---: | ---: |
| SURF-GAX1970R001 | 10 | 15 | 10945.5 | 9510.1 |
| SURF-CRG2026R0175 | 7 | 7 | 13033.4 | 11027.1 |
| SURF-CRG2026R0002 | 4 | 4 | 12859 | 10469.8 |
| SURF-CRG2026R0005 | 4 | 5 | 12721.3 | 10486.8 |
| SURF-GA1970R001 | 4 | 4 | 12476.1 | 8612.5 |
| SURF-CRG2026R0071 | 4 | 5 | 12152.4 | 10953.2 |
| SURF-CRG2026R0100 | 4 | 5 | 11726 | 11020 |
| SURF-CRG2026R0052 | 3 | 3 | 13940.1 | 9901.7 |
| SURF-CRG2026R0051 | 3 | 3 | 11788.8 | 10479 |
| SURF-CRG2026R0027 | 3 | 4 | 11714.6 | 12251 |
| SURF-CGS2026R0328 | 3 | 5 | 11642.7 | 9748.2 |
| SURF-CRG2026R0001 | 3 | 5 | 11415.5 | 11356.4 |
| SURF-CRG2026R0153 | 3 | 4 | 11270.8 | 11593.3 |
| SURF-CGS2026R0909 | 3 | 6 | 10492.5 | 11586.5 |
| SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES | 3 | 8 | 10134.8 | 8811.1 |
| SURF-CHW2026R001 | 2 | 2 | 14818 | 9901 |
| SURF-COM1970R007 | 2 | 2 | 13293 | 11715 |
| SURF-CRG2026R0274 | 2 | 2 | 13293 | 11715 |
| SURF-CRG2026R0032 | 2 | 2 | 13022.2 | 12328.5 |
| SURF-CRG2026R0050 | 2 | 2 | 12047.2 | 11169.5 |

## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | 5 | 5342.8 | 1068.6 | hybrid_system_latency |
| Source/rights | 10 | 95543.7 | 9554.4 | hybrid_system_latency |
| Combined deterministic candidates | 15 | 100886.5 | 6725.8 | hybrid_system_latency |

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
