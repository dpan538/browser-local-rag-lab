# Performance Stratification Round 02 200 Contract IAB Full200

Generated: 2026-06-08T10:27:08.206Z

This report stratifies the browser-local WebLLM full-200 controlled-condition
run by intent and prompt size. It is a runtime-performance analysis only:
the generation contract remains the authority for answer faithfulness.

## Summary

- Rows: 200
- Contract failures in source gate: 0
- Contract warnings in source gate: 0
- Blocking findings in source gate: 0
- Performance observations: 8
- Average TTFT: 1810.2 ms
- Average total latency: 6221.4 ms
- Average tokens/s: 16.71
- Average prompt tokens: 458.8

## By Intent

| Intent | N | P003 | P003 rate | Avg TTFT ms | Avg total ms | Avg tokens/s | Avg prompt tokens |
|---|---:|---:|---:|---:|---:|---:|---:|
| source_rights_question | 24 | 5 | 20.8% | 1469.3 | 6730.3 | 9.71 | 362.1 |
| more_context | 18 | 2 | 11.1% | 3573.5 | 10134.1 | 11 | 809.6 |
| comparison | 28 | 1 | 3.6% | 2634.4 | 8282.4 | 12.55 | 645.3 |
| archive_orientation | 16 | 0 | 0% | 1282.8 | 5210.8 | 23.54 | 408.8 |
| casual_archive_help | 16 | 0 | 0% | 1104.1 | 3993.9 | 23.63 | 342.3 |
| current_object_explanation | 28 | 0 | 0% | 1859.6 | 7675.3 | 13.68 | 434.2 |
| first_earliest_claim | 15 | 0 | 0% | 459.5 | 894.5 | 23.11 | 106.9 |
| method_process_question | 16 | 0 | 0% | 1252.5 | 5782.8 | 21.48 | 458.4 |
| no_evidence_refusal | 15 | 0 | 0% | 441.6 | 843.6 | 25.03 | 112 |
| region_period_recommendation | 24 | 0 | 0% | 2703.4 | 7819.2 | 14.8 | 651.7 |

## By Prompt Token Bin

| Prompt tokens | N | P003 | P003 rate | Avg TTFT ms | Avg total ms | Avg tokens/s | Avg prompt tokens |
|---|---:|---:|---:|---:|---:|---:|---:|
| 201-500 | 97 | 6 | 6.2% | 1386.2 | 6004.9 | 17.31 | 392.4 |
| 501-800 | 54 | 1 | 1.9% | 2755.5 | 8629.8 | 12.37 | 655.3 |
| 000-200 | 33 | 0 | 0% | 443.7 | 856 | 24.48 | 109.1 |
| 801-1100 | 14 | 1 | 7.1% | 3890.2 | 10341 | 11.77 | 876.6 |
| 1101+ | 2 | 0 | 0% | 4841.8 | 11392.5 | 10.77 | 1223 |

## Correlations

| Pair | Pearson r |
|---|---:|
| prompt_tokens_est vs ttft_ms | 0.9584 |
| prompt_tokens_est vs total_latency_ms | 0.8971 |
| prompt_tokens_est vs tokens_per_second | -0.5999 |
| output_tokens vs total_latency_ms | 0.6286 |
| output_tokens vs tokens_per_second | -0.1517 |

## Slowest By Total Latency

| Query | Intent | Prompt tokens | Output tokens | Total ms | Tokens/s |
|---|---|---:|---:|---:|---:|
| BQ176 | more_context | 927 | 88 | 12022.7 | 12.04 |
| BQ167 | more_context | 857 | 55 | 11527.2 | 7.66 |
| BQ174 | more_context | 846 | 60 | 11476.4 | 8.39 |
| BQ26 | more_context | 1223 | 63 | 11410.2 | 9.59 |
| BQ173 | more_context | 898 | 77 | 11399 | 10.75 |
| BQ25 | more_context | 1223 | 78 | 11374.7 | 11.94 |
| BQ166 | more_context | 881 | 62 | 11366 | 8.74 |
| BQ169 | more_context | 798 | 52 | 10933.8 | 7.38 |
| BQ110 | comparison | 1029 | 65 | 10901 | 10.53 |
| BQ175 | more_context | 750 | 59 | 10837.5 | 8.36 |
| BQ172 | more_context | 752 | 82 | 10476.8 | 11.99 |
| BQ131 | region_period_recommendation | 961 | 69 | 10331.9 | 10.88 |

## Slowest By Tokens/s

| Query | Intent | Prompt tokens | Output tokens | Total ms | Tokens/s |
|---|---|---:|---:|---:|---:|
| BQ089 | source_rights_question | 461 | 22 | 8746 | 3.49 |
| BQ088 | source_rights_question | 355 | 40 | 9076.5 | 5.43 |
| BQ096 | source_rights_question | 387 | 36 | 7870.9 | 6.45 |
| BQ169 | more_context | 798 | 52 | 10933.8 | 7.38 |
| BQ094 | source_rights_question | 410 | 48 | 8136.5 | 7.64 |
| BQ167 | more_context | 857 | 55 | 11527.2 | 7.66 |
| BQ08 | source_rights_question | 360 | 49 | 7371.9 | 8.06 |
| BQ124 | comparison | 473 | 43 | 6853.7 | 8.32 |
| BQ175 | more_context | 750 | 59 | 10837.5 | 8.36 |
| BQ101 | source_rights_question | 373 | 43 | 6474.8 | 8.37 |
| BQ174 | more_context | 846 | 60 | 11476.4 | 8.39 |
| BQ109 | comparison | 600 | 47 | 7710.8 | 8.57 |

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
