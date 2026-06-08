# WebLLM Round Gate

Generated: 2026-06-08T08:34:05.107Z

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
| warn | P003_generation_speed_low | BQ07 | tokens_per_second=7.83; avg=19.52 |
| warn | P003_generation_speed_low | BQ08 | tokens_per_second=7.78; avg=19.52 |
| warn | P003_generation_speed_low | BQ12 | tokens_per_second=8.50; avg=19.52 |
| warn | P003_generation_speed_low | BQ13 | tokens_per_second=9.15; avg=19.52 |
| warn | P003_generation_speed_low | BQ16 | tokens_per_second=9.39; avg=19.52 |
| warn | P003_generation_speed_low | BQ19 | tokens_per_second=8.28; avg=19.52 |
| warn | P003_generation_speed_low | BQ20 | tokens_per_second=7.22; avg=19.52 |
| warn | P003_generation_speed_low | BQ22 | tokens_per_second=9.70; avg=19.52 |
