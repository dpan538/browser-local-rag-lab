# WebLLM Round Gate

Generated: 2026-06-08T10:26:53.930Z

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
- Gate warnings: 35
- Blocking findings: 0
- Performance observations: 35
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ05 | tokens_per_second=4.11; avg=13.44 |
| warn | P003_generation_speed_low | BQ07 | tokens_per_second=3.54; avg=13.44 |
| warn | P003_generation_speed_low | BQ064 | tokens_per_second=6.33; avg=13.44 |
| warn | P003_generation_speed_low | BQ066 | tokens_per_second=5.40; avg=13.44 |
| warn | P003_generation_speed_low | BQ069 | tokens_per_second=6.42; avg=13.44 |
| warn | P003_generation_speed_low | BQ074 | tokens_per_second=5.67; avg=13.44 |
| warn | P003_generation_speed_low | BQ080 | tokens_per_second=5.21; avg=13.44 |
| warn | P003_generation_speed_low | BQ082 | tokens_per_second=4.45; avg=13.44 |
| warn | P003_generation_speed_low | BQ088 | tokens_per_second=5.88; avg=13.44 |
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=2.99; avg=13.44 |
| warn | P003_generation_speed_low | BQ094 | tokens_per_second=6.70; avg=13.44 |
| warn | P003_generation_speed_low | BQ096 | tokens_per_second=5.20; avg=13.44 |
| warn | P003_generation_speed_low | BQ097 | tokens_per_second=6.37; avg=13.44 |
| warn | P003_generation_speed_low | BQ099 | tokens_per_second=6.12; avg=13.44 |
| warn | P003_generation_speed_low | BQ101 | tokens_per_second=5.85; avg=13.44 |
| warn | P003_generation_speed_low | BQ103 | tokens_per_second=5.31; avg=13.44 |
| warn | P003_generation_speed_low | BQ105 | tokens_per_second=6.55; avg=13.44 |
| warn | P003_generation_speed_low | BQ112 | tokens_per_second=6.69; avg=13.44 |
| warn | P003_generation_speed_low | BQ120 | tokens_per_second=6.51; avg=13.44 |
| warn | P003_generation_speed_low | BQ133 | tokens_per_second=5.01; avg=13.44 |
| warn | P003_generation_speed_low | BQ136 | tokens_per_second=4.61; avg=13.44 |
| warn | P003_generation_speed_low | BQ139 | tokens_per_second=5.38; avg=13.44 |
| warn | P003_generation_speed_low | BQ161 | tokens_per_second=6.18; avg=13.44 |
| warn | P003_generation_speed_low | BQ162 | tokens_per_second=3.38; avg=13.44 |
| warn | P003_generation_speed_low | BQ164 | tokens_per_second=4.29; avg=13.44 |
| warn | P003_generation_speed_low | BQ165 | tokens_per_second=6.12; avg=13.44 |
| warn | P003_generation_speed_low | BQ166 | tokens_per_second=5.44; avg=13.44 |
| warn | P003_generation_speed_low | BQ167 | tokens_per_second=3.42; avg=13.44 |
| warn | P003_generation_speed_low | BQ168 | tokens_per_second=4.64; avg=13.44 |
| warn | P003_generation_speed_low | BQ169 | tokens_per_second=3.41; avg=13.44 |
| warn | P003_generation_speed_low | BQ170 | tokens_per_second=5.27; avg=13.44 |
| warn | P003_generation_speed_low | BQ172 | tokens_per_second=4.30; avg=13.44 |
| warn | P003_generation_speed_low | BQ173 | tokens_per_second=4.02; avg=13.44 |
| warn | P003_generation_speed_low | BQ174 | tokens_per_second=2.88; avg=13.44 |
| warn | P003_generation_speed_low | BQ175 | tokens_per_second=4.24; avg=13.44 |
