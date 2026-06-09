# Round 03 300 Latency Triage

Generated: 2026-06-09T10:33:50.887Z

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
| Gate performance observations | 6 |
| Avg TTFT ms | 4811.6 |
| P95 TTFT ms | 8222.5 |
| Avg total latency ms | 13973.4 |
| P50 total latency ms | 15004.3 |
| P95 total latency ms | 19330.2 |
| Max total latency ms | 19509.8 |
| Avg tokens/s | 7.75 |
| Slow rows > 10000 ms | 43 |
| Low-speed rows < 3.88 tokens/s | 6 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.93 | 0.878 |
| prompt_tokens_est -> total_latency_ms | 0.823 | 0.794 |
| output_tokens -> total_latency_ms | 0.439 | 0.333 |
| evidence_chars -> prompt_tokens_est | 0.629 | 0.493 |
| candidate_count -> total_latency_ms | 0.805 | 0.508 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| more_context | 12 | 17124.8 | 19486.6 | 19509.8 | 7079.4 | 6.46 | 12 | 1 |
| current_object_explanation | 2 | 18093.6 | 18834.3 | 18916.6 | 6376.6 | 6.07 | 2 | 0 |
| region_period_recommendation | 12 | 17255 | 18783.3 | 18883.5 | 6731.3 | 6.9 | 12 | 0 |
| comparison | 4 | 15270.7 | 17439.8 | 17726.4 | 5385.9 | 6.4 | 4 | 0 |
| source_rights_question | 10 | 13033.3 | 15871.4 | 15996.6 | 2838.7 | 4.58 | 10 | 5 |
| archive_orientation | 3 | 10459 | 12567 | 12676.6 | 2010.2 | 16.07 | 2 | 0 |
| method_process_question | 2 | 10395.8 | 11976.7 | 12152.3 | 1713.3 | 12.97 | 1 | 0 |
| no_evidence_refusal | 2 | 1406.2 | 1569.5 | 1587.6 | 623.3 | 12.82 | 0 | 0 |
| first_earliest_claim | 3 | 1176.8 | 1215.6 | 1218 | 488.8 | 14.58 | 0 | 0 |

## Slow Query Triage

Rows above 10000 ms:

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens | Output tokens | Evidence chars | Main signal | Recommendation |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BQ25 | more_context | 19509.800000190735 | 8598.10000038147 | 7.423224612243359 | 1223 | 81 | 11715 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ260 | more_context | 19467.599999427795 | 8171.39999961853 | 5.4000460332704785 | 1221 | 61 | 10916 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ169 | more_context | 19337 | 7056.10000038147 | 3.827081077238632 | 1072 | 47 | 8783 | total_latency_tail+low_decode_speed+large_prompt | Compress context skeleton and cap answer length. |
| BQ26 | more_context | 19321.89999961853 | 8355.10000038147 | 8.388955757960414 | 1223 | 92 | 11715 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ176 | more_context | 19284.300000190735 | 8186.5 | 8.470147236243621 | 1142 | 94 | 9475 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ213 | current_object_explanation | 18916.599999427795 | 7874 | 6.339086809594413 | 1076 | 70 | 10962 | total_latency_tail+large_prompt+large_evidence_text | Prefer one primary object and move evidence tags before prose. |
| BQ244 | region_period_recommendation | 18883.5 | 8060.900000572205 | 6.929942897636921 | 1121 | 75 | 12549 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ243 | region_period_recommendation | 18701.39999961853 | 7980.5 | 6.062923821909805 | 1175 | 65 | 12108 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ130 | region_period_recommendation | 18651.39999961853 | 7627.099999427795 | 8.163783641450513 | 1002 | 90 | 10115 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ242 | region_period_recommendation | 18584.5 | 7872 | 4.947491248541423 | 1119 | 53 | 12535 | total_latency_tail+large_prompt+large_evidence_text | Use route-specific field summaries and length control. |
| BQ173 | more_context | 18301.89999961853 | 8251.89999961853 | 5.3731343283582085 | 1299 | 54 | 11128 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ129 | region_period_recommendation | 17983.10000038147 | 7085.700000762939 | 6.882375612772351 | 937 | 75 | 10319 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ110 | comparison | 17726.400000572205 | 7208.200000762939 | 5.79947139254874 | 1029 | 61 | 8863 | total_latency_tail+large_prompt | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ141 | region_period_recommendation | 17359.300000190735 | 5601.199999809265 | 6.718772590591762 | 956 | 79 | 10472 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ065 | current_object_explanation | 17270.60000038147 | 4879.10000038147 | 5.810434572085704 | 999 | 72 | 8840 | total_latency_tail | Prefer one primary object and move evidence tags before prose. |
| BQ137 | region_period_recommendation | 17211.5 | 5489 | 5.800810407336319 | 925 | 68 | 9981 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ138 | region_period_recommendation | 17210.5 | 6528 | 4.30610812075825 | 864 | 46 | 9873 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ136 | region_period_recommendation | 17196.300000190735 | 7368.5 | 6.308634689228182 | 935 | 62 | 10062 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ174 | more_context | 17045.29999923706 | 7707.699999809265 | 7.924948595413671 | 1247 | 74 | 12020 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ142 | region_period_recommendation | 16702 | 5889.10000038147 | 7.121123843068602 | 732 | 77 | 8045 | total_latency_tail | Use route-specific field summaries and length control. |
| BQ162 | more_context | 16678.300000190735 | 6260.800000190735 | 5.6635469162467 | 919 | 59 | 8158 | total_latency_tail | Compress context skeleton and cap answer length. |
| BQ226 | source_rights_question | 15996.599999427795 | 4007.2999992370605 | 5.504908543363668 | 597 | 66 | 13172 | total_latency_tail+large_evidence_text | Hybrid deterministic source/rights lane can return exact evidence fields. |
| BQ230 | comparison | 15815.400000572205 | 5541.10000038147 | 3.8932092696589966 | 726 | 40 | 8451 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ100 | source_rights_question | 15718.300000190735 | 3191.5999994277954 | 3.8318152424083403 | 395 | 48 | 8546 | total_latency_tail+low_decode_speed | Hybrid deterministic source/rights lane can return exact evidence fields. |
| BQ132 | region_period_recommendation | 15182.5 | 5817.10000038147 | 9.609840477039514 | 948 | 90 | 10121 | total_latency_tail+large_evidence_text | Use route-specific field summaries and length control. |
| BQ105 | comparison | 14826.199999809265 | 4561.199999809265 | 6.819288845591816 | 602 | 70 | 7120 | total_latency_tail | Keep two comparison records plus exact evidence tags; avoid spillover. |
| BQ166 | more_context | 14415.699999809265 | 5741.60000038147 | 5.30314384236226 | 1282 | 46 | 11063 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ172 | more_context | 14411.699999809265 | 5753.89999961853 | 5.544133613497949 | 1153 | 48 | 11004 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ167 | more_context | 14257.10000038147 | 6052.300000190735 | 7.3127925115304695 | 1258 | 60 | 11932 | total_latency_tail+large_prompt+large_evidence_text | Compress context skeleton and cap answer length. |
| BQ098 | source_rights_question | 13473.60000038147 | 2571.199999809265 | 6.328881713785826 | 478 | 69 | 8147 | total_latency_tail | Hybrid deterministic source/rights lane can return exact evidence fields. |

## Repeated Evidence In Slow Rows

| Evidence ID | Slow rows | All rows | Avg total ms | Avg evidence chars |
| --- | ---: | ---: | ---: | ---: |
| SURF-GAX1970R001 | 15 | 15 | 15293.9 | 9510.1 |
| SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES | 8 | 8 | 14316.7 | 8811.1 |
| SURF-CRG2026R0175 | 7 | 7 | 16119.9 | 11027.1 |
| SURF-CGS2026R0909 | 6 | 6 | 14468.6 | 11586.5 |
| SURF-CRG2026R0005 | 5 | 5 | 16545.7 | 10486.8 |
| SURF-CGS2026R0328 | 5 | 5 | 15204 | 9748.2 |
| SURF-CRG2026R0001 | 5 | 5 | 14760.1 | 11356.4 |
| SURF-CGS2026R0910 | 5 | 5 | 12905.8 | 11978 |
| SURF-GA1970R001 | 4 | 4 | 17199.2 | 8612.5 |
| SURF-CRG2026R0002 | 4 | 4 | 16938.6 | 10469.8 |
| SURF-CRG2026R0027 | 4 | 4 | 16937.5 | 12251 |
| SURF-CRG2026R0153 | 4 | 4 | 16327.3 | 11593.3 |
| SURF-CRG2026R0071 | 4 | 5 | 14905.5 | 10953.2 |
| SURF-CRG2026R0100 | 4 | 5 | 14487.2 | 11020 |
| SURF-CRG2026R0004 | 4 | 4 | 12400.8 | 11049.3 |
| SURF-CRG2026R0052 | 3 | 3 | 17109.8 | 9901.7 |
| SURF-CRG2026R0051 | 3 | 3 | 16437 | 10479 |
| SURF-CRG2026R0031 | 3 | 3 | 16288.8 | 12151.7 |
| SURF-CRG2026R0003 | 3 | 3 | 14846.6 | 10265 |
| SURF-COM1970R007 | 2 | 2 | 19415.8 | 11715 |

## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | 5 | 6342.8 | 1268.6 | hybrid_system_latency |
| Source/rights | 10 | 130332.8 | 13033.3 | hybrid_system_latency |
| Combined deterministic candidates | 15 | 136675.6 | 9111.7 | hybrid_system_latency |

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
