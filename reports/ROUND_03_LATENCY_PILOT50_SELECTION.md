# Round 03 Latency Pilot 50 Selection

Generated: 2026-06-08T13:06:23.372Z

This fixture defines a fixed 50-query pilot set for Round 03 performance
optimization variants. It is selected from the completed 300-query scale
baseline and is intentionally stratified around the latency problem rather
than simply using the first 50 queries.

The pilot is research-only. It does not modify archive product runtime,
download images, or add model weights.

## Selection Buckets

| Bucket | Count |
|---|---:|
| latency_tail_top26 | 26 |
| low_decode_speed | 8 |
| source_rights_hybrid_candidate | 6 |
| refusal_hybrid_candidate | 5 |
| fast_control | 5 |

## Intent Coverage

| Intent | Count |
|---|---:|
| more_context | 12 |
| region_period_recommendation | 12 |
| comparison | 4 |
| current_object_explanation | 2 |
| source_rights_question | 10 |
| first_earliest_claim | 3 |
| no_evidence_refusal | 2 |
| archive_orientation | 3 |
| method_process_question | 2 |

## Selected Queries

| Query | Intent | Bucket | Total ms | tokens/s | Prompt tokens |
|---|---|---|---:|---:|---:|
| BQ166 | more_context | latency_tail_top26 | 14291.599999904633 | 16.030779096068294 | 1282 |
| BQ131 | region_period_recommendation | latency_tail_top26 | 13550.89999961853 | 7.002637660341221 | 1099 |
| BQ167 | more_context | latency_tail_top26 | 13042.299999713898 | 6.323694091298334 | 1258 |
| BQ174 | more_context | latency_tail_top26 | 12774.800000190735 | 7.227807346080557 | 1247 |
| BQ132 | region_period_recommendation | latency_tail_top26 | 12708.60000038147 | 10.366909873367716 | 948 |
| BQ173 | more_context | latency_tail_top26 | 12544.699999809265 | 5.529854470628663 | 1299 |
| BQ136 | region_period_recommendation | latency_tail_top26 | 12171.699999809265 | 8.345177400320226 | 935 |
| BQ129 | region_period_recommendation | latency_tail_top26 | 12023.5 | 8.784572095257705 | 937 |
| BQ110 | comparison | latency_tail_top26 | 11940.400000095367 | 8.585901949234085 | 1029 |
| BQ176 | more_context | latency_tail_top26 | 11891.599999904633 | 13.309671694412902 | 1142 |
| BQ260 | more_context | latency_tail_top26 | 11755.900000095367 | 11.178024004657601 | 1221 |
| BQ130 | region_period_recommendation | latency_tail_top26 | 11732.5 | 9.59652856023076 | 1002 |
| BQ25 | more_context | latency_tail_top26 | 11718.199999809265 | 10.06711409395973 | 1223 |
| BQ26 | more_context | latency_tail_top26 | 11692.900000095367 | 13.646612080411392 | 1223 |
| BQ242 | region_period_recommendation | latency_tail_top26 | 11687.699999809265 | 9.143725294602955 | 1119 |
| BQ243 | region_period_recommendation | latency_tail_top26 | 11672.299999713898 | 8.393438891838645 | 1175 |
| BQ244 | region_period_recommendation | latency_tail_top26 | 11585.900000095367 | 9.829339866965613 | 1121 |
| BQ213 | current_object_explanation | latency_tail_top26 | 11456.099999904633 | 8.074632676086093 | 1076 |
| BQ065 | current_object_explanation | latency_tail_top26 | 11453.400000095367 | 12.278669996627414 | 999 |
| BQ141 | region_period_recommendation | latency_tail_top26 | 11345.099999904633 | 13.451972255307224 | 956 |
| BQ137 | region_period_recommendation | latency_tail_top26 | 11316.900000095367 | 10.642453961419749 | 925 |
| BQ172 | more_context | latency_tail_top26 | 11230.099999904633 | 10.51145748926477 | 1153 |
| BQ104 | comparison | latency_tail_top26 | 11207 | 9.197267870426726 | 787 |
| BQ165 | more_context | latency_tail_top26 | 11170.699999809265 | 10.185604346270106 | 1050 |
| BQ169 | more_context | latency_tail_top26 | 11113 | 7.203157864803611 | 1072 |
| BQ142 | region_period_recommendation | latency_tail_top26 | 10943.699999809265 | 6.78711534015023 | 732 |
| BQ089 | source_rights_question | low_decode_speed | 7783.800000190735 | 3.671745915007344 | 461 |
| BQ138 | region_period_recommendation | low_decode_speed | 10501.599999904633 | 6.234228885260501 | 864 |
| BQ227 | source_rights_question | low_decode_speed | 7064.299999713898 | 6.260508711157487 | 378 |
| BQ162 | more_context | low_decode_speed | 10313.400000095367 | 6.332453825857519 | 919 |
| BQ223 | source_rights_question | low_decode_speed | 7294.199999809265 | 6.35581998916088 | 394 |
| BQ096 | source_rights_question | low_decode_speed | 7214.200000286102 | 6.409799871695163 | 387 |
| BQ230 | comparison | low_decode_speed | 9216 | 6.469037568736133 | 726 |
| BQ105 | comparison | low_decode_speed | 9084 | 6.606890042472864 | 602 |
| BQ226 | source_rights_question | source_rights_hybrid_candidate | 8424.800000190735 | 10.939286957040673 | 597 |
| BQ098 | source_rights_question | source_rights_hybrid_candidate | 7674.300000190735 | 11.654814789415575 | 478 |
| BQ095 | source_rights_question | source_rights_hybrid_candidate | 7531 | 10.231864453470758 | 521 |
| BQ224 | source_rights_question | source_rights_hybrid_candidate | 7266.199999809265 | 8.436000633265625 | 417 |
| BQ094 | source_rights_question | source_rights_hybrid_candidate | 7161.900000095367 | 8.515923001862859 | 410 |
| BQ100 | source_rights_question | source_rights_hybrid_candidate | 7034.099999904633 | 8.521970705725698 | 395 |
| BQ274 | first_earliest_claim | refusal_hybrid_candidate | 790 | 25.11931676060177 | 113 |
| BQ261 | first_earliest_claim | refusal_hybrid_candidate | 783.2000002861023 | 25.297242588350453 | 113 |
| BQ295 | no_evidence_refusal | refusal_hybrid_candidate | 779.4000000953674 | 25.720164596435875 | 114 |
| BQ291 | no_evidence_refusal | refusal_hybrid_candidate | 779.1999998092651 | 25.81977796898295 | 114 |
| BQ264 | first_earliest_claim | refusal_hybrid_candidate | 778.3000001907349 | 25.26528548555086 | 113 |
| BQ032 | archive_orientation | fast_control | 6840.400000095367 | 21.980140750024102 | 498 |
| BQ157 | method_process_question | fast_control | 6886.200000286102 | 17.63008868438912 | 459 |
| BQ206 | archive_orientation | fast_control | 6831.699999809265 | 21.54724327671382 | 497 |
| BQ154 | method_process_question | fast_control | 6895.199999809265 | 18.621313423936673 | 459 |
| BQ034 | archive_orientation | fast_control | 6829.199999809265 | 21.61066381232072 | 514 |

## Use

Run future Round 03 optimization pilots against:

```text
fixtures/optimization/round03_latency_pilot50/queries.jsonl
fixtures/optimization/round03_latency_pilot50/labels.jsonl
fixtures/optimization/round03_latency_pilot50/records.jsonl
fixtures/optimization/round03_latency_pilot50/retrieval_sufficiency.json
```

The same pilot should be reused across `r03_v1_length_control`,
`r03_v2_evidence_compress`, `r03_v3_hybrid_deterministic_lanes`, and
`r03_v4_combined` so latency comparisons are not confounded by query
selection.
