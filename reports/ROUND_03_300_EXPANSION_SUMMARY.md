# Round 03 300-Query Targeted Expansion Summary

Generated: 2026-06-08T11:30:04.609Z

This research-only fixture preserves the completed Round 02 200-query set as
the first 200 rows and appends BQ201-BQ300. The expansion is targeted rather
than random: it raises the high-risk refusal intents above 30 examples, expands
source/rights coverage, and keeps current-object explanation from dominating
the benchmark.

## Summary

- Total queries: 300
- Preserved source queries: 200
- New Round 03 queries: 100
- Records reused: 54
- New batches: 2 x 50
- Validation fail findings: 0
- Validation warning findings: 0
- Overused seed evidence SURF-GAX1970R001: 9/300 (3%)

## Statistical-Power Rationale

The expansion strengthens the two safety/refusal intents most sensitive to
single failures:

- `first_earliest_claim`: 35 examples; zero-failure rule-of-three upper bound approx 8.6%.
- `no_evidence_refusal`: 35 examples; zero-failure rule-of-three upper bound approx 8.6%.

These bounds are design targets for the next WebLLM run, not outcome claims.

## Intent Distribution

| Intent | Round 02 Count | Round 03 Count | Added |
|---|---:|---:|---:|
| archive_orientation | 16 | 22 | 6 |
| casual_archive_help | 16 | 22 | 6 |
| comparison | 28 | 38 | 10 |
| current_object_explanation | 28 | 32 | 4 |
| first_earliest_claim | 15 | 35 | 20 |
| method_process_question | 16 | 22 | 6 |
| more_context | 18 | 24 | 6 |
| no_evidence_refusal | 15 | 35 | 20 |
| region_period_recommendation | 24 | 34 | 10 |
| source_rights_question | 24 | 36 | 12 |

## Validation Issues

| Severity | Code | Query/Record |
|---|---|---|
| none | none | none |

## Files

- `fixtures/expansion/round03_300/queries.jsonl`
- `fixtures/expansion/round03_300/labels.jsonl`
- `fixtures/expansion/round03_300/records.jsonl`
- `fixtures/expansion/round03_300/batches.json`
- `fixtures/expansion/round03_300/README.md`
