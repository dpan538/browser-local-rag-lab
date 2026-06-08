# WebLLM Round Gate

Generated: 2026-06-08T08:58:46.655Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 200
- Result rows: 200
- Completed rows: 200
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
| warn | P003_generation_speed_low | BQ08 | tokens_per_second=8.06; avg=16.71 |
| warn | P003_generation_speed_low | BQ088 | tokens_per_second=5.43; avg=16.71 |
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=3.49; avg=16.71 |
| warn | P003_generation_speed_low | BQ094 | tokens_per_second=7.64; avg=16.71 |
| warn | P003_generation_speed_low | BQ096 | tokens_per_second=6.45; avg=16.71 |
| warn | P003_generation_speed_low | BQ124 | tokens_per_second=8.32; avg=16.71 |
| warn | P003_generation_speed_low | BQ167 | tokens_per_second=7.66; avg=16.71 |
| warn | P003_generation_speed_low | BQ169 | tokens_per_second=7.38; avg=16.71 |
