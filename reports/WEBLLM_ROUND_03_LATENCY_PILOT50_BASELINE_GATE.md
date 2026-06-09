# WebLLM Round Gate

Generated: 2026-06-09T10:19:40.232Z

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
- Gate warnings: 8
- Blocking findings: 0
- Performance observations: 8
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ166 | tokens_per_second=5.74; avg=11.51 |
| warn | P003_generation_speed_low | BQ173 | tokens_per_second=5.25; avg=11.51 |
| warn | P003_generation_speed_low | BQ110 | tokens_per_second=1.53; avg=11.51 |
| warn | P003_generation_speed_low | BQ242 | tokens_per_second=4.21; avg=11.51 |
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=3.92; avg=11.51 |
| warn | P003_generation_speed_low | BQ162 | tokens_per_second=4.50; avg=11.51 |
| warn | P003_generation_speed_low | BQ223 | tokens_per_second=5.10; avg=11.51 |
| warn | P003_generation_speed_low | BQ096 | tokens_per_second=5.18; avg=11.51 |
