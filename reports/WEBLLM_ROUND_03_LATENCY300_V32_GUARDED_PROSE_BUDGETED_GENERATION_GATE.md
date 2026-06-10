# WebLLM Round Gate

Generated: 2026-06-10T00:00:23.274Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 300
- Result rows: 300
- Completed rows: 300
- Deterministic hybrid rows: 109
- Qwen model-generation rows: 191
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
| warn | P003_generation_speed_low | BQ036 | tokens_per_second=1.83; avg=12.39 |
| warn | P003_generation_speed_low | BQ082 | tokens_per_second=4.36; avg=12.39 |
| warn | P003_generation_speed_low | BQ104 | tokens_per_second=6.01; avg=12.39 |
| warn | P003_generation_speed_low | BQ114 | tokens_per_second=6.03; avg=12.39 |
| warn | P003_generation_speed_low | BQ120 | tokens_per_second=5.58; avg=12.39 |
| warn | P003_generation_speed_low | BQ214 | tokens_per_second=5.64; avg=12.39 |
| warn | P003_generation_speed_low | BQ242 | tokens_per_second=6.13; avg=12.39 |
