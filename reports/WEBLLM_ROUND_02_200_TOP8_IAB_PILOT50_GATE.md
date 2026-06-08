# WebLLM Round Gate

Generated: 2026-06-08T09:15:33.178Z

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
- Contract failures: 0
- Contract warnings: 0
- Gate warnings: 9
- Blocking findings: 0
- Performance observations: 9
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ05 | tokens_per_second=6.69; avg=16.08 |
| warn | P003_generation_speed_low | BQ06 | tokens_per_second=6.90; avg=16.08 |
| warn | P003_generation_speed_low | BQ07 | tokens_per_second=5.04; avg=16.08 |
| warn | P003_generation_speed_low | BQ08 | tokens_per_second=6.87; avg=16.08 |
| warn | P003_generation_speed_low | BQ12 | tokens_per_second=5.46; avg=16.08 |
| warn | P003_generation_speed_low | BQ14 | tokens_per_second=7.07; avg=16.08 |
| warn | P003_generation_speed_low | BQ16 | tokens_per_second=7.53; avg=16.08 |
| warn | P003_generation_speed_low | BQ22 | tokens_per_second=5.76; avg=16.08 |
| warn | P003_generation_speed_low | BQ25 | tokens_per_second=5.30; avg=16.08 |
