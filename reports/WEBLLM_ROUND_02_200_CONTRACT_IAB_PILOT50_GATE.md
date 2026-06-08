# WebLLM Round Gate

Generated: 2026-06-08T07:25:39.903Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 50
- Result rows: 50
- Completed rows: 50
- Error rows: 0
- Metric issues: 0
- Contract failures: 1
- Contract warnings: 0
- Gate warnings: 7
- Ready for next step: no

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| fail | CONTRACT_G004_answerable_refused | BQ23 | answerable label produced a refusal |
| warn | P003_generation_speed_low | BQ07 | tokens_per_second=5.54; avg=15.09 |
| warn | P003_generation_speed_low | BQ08 | tokens_per_second=7.00; avg=15.09 |
| warn | P003_generation_speed_low | BQ19 | tokens_per_second=6.93; avg=15.09 |
| warn | P003_generation_speed_low | BQ20 | tokens_per_second=6.97; avg=15.09 |
| warn | P003_generation_speed_low | BQ21 | tokens_per_second=6.96; avg=15.09 |
| warn | P003_generation_speed_low | BQ22 | tokens_per_second=7.05; avg=15.09 |
| warn | P003_generation_speed_low | BQ25 | tokens_per_second=6.86; avg=15.09 |
