# WebLLM Round Gate

Generated: 2026-06-08T06:15:05.065Z

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
- Contract warnings: 7
- Gate warnings: 19
- Ready for next step: no

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | CONTRACT_G101_required_field_value_not_observed | BQ01 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ04 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ14 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ14 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ14 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ25 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ26 | answer does not visibly include an evidence value for this required field |
| warn | P003_generation_speed_low | BQ05 | tokens_per_second=8.61; avg=20.34 |
| warn | P003_generation_speed_low | BQ06 | tokens_per_second=8.58; avg=20.34 |
| warn | P003_generation_speed_low | BQ07 | tokens_per_second=9.75; avg=20.34 |
| warn | P003_generation_speed_low | BQ08 | tokens_per_second=9.52; avg=20.34 |
| warn | P003_generation_speed_low | BQ12 | tokens_per_second=6.94; avg=20.34 |
| warn | P003_generation_speed_low | BQ13 | tokens_per_second=6.94; avg=20.34 |
| warn | P003_generation_speed_low | BQ19 | tokens_per_second=9.59; avg=20.34 |
| warn | P003_generation_speed_low | BQ20 | tokens_per_second=9.80; avg=20.34 |
| warn | P003_generation_speed_low | BQ21 | tokens_per_second=9.78; avg=20.34 |
| warn | P003_generation_speed_low | BQ22 | tokens_per_second=9.57; avg=20.34 |
| warn | P003_generation_speed_low | BQ25 | tokens_per_second=8.64; avg=20.34 |
| warn | P003_generation_speed_low | BQ26 | tokens_per_second=8.63; avg=20.34 |
