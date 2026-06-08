# WebLLM Round Gate

Generated: 2026-06-08T12:25:21.574Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 300
- Result rows: 300
- Completed rows: 300
- Error rows: 0
- Metric issues: 0
- Contract failures: 0
- Contract warnings: 0
- Gate warnings: 30
- Blocking findings: 0
- Performance observations: 30
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | P003_generation_speed_low | BQ062 | tokens_per_second=8.29; avg=17.02 |
| warn | P003_generation_speed_low | BQ088 | tokens_per_second=7.17; avg=17.02 |
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=3.67; avg=17.02 |
| warn | P003_generation_speed_low | BQ096 | tokens_per_second=6.41; avg=17.02 |
| warn | P003_generation_speed_low | BQ097 | tokens_per_second=8.25; avg=17.02 |
| warn | P003_generation_speed_low | BQ099 | tokens_per_second=7.90; avg=17.02 |
| warn | P003_generation_speed_low | BQ101 | tokens_per_second=7.66; avg=17.02 |
| warn | P003_generation_speed_low | BQ103 | tokens_per_second=8.48; avg=17.02 |
| warn | P003_generation_speed_low | BQ105 | tokens_per_second=6.61; avg=17.02 |
| warn | P003_generation_speed_low | BQ115 | tokens_per_second=8.39; avg=17.02 |
| warn | P003_generation_speed_low | BQ123 | tokens_per_second=8.05; avg=17.02 |
| warn | P003_generation_speed_low | BQ131 | tokens_per_second=7.00; avg=17.02 |
| warn | P003_generation_speed_low | BQ136 | tokens_per_second=8.35; avg=17.02 |
| warn | P003_generation_speed_low | BQ138 | tokens_per_second=6.23; avg=17.02 |
| warn | P003_generation_speed_low | BQ142 | tokens_per_second=6.79; avg=17.02 |
| warn | P003_generation_speed_low | BQ161 | tokens_per_second=7.07; avg=17.02 |
| warn | P003_generation_speed_low | BQ162 | tokens_per_second=6.33; avg=17.02 |
| warn | P003_generation_speed_low | BQ167 | tokens_per_second=6.32; avg=17.02 |
| warn | P003_generation_speed_low | BQ169 | tokens_per_second=7.20; avg=17.02 |
| warn | P003_generation_speed_low | BQ173 | tokens_per_second=5.53; avg=17.02 |
| warn | P003_generation_speed_low | BQ174 | tokens_per_second=7.23; avg=17.02 |
| warn | P003_generation_speed_low | BQ213 | tokens_per_second=8.07; avg=17.02 |
| warn | P003_generation_speed_low | BQ214 | tokens_per_second=8.07; avg=17.02 |
| warn | P003_generation_speed_low | BQ220 | tokens_per_second=7.90; avg=17.02 |
| warn | P003_generation_speed_low | BQ222 | tokens_per_second=7.38; avg=17.02 |
| warn | P003_generation_speed_low | BQ223 | tokens_per_second=6.36; avg=17.02 |
| warn | P003_generation_speed_low | BQ224 | tokens_per_second=8.44; avg=17.02 |
| warn | P003_generation_speed_low | BQ227 | tokens_per_second=6.26; avg=17.02 |
| warn | P003_generation_speed_low | BQ230 | tokens_per_second=6.47; avg=17.02 |
| warn | P003_generation_speed_low | BQ243 | tokens_per_second=8.39; avg=17.02 |
