# WebLLM Round Gate

Generated: 2026-06-09T14:31:55.167Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 300
- Result rows: 300
- Completed rows: 300
- Deterministic hybrid rows: 109
- Qwen model-generation rows: 191
- Error rows: 0
- Metric issues: 0
- Contract failures: 0
- Contract warnings: 0
- Gate warnings: 13
- Blocking findings: 0
- Performance observations: 13
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ102 | tokens_per_second=5.54; avg=13.15 |
| warn | P003_generation_speed_low | BQ105 | tokens_per_second=5.52; avg=13.15 |
| warn | P003_generation_speed_low | BQ106 | tokens_per_second=6.16; avg=13.15 |
| warn | P003_generation_speed_low | BQ108 | tokens_per_second=6.17; avg=13.15 |
| warn | P003_generation_speed_low | BQ111 | tokens_per_second=5.50; avg=13.15 |
| warn | P003_generation_speed_low | BQ117 | tokens_per_second=5.06; avg=13.15 |
| warn | P003_generation_speed_low | BQ121 | tokens_per_second=6.40; avg=13.15 |
| warn | P003_generation_speed_low | BQ122 | tokens_per_second=5.52; avg=13.15 |
| warn | P003_generation_speed_low | BQ126 | tokens_per_second=6.03; avg=13.15 |
| warn | P003_generation_speed_low | BQ127 | tokens_per_second=5.32; avg=13.15 |
| warn | P003_generation_speed_low | BQ231 | tokens_per_second=5.11; avg=13.15 |
| warn | P003_generation_speed_low | BQ235 | tokens_per_second=5.40; avg=13.15 |
| warn | P003_generation_speed_low | BQ238 | tokens_per_second=5.22; avg=13.15 |
