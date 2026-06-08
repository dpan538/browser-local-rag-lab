# WebLLM Round Gate

Generated: 2026-06-08T11:49:40.928Z

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
- Gate warnings: 7
- Blocking findings: 0
- Performance observations: 7
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ06 | tokens_per_second=10.39; avg=21.24 |
| warn | P003_generation_speed_low | BQ08 | tokens_per_second=10.18; avg=21.24 |
| warn | P003_generation_speed_low | BQ14 | tokens_per_second=9.95; avg=21.24 |
| warn | P003_generation_speed_low | BQ19 | tokens_per_second=9.60; avg=21.24 |
| warn | P003_generation_speed_low | BQ20 | tokens_per_second=9.67; avg=21.24 |
| warn | P003_generation_speed_low | BQ21 | tokens_per_second=9.66; avg=21.24 |
| warn | P003_generation_speed_low | BQ22 | tokens_per_second=9.62; avg=21.24 |
