# WebLLM Round Gate

Generated: 2026-06-09T10:33:50.785Z

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
- Gate warnings: 6
- Blocking findings: 0
- Performance observations: 6
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ169 | tokens_per_second=3.83; avg=7.75 |
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=2.21; avg=7.75 |
| warn | P003_generation_speed_low | BQ227 | tokens_per_second=3.69; avg=7.75 |
| warn | P003_generation_speed_low | BQ223 | tokens_per_second=3.71; avg=7.75 |
| warn | P003_generation_speed_low | BQ096 | tokens_per_second=3.68; avg=7.75 |
| warn | P003_generation_speed_low | BQ100 | tokens_per_second=3.83; avg=7.75 |
