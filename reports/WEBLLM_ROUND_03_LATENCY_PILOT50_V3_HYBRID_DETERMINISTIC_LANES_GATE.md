# WebLLM Round Gate

Generated: 2026-06-09T13:43:39.473Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 50
- Result rows: 50
- Completed rows: 50
- Deterministic hybrid rows: 14
- Qwen model-generation rows: 36
- Error rows: 0
- Metric issues: 0
- Contract failures: 0
- Contract warnings: 0
- Gate warnings: 3
- Blocking findings: 0
- Performance observations: 3
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ03 | tokens_per_second=6.25; avg=13.45 |
| warn | P003_generation_speed_low | BQ04 | tokens_per_second=5.10; avg=13.45 |
| warn | P003_generation_speed_low | BQ07 | tokens_per_second=5.77; avg=13.45 |
