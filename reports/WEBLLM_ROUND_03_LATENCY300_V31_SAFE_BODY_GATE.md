# WebLLM Round Gate

Generated: 2026-06-09T14:45:09.900Z

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
- Gate warnings: 26
- Blocking findings: 0
- Performance observations: 26
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ05 | tokens_per_second=6.66; avg=14.66 |
| warn | P003_generation_speed_low | BQ12 | tokens_per_second=7.12; avg=14.66 |
| warn | P003_generation_speed_low | BQ072 | tokens_per_second=6.60; avg=14.66 |
| warn | P003_generation_speed_low | BQ103 | tokens_per_second=7.26; avg=14.66 |
| warn | P003_generation_speed_low | BQ105 | tokens_per_second=5.93; avg=14.66 |
| warn | P003_generation_speed_low | BQ107 | tokens_per_second=6.44; avg=14.66 |
| warn | P003_generation_speed_low | BQ108 | tokens_per_second=6.13; avg=14.66 |
| warn | P003_generation_speed_low | BQ109 | tokens_per_second=6.42; avg=14.66 |
| warn | P003_generation_speed_low | BQ110 | tokens_per_second=3.78; avg=14.66 |
| warn | P003_generation_speed_low | BQ112 | tokens_per_second=5.59; avg=14.66 |
| warn | P003_generation_speed_low | BQ113 | tokens_per_second=7.22; avg=14.66 |
| warn | P003_generation_speed_low | BQ114 | tokens_per_second=5.41; avg=14.66 |
| warn | P003_generation_speed_low | BQ115 | tokens_per_second=6.85; avg=14.66 |
| warn | P003_generation_speed_low | BQ116 | tokens_per_second=6.05; avg=14.66 |
| warn | P003_generation_speed_low | BQ117 | tokens_per_second=6.17; avg=14.66 |
| warn | P003_generation_speed_low | BQ118 | tokens_per_second=5.82; avg=14.66 |
| warn | P003_generation_speed_low | BQ119 | tokens_per_second=6.26; avg=14.66 |
| warn | P003_generation_speed_low | BQ120 | tokens_per_second=7.06; avg=14.66 |
| warn | P003_generation_speed_low | BQ121 | tokens_per_second=6.10; avg=14.66 |
| warn | P003_generation_speed_low | BQ122 | tokens_per_second=6.19; avg=14.66 |
| warn | P003_generation_speed_low | BQ162 | tokens_per_second=7.13; avg=14.66 |
| warn | P003_generation_speed_low | BQ230 | tokens_per_second=6.14; avg=14.66 |
| warn | P003_generation_speed_low | BQ231 | tokens_per_second=5.73; avg=14.66 |
| warn | P003_generation_speed_low | BQ233 | tokens_per_second=6.74; avg=14.66 |
| warn | P003_generation_speed_low | BQ234 | tokens_per_second=6.03; avg=14.66 |
| warn | P003_generation_speed_low | BQ236 | tokens_per_second=5.58; avg=14.66 |
