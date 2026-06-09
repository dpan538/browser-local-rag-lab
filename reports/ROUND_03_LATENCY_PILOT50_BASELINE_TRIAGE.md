# Round 03 300 Latency Triage

Generated: 2026-06-09T10:19:40.287Z

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
| Gate performance observations | 8 |
| Avg TTFT ms | 3242.2 |
| P95 TTFT ms | 5264.8 |
| Avg total latency ms | 9526 |
| P50 total latency ms | 10837.8 |
| P95 total latency ms | 13500 |
| Max total latency ms | 14490.5 |
| Avg tokens/s | 11.51 |
| Slow rows > 10000 ms | 31 |
| Low-speed rows < 5.76 tokens/s | 8 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.979 | 0.968 |
| prompt_tokens_est -> total_latency_ms | 0.923 | 0.934 |
| output_tokens -> total_latency_ms | 0.338 | 0.147 |
| evidence_chars -> prompt_tokens_est | 0.629 | 0.493 |
| candidate_count -> total_latency_ms | 0.775 | 0.49 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| region_period_recommendation | 12 | 11830.5 | 13973.1 | 14113.3 | 4364.1 | 9.55 | 12 | 1 |
| more_context | 12 | 12495.4 | 13704.8 | 14490.5 | 4879.9 | 7.6 | 12 | 3 |
| comparison | 4 | 11322.3 | 12413.4 | 12626.6 | 3780.4 | 7.59 | 4 | 1 |
| current_object_explanation | 2 | 11113.6 | 11305.3 | 11326.6 | 4400.7 | 9.9 | 2 | 0 |
| source_rights_question | 10 | 7835 | 9707.1 | 10327.3 | 1805.3 | 7.83 | 1 | 3 |
| archive_orientation | 3 | 7425.5 | 8226.2 | 8352.5 | 1589.7 | 21.17 | 0 | 0 |
| method_process_question | 2 | 6239.5 | 6529.6 | 6561.8 | 1246.3 | 20.22 | 0 | 0 |
| no_evidence_refusal | 2 | 758.2 | 760 | 760.2 | 393.2 | 27.4 | 0 | 0 |
| first_earliest_claim | 3 | 750.9 | 753 | 753.2 | 386.5 | 27.44 | 0 | 0 |

## Slow Query Triage

Rows above 10000 ms:

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens | Output tokens | Evidence chars | Main signal | Recommendation |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BQ166 | more_context | 14490.5 | 6472.10000038147 | 5.736805347973213 | 1282 | 46 | 11063 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ242 | region_period_recommendation | 14113.300000190735 | 4609.800000190735 | 4.20897564055348 | 1119 | 40 | 12535 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ243 | region_period_recommendation | 13858.400000572205 | 5640 | 10.464323955272592 | 1175 | 86 | 12108 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ173 | more_context | 13061.89999961853 | 5250.60000038147 | 5.248806217147533 | 1299 | 41 | 11128 | total_latency_tail+low_decode_speed+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ167 | more_context | 12981.10000038147 | 5276.400000572205 | 6.100172622057123 | 1258 | 47 | 11932 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ174 | more_context | 12795.5 | 5154.599999427795 | 5.758483947794758 | 1247 | 44 | 12020 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ131 | region_period_recommendation | 12673.099999427795 | 4824 | 10.319654483431853 | 1099 | 81 | 10115 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ26 | more_context | 12643.400000572205 | 4890.400000572205 | 10.189604024248677 | 1223 | 79 | 11715 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ110 | comparison | 12626.599999427795 | 4764.5 | 1.5263097646778039 | 1029 | 12 | 8863 | total_latency_tail+low_decode_speed+large_prompt | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ25 | more_context | 12578.900000572205 | 4894.800000190735 | 8.068609205622268 | 1223 | 62 | 11715 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ162 | more_context | 12504.099999427795 | 4063.2999992370605 | 4.501942943695067 | 919 | 38 | 8158 | total_latency_tail+low_decode_speed | Compress context skeleton and cap answer length. |
| BQ176 | more_context | 12498.70000076294 | 4738.10000038147 | 10.17962528620426 | 1142 | 79 | 9475 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ260 | more_context | 12273.300000190735 | 4587.700000762939 | 8.197147913590408 | 1221 | 63 | 10916 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ130 | region_period_recommendation | 12127.199999809265 | 4475.5 | 8.88691401932839 | 1002 | 68 | 10115 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ244 | region_period_recommendation | 12083.199999809265 | 5165.699999809265 | 11.998554391037224 | 1121 | 83 | 12549 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ129 | region_period_recommendation | 12037.300000190735 | 4233.300000190735 | 9.097898513582777 | 937 | 71 | 10319 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ172 | more_context | 11902.099999427795 | 4792.800000190735 | 6.751719579304735 | 1153 | 48 | 11004 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ136 | region_period_recommendation | 11465.89999961853 | 3996.699999809265 | 9.505703422295971 | 935 | 71 | 10062 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ132 | region_period_recommendation | 11460.300000190735 | 3903.4000005722046 | 8.20442244877261 | 948 | 62 | 10121 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ213 | current_object_explanation | 11326.60000038147 | 4563.39999961853 | 10.94156612131125 | 1076 | 74 | 10962 | total_latency_tail+large_prompt+large_evidence_text | Prefer one primary object and move evidence tags before prose. |
| BQ230 | comparison | 11205.300000190735 | 3456 | 6.710283509313114 | 726 | 52 | 8451 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ169 | more_context | 11118.699999809265 | 4298 | 12.901901564716356 | 1072 | 88 | 8783 | total_latency_tail+large_prompt | Compress context skeleton and cap answer length. |
| BQ165 | more_context | 11097 | 4140.199999809265 | 7.6184452619806375 | 1050 | 53 | 10735 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ141 | region_period_recommendation | 10914.099999427795 | 4159 | 9.918432000366446 | 956 | 67 | 10472 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ065 | current_object_explanation | 10900.60000038147 | 4238 | 8.855401794587989 | 999 | 59 | 8840 | total_latency_tail | Prefer one primary object and move evidence tags before prose. |
| BQ104 | comparison | 10774.900000572205 | 3936 | 8.62711839551149 | 787 | 59 | 8074 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ137 | region_period_recommendation | 10721.89999961853 | 3996.1000003814697 | 10.705046241066833 | 925 | 72 | 9981 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ105 | comparison | 10682.300000190735 | 2965.199999809265 | 13.476565030239222 | 602 | 104 | 7120 | total_latency_tail+long_output | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ138 | region_period_recommendation | 10389.800000190735 | 3892.699999809265 | 9.54271905871231 | 864 | 62 | 9873 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ226 | source_rights_question | 10327.300000190735 | 2740.699999809265 | 8.69954920474012 | 597 | 66 | 13172 | total_latency_tail+large_evidence_text | Hybrid deterministic source/rights lane can return exact evidence fields. |

## Repeated Evidence In Slow Rows

| Evidence ID | Slow rows | All rows | Avg total ms | Avg evidence chars |
| --- | ---: | ---: | ---: | ---: |
| SURF-GAX1970R001 | 9 | 15 | 9807.3 | 9510.1 |
| SURF-CRG2026R0175 | 7 | 7 | 12488.4 | 11027.1 |
| SURF-CRG2026R0002 | 4 | 4 | 11732.2 | 10469.8 |
| SURF-CRG2026R0005 | 4 | 5 | 11638.3 | 10486.8 |
| SURF-CRG2026R0071 | 4 | 5 | 11541.6 | 10953.2 |
| SURF-CGS2026R0328 | 4 | 5 | 10729.3 | 9748.2 |
| SURF-CRG2026R0052 | 3 | 3 | 12433 | 9901.7 |
| SURF-CRG2026R0027 | 3 | 4 | 11786.2 | 12251 |
| SURF-CRG2026R0153 | 3 | 4 | 11066.2 | 11593.3 |
| SURF-CRG2026R0001 | 3 | 5 | 10885 | 11356.4 |
| SURF-GA1970R001 | 3 | 4 | 10399.8 | 8612.5 |
| SURF-CRG2026R0100 | 3 | 5 | 9893.5 | 11020 |
| SURF-CGS2026R0909 | 3 | 6 | 9446.5 | 11586.5 |
| SURF-CRG2026R0032 | 2 | 2 | 12970.8 | 12328.5 |
| SURF-COM1970R007 | 2 | 2 | 12611.2 | 11715 |
| SURF-CRG2026R0274 | 2 | 2 | 12611.2 | 11715 |
| SURF-CRG2026R0050 | 2 | 2 | 12416.4 | 11169.5 |
| SURF-CRG2026R0031 | 2 | 3 | 11687.2 | 12151.7 |
| SURF-CHW2026R001 | 2 | 2 | 11113.6 | 9901 |
| SURF-CRG2026R0020 | 2 | 2 | 11074.1 | 8591 |

## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | 5 | 3769.1 | 753.8 | hybrid_system_latency |
| Source/rights | 10 | 78349.5 | 7835 | hybrid_system_latency |
| Combined deterministic candidates | 15 | 82118.6 | 5474.6 | hybrid_system_latency |

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
