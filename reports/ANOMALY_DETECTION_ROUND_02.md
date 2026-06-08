# Anomaly Detection Round 02

Generated: 2026-06-08T06:35:30.043Z

This scan catches runtime, evidence-label, review-state, distribution, and
evidence-value anomalies that are not fully represented by a single audit.

## Summary

- Labels: 30
- Answers: 30
- Total anomalies: 8
- Fail findings: 0
- Warning findings: 8
- Info findings: 0

## Findings

| Severity | Code | Query/Record | Field | Detail |
|---|---|---|---|---|
| warn | M2_generation_speed_low | BQ06 | n/a | tokens_per_second=5.62; avg=16.19 |
| warn | M2_generation_speed_low | BQ08 | n/a | tokens_per_second=8.04; avg=16.19 |
| warn | M2_generation_speed_low | BQ12 | n/a | tokens_per_second=5.87; avg=16.19 |
| warn | M2_generation_speed_low | BQ13 | n/a | tokens_per_second=5.96; avg=16.19 |
| warn | M2_generation_speed_low | BQ19 | n/a | tokens_per_second=8.08; avg=16.19 |
| warn | M2_generation_speed_low | BQ22 | n/a | tokens_per_second=8.06; avg=16.19 |
| warn | M2_generation_speed_low | BQ25 | n/a | tokens_per_second=7.63; avg=16.19 |
| warn | M2_generation_speed_low | BQ26 | n/a | tokens_per_second=7.69; avg=16.19 |
