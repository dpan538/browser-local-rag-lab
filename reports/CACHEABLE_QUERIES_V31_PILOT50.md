# V3.1 Cacheable Query Probe

Generated: 2026-06-09T14:17:56.175Z

This probe looks only at non-deterministic Qwen rows. It groups answers by
`gold_evidence_ids` to identify whether any remaining model-generation lanes
could later be handled by exact answer caching or template caching.

## Summary

- Evidence groups: 31
- Repeated evidence groups: 4
- Cacheable candidates: 0

## Groups

| Evidence IDs | Query Count | Cacheability | Queries |
|---|---:|---|---|
| SURF-GAX1970R001 | 3 | not_obvious | BQ05, BQ06, BQ07 |
| SURF-COM1970R007 + SURF-CRG2026R0235 | 2 | not_obvious | BQ12, BQ13 |
| LAB-METHOD-CONTEXT-V0 | 2 | not_obvious | BQ23, BQ24 |
| SURF-COM1970R007 + SURF-CRG2026R0071 + SURF-CRG2026R0274 | 2 | not_obvious | BQ25, BQ26 |
