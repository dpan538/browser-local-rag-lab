# Round 03 300 Latency Triage

Generated: 2026-06-08T13:06:23.146Z

This is a post-run analysis of the existing Round 03 300-query
`top3_gold_contract_source_rights` WebLLM/Qwen run. It does not rerun the
model, change prompts, alter labels, or modify evidence. Generated answers
remain experimental outputs and are not archive evidence.

## Summary

| Metric | Value |
|---|---:|
| Rows | 300 |
| Contract failures | 0 |
| Contract warnings | 0 |
| Gate blocking findings | 0 |
| Gate performance observations | 30 |
| Avg TTFT ms | 1965.8 |
| P95 TTFT ms | 4566.3 |
| Avg total latency ms | 6433.4 |
| P50 total latency ms | 6863.3 |
| P95 total latency ms | 11673.1 |
| Max total latency ms | 14291.6 |
| Avg tokens/s | 17.02 |
| Slow rows > 10000 ms | 53 |
| Low-speed rows < 8.51 tokens/s | 30 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.976 | 0.969 |
| prompt_tokens_est -> total_latency_ms | 0.95 | 0.952 |
| output_tokens -> total_latency_ms | 0.664 | 0.47 |
| evidence_chars -> prompt_tokens_est | 0.717 | 0.65 |
| candidate_count -> total_latency_ms | 0.826 | 0.672 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| more_context | 24 | 11100.2 | 13002.2 | 14291.6 | 4223.6 | 10.78 | 19 | 6 |
| region_period_recommendation | 34 | 9687.9 | 12359.6 | 13550.9 | 3489 | 12.38 | 19 | 5 |
| current_object_explanation | 32 | 9622.1 | 11159.5 | 11456.1 | 3184.7 | 11.75 | 10 | 3 |
| comparison | 38 | 8784.2 | 10534.6 | 11940.4 | 2635 | 11.45 | 5 | 5 |
| source_rights_question | 36 | 6524.2 | 7701.7 | 8424.8 | 1360.4 | 9.47 | 0 | 11 |
| casual_archive_help | 22 | 5946.6 | 7370 | 7382.6 | 1423.7 | 21.62 | 0 | 0 |
| method_process_question | 22 | 6214.5 | 6954.5 | 6994.1 | 1266.5 | 19.43 | 0 | 0 |
| archive_orientation | 22 | 6217 | 6840 | 6955.2 | 1479.8 | 23.08 | 0 | 0 |
| first_earliest_claim | 35 | 764 | 779.8 | 790 | 382.4 | 26.24 | 0 | 0 |
| no_evidence_refusal | 35 | 759.9 | 778 | 779.4 | 389.2 | 27.01 | 0 | 0 |

## Slow Query Triage

Rows above 10000 ms:

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens | Output tokens | Evidence chars | Main signal | Recommendation |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BQ166 | more_context | 14291.599999904633 | 6806 | 16.030779096068294 | 1282 | 120 | 11063 | total_latency_tail+large_prompt+long_output+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ131 | region_period_recommendation | 13550.89999961853 | 4982.699999809265 | 7.002637660341221 | 1099 | 60 | 10115 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ167 | more_context | 13042.299999713898 | 5451.799999713898 | 6.323694091298334 | 1258 | 48 | 11932 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ174 | more_context | 12774.800000190735 | 5165.300000190735 | 7.227807346080557 | 1247 | 55 | 12020 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ132 | region_period_recommendation | 12708.60000038147 | 5088.200000286102 | 10.366909873367716 | 948 | 79 | 10121 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ173 | more_context | 12544.699999809265 | 5130.400000095367 | 5.529854470628663 | 1299 | 41 | 11128 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ136 | region_period_recommendation | 12171.699999809265 | 4502.599999904633 | 8.345177400320226 | 935 | 64 | 10062 | total_latency_tail+low_decode_speed+large_evidence_text | Use route-specific field summaries and length control. |
| BQ129 | region_period_recommendation | 12023.5 | 4738 | 8.784572095257705 | 937 | 64 | 10319 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ110 | comparison | 11940.400000095367 | 4952.200000286102 | 8.585901949234085 | 1029 | 60 | 8863 | total_latency_tail+large_prompt | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ176 | more_context | 11891.599999904633 | 4678.799999713898 | 13.309671694412902 | 1142 | 96 | 9475 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ260 | more_context | 11755.900000095367 | 4599 | 11.178024004657601 | 1221 | 80 | 10916 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ130 | region_period_recommendation | 11732.5 | 4542.400000095367 | 9.59652856023076 | 1002 | 69 | 10115 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ25 | more_context | 11718.199999809265 | 4864.199999809265 | 10.06711409395973 | 1223 | 69 | 11715 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ26 | more_context | 11692.900000095367 | 4951.300000190735 | 13.646612080411392 | 1223 | 92 | 11715 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ242 | region_period_recommendation | 11687.699999809265 | 4579 | 9.143725294602955 | 1119 | 65 | 12535 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ243 | region_period_recommendation | 11672.299999713898 | 4643 | 8.393438891838645 | 1175 | 59 | 12108 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ244 | region_period_recommendation | 11585.900000095367 | 4566.099999904633 | 9.829339866965613 | 1121 | 69 | 12549 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ213 | current_object_explanation | 11456.099999904633 | 4520.799999713898 | 8.074632676086093 | 1076 | 56 | 10962 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Prefer one primary object and move evidence tags before prose. |
| BQ065 | current_object_explanation | 11453.400000095367 | 4286.5 | 12.278669996627414 | 999 | 88 | 8840 | total_latency_tail | Prefer one primary object and move evidence tags before prose. |
| BQ141 | region_period_recommendation | 11345.099999904633 | 4208.599999904633 | 13.451972255307224 | 956 | 96 | 10472 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ137 | region_period_recommendation | 11316.900000095367 | 3893.800000190735 | 10.642453961419749 | 925 | 79 | 9981 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ172 | more_context | 11230.099999904633 | 4570.700000286102 | 10.51145748926477 | 1153 | 70 | 11004 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ104 | comparison | 11207 | 3813.5 | 9.197267870426726 | 787 | 68 | 8074 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ165 | more_context | 11170.699999809265 | 4101.900000095367 | 10.185604346270106 | 1050 | 72 | 10735 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ169 | more_context | 11113 | 4171.60000038147 | 7.203157864803611 | 1072 | 50 | 8783 | total_latency_tail+low_decode_speed+large_prompt | Compress context skeleton and cap answer length. |
| BQ142 | region_period_recommendation | 10943.699999809265 | 3576.7999997138977 | 6.78711534015023 | 732 | 50 | 8045 | total_latency_tail+low_decode_speed | Use route-specific field summaries and length control. |
| BQ066 | current_object_explanation | 10919 | 4259.599999904633 | 12.914076343029166 | 999 | 86 | 8848 | total_latency_tail | Prefer one primary object and move evidence tags before prose. |
| BQ058 | current_object_explanation | 10891.099999904633 | 3785.800000190735 | 11.540680900637808 | 807 | 82 | 8745 | total_latency_tail | Prefer one primary object and move evidence tags before prose. |
| BQ059 | current_object_explanation | 10846.5 | 3771.300000190735 | 11.731117141881153 | 791 | 83 | 8304 | total_latency_tail | Prefer one primary object and move evidence tags before prose. |
| BQ255 | more_context | 10832.799999713898 | 4000.0999999046326 | 14.489147775076264 | 1052 | 99 | 10753 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |

## Repeated Evidence In Slow Rows

| Evidence ID | Slow rows | All rows | Avg total ms | Avg evidence chars |
| --- | ---: | ---: | ---: | ---: |
| SURF-GAX1970R001 | 15 | 65 | 7954.8 | 8890.8 |
| SURF-CHW2026R001 | 10 | 36 | 9292.8 | 8338.2 |
| SURF-CRG2026R0175 | 9 | 16 | 9853.1 | 10377.7 |
| LAB-METHOD-CONTEXT-V0 | 8 | 57 | 7710.6 | 5619.1 |
| SURF-CRG2026R0005 | 5 | 7 | 10506.9 | 10356.4 |
| SURF-CRG2026R0274 | 5 | 7 | 10108.5 | 10466.9 |
| SURF-CRG2026R0004 | 5 | 7 | 9786.7 | 10875.6 |
| SURF-CGS2026R0328 | 5 | 13 | 9697.8 | 9943.4 |
| SURF-CRG2026R0002 | 5 | 11 | 9507.5 | 9420.1 |
| SURF-CRG2026R0071 | 4 | 7 | 9847 | 10813.7 |
| SURF-CRG2026R0027 | 4 | 8 | 9629.5 | 10351.6 |
| SURF-CGS2026R0681 | 4 | 9 | 9440.9 | 10343.3 |
| SURF-GA1970R001 | 4 | 8 | 9170.2 | 8777.9 |
| SURF-ER1830R046 | 4 | 9 | 8982.5 | 8314.4 |
| SURF-CRG2026R0100 | 4 | 11 | 8585.5 | 10338.5 |
| SURF-CRG2026R0001 | 4 | 15 | 8220.2 | 10729.7 |
| SURF-CRG2026R0020 | 3 | 6 | 10005.5 | 8834.2 |
| SURF-CRG2026R0003 | 3 | 6 | 9794.7 | 9171.3 |
| SURF-CRG2026R0153 | 3 | 8 | 9548.6 | 10103.6 |
| SURF-CRG2026R0052 | 3 | 6 | 9484.5 | 10178.5 |

## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | 73 | 55451.8 | 759.6 | hybrid_system_latency |
| Source/rights | 36 | 234869.6 | 6524.2 | hybrid_system_latency |
| Combined deterministic candidates | 109 | 290321.4 | 2663.5 | hybrid_system_latency |

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
