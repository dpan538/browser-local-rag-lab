# WebLLM Round Gate

Generated: 2026-06-09T11:55:32.007Z

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
- Gate warnings: 1
- Blocking findings: 0
- Performance observations: 1
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=3.04; avg=9.51 |
