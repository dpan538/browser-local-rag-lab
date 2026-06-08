# WebLLM Round Gate

Generated: 2026-06-08T07:55:07.789Z

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
- Gate warnings: 25
- Blocking findings: 0
- Performance observations: 25
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ07 | tokens_per_second=6.46; avg=16.35 |
| warn | P003_generation_speed_low | BQ08 | tokens_per_second=6.82; avg=16.35 |
| warn | P003_generation_speed_low | BQ13 | tokens_per_second=7.22; avg=16.35 |
| warn | P003_generation_speed_low | BQ088 | tokens_per_second=7.83; avg=16.35 |
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=4.17; avg=16.35 |
| warn | P003_generation_speed_low | BQ096 | tokens_per_second=7.19; avg=16.35 |
| warn | P003_generation_speed_low | BQ102 | tokens_per_second=7.23; avg=16.35 |
| warn | P003_generation_speed_low | BQ110 | tokens_per_second=7.92; avg=16.35 |
| warn | P003_generation_speed_low | BQ112 | tokens_per_second=7.33; avg=16.35 |
| warn | P003_generation_speed_low | BQ117 | tokens_per_second=8.08; avg=16.35 |
| warn | P003_generation_speed_low | BQ118 | tokens_per_second=5.78; avg=16.35 |
| warn | P003_generation_speed_low | BQ120 | tokens_per_second=6.71; avg=16.35 |
| warn | P003_generation_speed_low | BQ123 | tokens_per_second=7.11; avg=16.35 |
| warn | P003_generation_speed_low | BQ127 | tokens_per_second=6.86; avg=16.35 |
| warn | P003_generation_speed_low | BQ128 | tokens_per_second=5.96; avg=16.35 |
| warn | P003_generation_speed_low | BQ130 | tokens_per_second=6.17; avg=16.35 |
| warn | P003_generation_speed_low | BQ131 | tokens_per_second=8.00; avg=16.35 |
| warn | P003_generation_speed_low | BQ135 | tokens_per_second=6.39; avg=16.35 |
| warn | P003_generation_speed_low | BQ138 | tokens_per_second=6.08; avg=16.35 |
| warn | P003_generation_speed_low | BQ162 | tokens_per_second=7.79; avg=16.35 |
| warn | P003_generation_speed_low | BQ166 | tokens_per_second=6.94; avg=16.35 |
| warn | P003_generation_speed_low | BQ167 | tokens_per_second=5.74; avg=16.35 |
| warn | P003_generation_speed_low | BQ171 | tokens_per_second=7.44; avg=16.35 |
| warn | P003_generation_speed_low | BQ173 | tokens_per_second=8.15; avg=16.35 |
| warn | P003_generation_speed_low | BQ174 | tokens_per_second=8.00; avg=16.35 |
