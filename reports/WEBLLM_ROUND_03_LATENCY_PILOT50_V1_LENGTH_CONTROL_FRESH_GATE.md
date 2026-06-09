# WebLLM Round Gate

Generated: 2026-06-09T10:42:16.994Z

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
| warn | P003_generation_speed_low | BQ166 | tokens_per_second=5.75; avg=11.78 |
| warn | P003_generation_speed_low | BQ174 | tokens_per_second=3.80; avg=11.78 |
| warn | P003_generation_speed_low | BQ136 | tokens_per_second=4.23; avg=11.78 |
| warn | P003_generation_speed_low | BQ110 | tokens_per_second=3.83; avg=11.78 |
| warn | P003_generation_speed_low | BQ244 | tokens_per_second=3.84; avg=11.78 |
| warn | P003_generation_speed_low | BQ137 | tokens_per_second=2.01; avg=11.78 |
| warn | P003_generation_speed_low | BQ104 | tokens_per_second=5.59; avg=11.78 |
| warn | P003_generation_speed_low | BQ142 | tokens_per_second=2.95; avg=11.78 |
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=3.92; avg=11.78 |
