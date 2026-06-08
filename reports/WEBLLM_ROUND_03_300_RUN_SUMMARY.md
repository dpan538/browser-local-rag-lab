# WebLLM Round 03 300 Run Summary

Generated: 2026-06-08

This report summarizes the Codex in-app browser run for the Round 03
300-query controlled-condition WebLLM test. The run used the research-only
`top3_gold_contract_source_rights` packet variant with Qwen3.5-0.8B-q4f16_1-MLC.
Generated answers are experimental outputs only and are not archive evidence.

## Pilot 50

- Browser export: `reports/webllm_round_03_300_pilot50_browser_export.json`
- Imported report: `reports/WEBLLM_ROUND_03_300_PILOT50.md`
- Gate report: `reports/WEBLLM_ROUND_03_300_PILOT50_GATE.md`
- Completed rows: 50/50
- Runtime errors: 0
- Metric issues: 0
- Contract failures: 0
- Contract warnings: 0
- Gate blocking findings: 0
- Gate warnings: 7, all `P003_generation_speed_low`
- Average total latency: 5527.4 ms
- Average tokens/s: 21.24

Pilot interpretation: the 50-query gate was clean enough to continue. The
warnings were non-blocking performance observations, not contract or runtime
failures.

## Full 300

- Browser export: `reports/webllm_round_03_300_browser_export.json`
- Imported report: `reports/WEBLLM_ROUND_03_300.md`
- Gate report: `reports/WEBLLM_ROUND_03_300_GATE.md`
- Completed rows: 300/300
- Runtime errors: 0
- Metric issues: 0
- Contract failures: 0
- Contract warnings: 0
- Gate blocking findings: 0
- Gate warnings: 30, all `P003_generation_speed_low`
- Ready for next step: yes

## Runtime Summary

- Average TTFT: 1965.8 ms
- Average total latency: 6433.4 ms
- Average tokens/s: 17.02
- P50 total latency: 6840.4 ms
- P95 total latency: 11672.3 ms
- Max total latency: 14291.6 ms
- P95 TTFT: 4566.1 ms

## Intent-Level Runtime

| Intent | Rows | Avg Total ms | Avg TTFT ms | Avg tokens/s | Max Total ms |
|---|---:|---:|---:|---:|---:|
| archive_orientation | 22 | 6217.0 | 1479.8 | 23.08 | 6955.2 |
| casual_archive_help | 22 | 5946.6 | 1423.7 | 21.62 | 7382.6 |
| current_object_explanation | 32 | 9622.1 | 3184.7 | 11.75 | 11456.1 |
| source_rights_question | 36 | 6524.2 | 1360.4 | 9.47 | 8424.8 |
| first_earliest_claim | 35 | 764.0 | 382.4 | 26.24 | 790.0 |
| comparison | 38 | 8784.2 | 2635.0 | 11.45 | 11940.4 |
| region_period_recommendation | 34 | 9687.9 | 3489.0 | 12.38 | 13550.9 |
| method_process_question | 22 | 6214.5 | 1266.5 | 19.43 | 6994.1 |
| more_context | 24 | 11100.2 | 4223.6 | 10.78 | 14291.6 |
| no_evidence_refusal | 35 | 759.9 | 389.2 | 27.01 | 779.4 |

## Slowest Rows

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens est | Output tokens |
|---|---|---:|---:|---:|---:|---:|
| BQ166 | more_context | 14291.6 | 6806.0 | 16.03 | 1282 | 120 |
| BQ131 | region_period_recommendation | 13550.9 | 4982.7 | 7.00 | 1099 | 60 |
| BQ167 | more_context | 13042.3 | 5451.8 | 6.32 | 1258 | 48 |
| BQ174 | more_context | 12774.8 | 5165.3 | 7.23 | 1247 | 55 |
| BQ132 | region_period_recommendation | 12708.6 | 5088.2 | 10.37 | 948 | 79 |
| BQ173 | more_context | 12544.7 | 5130.4 | 5.53 | 1299 | 41 |
| BQ136 | region_period_recommendation | 12171.7 | 4502.6 | 8.35 | 935 | 64 |
| BQ129 | region_period_recommendation | 12023.5 | 4738.0 | 8.78 | 937 | 64 |
| BQ110 | comparison | 11940.4 | 4952.2 | 8.59 | 1029 | 60 |
| BQ176 | more_context | 11891.6 | 4678.8 | 13.31 | 1142 | 96 |
| BQ260 | more_context | 11755.9 | 4599.0 | 11.18 | 1221 | 80 |
| BQ130 | region_period_recommendation | 11732.5 | 4542.4 | 9.60 | 1002 | 69 |

## Browser Interruption Note

During the full run, the in-app browser tab reset once around the early
current-object/orientation section. The runner checkpoint survived in browser
storage with 45 completed rows, and the run resumed from BQ046 with
`skipCompleted=true`. No model, metric, or contract error resulted from this
browser-level interruption. Subsequent polling wrote backup exports to
`/private/tmp/webllm_round_03_300_full_latest.json` before final chunked export.

## Interpretation

Round 03 validates that the 300-query controlled-condition packet can run in
browser-local WebLLM/Qwen with complete mechanical contract compliance:
300/300 completed, zero runtime errors, zero metric issues, zero contract
failures, and zero contract warnings.

The main remaining research issue is not contract compliance but latency
stratification. The slowest rows cluster in `more_context`,
`region_period_recommendation`, `comparison`, and `current_object_explanation`,
while hard-refusal lanes are very fast and stable. This supports a next
experiment on lane-aware prompt/token budgets and answer-length controls.
