# Performance Stratification Round 02 200 Contract IAB Full200

Generated: 2026-06-08T08:13:30.367Z

This report stratifies the browser-local WebLLM full-200 controlled-condition
run by intent and prompt size. It is a runtime-performance analysis only:
the generation contract remains the authority for answer faithfulness.

## Summary

- Rows: 200
- Contract failures in source gate: 0
- Contract warnings in source gate: 0
- Blocking findings in source gate: 0
- Performance observations: 25
- Average TTFT: 2284.9 ms
- Average total latency: 7082.4 ms
- Average tokens/s: 16.35
- Average prompt tokens: 560.9

## By Intent

| Intent | N | P003 | P003 rate | Avg TTFT ms | Avg total ms | Avg tokens/s | Avg prompt tokens |
|---|---:|---:|---:|---:|---:|---:|---:|
| comparison | 28 | 9 | 32.1% | 2868.9 | 9114.2 | 9.83 | 645.3 |
| more_context | 18 | 6 | 33.3% | 4215.5 | 10482.3 | 9.79 | 1075.9 |
| region_period_recommendation | 24 | 5 | 20.8% | 4213.3 | 10942.3 | 11.92 | 760.5 |
| source_rights_question | 24 | 4 | 16.7% | 1335.6 | 6174.2 | 10.47 | 362.1 |
| current_object_explanation | 28 | 1 | 3.6% | 3164.7 | 9144.8 | 13.57 | 815.4 |
| archive_orientation | 16 | 0 | 0% | 1606.8 | 6544.3 | 22.42 | 475.9 |
| casual_archive_help | 16 | 0 | 0% | 1336.5 | 5469.7 | 22.48 | 420.7 |
| first_earliest_claim | 15 | 0 | 0% | 403.7 | 777.5 | 27.15 | 106.9 |
| method_process_question | 16 | 0 | 0% | 1252.1 | 5675.5 | 21.64 | 458.4 |
| no_evidence_refusal | 15 | 0 | 0% | 387.2 | 736.5 | 28.65 | 112 |

## By Prompt Token Bin

| Prompt tokens | N | P003 | P003 rate | Avg TTFT ms | Avg total ms | Avg tokens/s | Avg prompt tokens |
|---|---:|---:|---:|---:|---:|---:|---:|
| 201-500 | 71 | 6 | 8.5% | 1406.9 | 6100.3 | 17.58 | 418.5 |
| 501-800 | 49 | 7 | 14.3% | 2939.5 | 9126.1 | 12.08 | 672.8 |
| 801-1100 | 39 | 8 | 20.5% | 4118.4 | 10740.4 | 11.16 | 924.7 |
| 000-200 | 33 | 0 | 0% | 394 | 754.1 | 27.99 | 109.1 |
| 1101+ | 8 | 4 | 50% | 4929.9 | 11551.2 | 8.96 | 1228.4 |

## Correlations

| Pair | Pearson r |
|---|---:|
| prompt_tokens_est vs ttft_ms | 0.93 |
| prompt_tokens_est vs total_latency_ms | 0.8952 |
| prompt_tokens_est vs tokens_per_second | -0.6945 |
| output_tokens vs total_latency_ms | 0.4906 |
| output_tokens vs tokens_per_second | -0.1318 |

## Slowest By Total Latency

| Query | Intent | Prompt tokens | Output tokens | Total ms | Tokens/s |
|---|---|---:|---:|---:|---:|
| BQ131 | region_period_recommendation | 1099 | 70 | 15190 | 8 |
| BQ130 | region_period_recommendation | 1002 | 53 | 14602.3 | 6.17 |
| BQ141 | region_period_recommendation | 956 | 80 | 13948.6 | 9.56 |
| BQ136 | region_period_recommendation | 935 | 91 | 13637.5 | 11.11 |
| BQ132 | region_period_recommendation | 948 | 80 | 13627.1 | 9.62 |
| BQ140 | region_period_recommendation | 979 | 76 | 13612.4 | 9.31 |
| BQ137 | region_period_recommendation | 925 | 78 | 13497.5 | 9.54 |
| BQ139 | region_period_recommendation | 918 | 84 | 13490.3 | 10.2 |
| BQ138 | region_period_recommendation | 864 | 49 | 13147.4 | 6.08 |
| BQ135 | region_period_recommendation | 802 | 51 | 12861.4 | 6.39 |
| BQ143 | region_period_recommendation | 753 | 83 | 12852.1 | 10.32 |
| BQ142 | region_period_recommendation | 732 | 95 | 12561.9 | 11.96 |

## Slowest By Tokens/s

| Query | Intent | Prompt tokens | Output tokens | Total ms | Tokens/s |
|---|---|---:|---:|---:|---:|
| BQ089 | source_rights_question | 461 | 22 | 7073.5 | 4.17 |
| BQ167 | more_context | 1258 | 39 | 12012.4 | 5.74 |
| BQ118 | comparison | 494 | 44 | 10141.3 | 5.78 |
| BQ128 | region_period_recommendation | 885 | 44 | 12273.6 | 5.96 |
| BQ138 | region_period_recommendation | 864 | 49 | 13147.4 | 6.08 |
| BQ130 | region_period_recommendation | 1002 | 53 | 14602.3 | 6.17 |
| BQ135 | region_period_recommendation | 802 | 51 | 12861.4 | 6.39 |
| BQ07 | current_object_explanation | 773 | 51 | 12456.9 | 6.46 |
| BQ120 | comparison | 506 | 42 | 8622.2 | 6.71 |
| BQ08 | source_rights_question | 360 | 49 | 8927.7 | 6.82 |
| BQ127 | comparison | 637 | 46 | 9880.3 | 6.86 |
| BQ166 | more_context | 1282 | 46 | 11694.6 | 6.94 |

## Interpretation

- No answer-quality gate regressed: runtime errors, metric issues, contract failures,
  and contract warnings all remain zero in the source full-200 gate.
- Low-speed observations are concentrated in heavier research lanes, especially
  comparison, region-period recommendation, and more-context queries.
- Prompt length is not the only driver; output shape and lane-specific generation
  behavior also matter. Use within-intent paired comparisons in the next ablation
  so the experiment does not confuse intent mix with packet-quality effects.
- The next controlled ablation should compare top-1, top-3 gold-contract, and
  top-8 gold-contract packets under the same validator, reporting both contract
  pass rate and this performance stratification.
