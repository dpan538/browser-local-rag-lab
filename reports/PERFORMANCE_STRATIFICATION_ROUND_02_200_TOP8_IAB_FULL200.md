# Performance Stratification Round 02 200 Contract IAB Full200

Generated: 2026-06-08T10:27:13.171Z

This report stratifies the browser-local WebLLM full-200 controlled-condition
run by intent and prompt size. It is a runtime-performance analysis only:
the generation contract remains the authority for answer faithfulness.

## Summary

- Rows: 200
- Contract failures in source gate: 0
- Contract warnings in source gate: 0
- Blocking findings in source gate: 0
- Performance observations: 35
- Average TTFT: 14783.2 ms
- Average total latency: 20779.2 ms
- Average tokens/s: 13.44
- Average prompt tokens: 954.8

## By Intent

| Intent | N | P003 | P003 rate | Avg TTFT ms | Avg total ms | Avg tokens/s | Avg prompt tokens |
|---|---:|---:|---:|---:|---:|---:|---:|
| more_context | 18 | 13 | 72.2% | 36422.4 | 46638.9 | 5.49 | 2529.1 |
| current_object_explanation | 28 | 8 | 28.6% | 23963.5 | 32163.7 | 8.09 | 1675.7 |
| source_rights_question | 24 | 7 | 29.2% | 9851 | 16182.1 | 8.02 | 362.1 |
| comparison | 28 | 4 | 14.3% | 12607.9 | 19116.8 | 9.94 | 645.3 |
| region_period_recommendation | 24 | 3 | 12.5% | 22901.3 | 30060.9 | 10.67 | 1681.5 |
| archive_orientation | 16 | 0 | 0% | 8952.6 | 14524.2 | 22.08 | 663.8 |
| casual_archive_help | 16 | 0 | 0% | 11989 | 18347.2 | 18.75 | 635.6 |
| first_earliest_claim | 15 | 0 | 0% | 1458.2 | 1941.6 | 20.74 | 106.9 |
| method_process_question | 16 | 0 | 0% | 7054.9 | 11723.9 | 21.16 | 458.4 |
| no_evidence_refusal | 15 | 0 | 0% | 1411.1 | 1866.7 | 22.25 | 112 |

## By Prompt Token Bin

| Prompt tokens | N | P003 | P003 rate | Avg TTFT ms | Avg total ms | Avg tokens/s | Avg prompt tokens |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1101+ | 66 | 24 | 36.4% | 28146.6 | 36867.6 | 7.33 | 1999.3 |
| 501-800 | 52 | 4 | 7.7% | 11928.2 | 18342.1 | 15.53 | 655.4 |
| 201-500 | 46 | 7 | 15.2% | 8504.5 | 14086.8 | 13.64 | 406.2 |
| 000-200 | 33 | 0 | 0% | 1402.8 | 1860.8 | 22.19 | 109.1 |
| 801-1100 | 3 | 0 | 0% | 13731.3 | 19796.6 | 12.5 | 883.3 |

## Correlations

| Pair | Pearson r |
|---|---:|
| prompt_tokens_est vs ttft_ms | 0.9633 |
| prompt_tokens_est vs total_latency_ms | 0.9455 |
| prompt_tokens_est vs tokens_per_second | -0.6371 |
| output_tokens vs total_latency_ms | 0.1959 |
| output_tokens vs tokens_per_second | 0.1563 |

## Slowest By Total Latency

| Query | Intent | Prompt tokens | Output tokens | Total ms | Tokens/s |
|---|---|---:|---:|---:|---:|
| BQ174 | more_context | 2785 | 34 | 57601 | 2.88 |
| BQ173 | more_context | 2736 | 47 | 56175.4 | 4.02 |
| BQ167 | more_context | 2730 | 36 | 55863.1 | 3.42 |
| BQ172 | more_context | 2691 | 50 | 55747.5 | 4.3 |
| BQ166 | more_context | 2730 | 57 | 49822.8 | 5.44 |
| BQ07 | current_object_explanation | 1724 | 37 | 47722.6 | 3.54 |
| BQ169 | more_context | 2396 | 36 | 47005.4 | 3.41 |
| BQ176 | more_context | 2103 | 89 | 46301.2 | 8.54 |
| BQ175 | more_context | 2057 | 44 | 45635.3 | 4.24 |
| BQ26 | more_context | 2901 | 71 | 45026.1 | 7.75 |
| BQ25 | more_context | 2901 | 69 | 44966.1 | 7.17 |
| BQ171 | more_context | 2278 | 106 | 44852.5 | 10.1 |

## Slowest By Tokens/s

| Query | Intent | Prompt tokens | Output tokens | Total ms | Tokens/s |
|---|---|---:|---:|---:|---:|
| BQ174 | more_context | 2785 | 34 | 57601 | 2.88 |
| BQ089 | source_rights_question | 461 | 22 | 19678.3 | 2.99 |
| BQ162 | more_context | 2585 | 32 | 41809 | 3.38 |
| BQ169 | more_context | 2396 | 36 | 47005.4 | 3.41 |
| BQ167 | more_context | 2730 | 36 | 55863.1 | 3.42 |
| BQ07 | current_object_explanation | 1724 | 37 | 47722.6 | 3.54 |
| BQ173 | more_context | 2736 | 47 | 56175.4 | 4.02 |
| BQ05 | current_object_explanation | 1723 | 49 | 36608.9 | 4.11 |
| BQ175 | more_context | 2057 | 44 | 45635.3 | 4.24 |
| BQ164 | more_context | 2547 | 40 | 41226 | 4.29 |
| BQ172 | more_context | 2691 | 50 | 55747.5 | 4.3 |
| BQ082 | current_object_explanation | 1658 | 45 | 36993.9 | 4.45 |

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
