# Anomaly Detection Round 02

Generated: 2026-06-08T08:58:51.781Z

This scan catches runtime, evidence-label, review-state, distribution, and
evidence-value anomalies that are not fully represented by a single audit.

## Summary

- Labels: 200
- Answers: 200
- Total anomalies: 8
- Fail findings: 0
- Warning findings: 8
- Info findings: 0

## Findings

| Severity | Code | Query/Record | Field | Detail |
|---|---|---|---|---|
| warn | M2_generation_speed_low | BQ08 | n/a | tokens_per_second=8.06; avg=16.71 |
| warn | M2_generation_speed_low | BQ088 | n/a | tokens_per_second=5.43; avg=16.71 |
| warn | M2_generation_speed_low | BQ089 | n/a | tokens_per_second=3.49; avg=16.71 |
| warn | M2_generation_speed_low | BQ094 | n/a | tokens_per_second=7.64; avg=16.71 |
| warn | M2_generation_speed_low | BQ096 | n/a | tokens_per_second=6.45; avg=16.71 |
| warn | M2_generation_speed_low | BQ124 | n/a | tokens_per_second=8.32; avg=16.71 |
| warn | M2_generation_speed_low | BQ167 | n/a | tokens_per_second=7.66; avg=16.71 |
| warn | M2_generation_speed_low | BQ169 | n/a | tokens_per_second=7.38; avg=16.71 |
