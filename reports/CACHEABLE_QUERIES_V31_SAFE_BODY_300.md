# V3.1 Cacheable Query Probe

Generated: 2026-06-09T22:26:24.660Z

This probe looks only at non-deterministic Qwen rows. It groups answers by
`gold_evidence_ids` to identify whether any remaining model-generation lanes
could later be handled by exact answer caching or template caching.

## Summary

- Evidence groups: 155
- Repeated evidence groups: 14
- Cacheable candidates: 4

## Groups

| Evidence IDs | Query Count | Cacheability | Queries |
|---|---:|---|---|
| SURF-CRG2026R0153 | 2 | exact_answer_cache_candidate | BQ074, BQ214 |
| SURF-GAX1970R001 | 3 | not_obvious | BQ05, BQ06, BQ07 |
| SURF-CRG2026R0001 + SURF-CRG2026R0050 | 3 | not_obvious | BQ031, BQ128, BQ174 |
| SURF-COM1970R007 + SURF-CRG2026R0235 | 2 | not_obvious | BQ12, BQ13 |
| SURF-COM1970R007 + SURF-CRG2026R0071 + SURF-CRG2026R0274 | 2 | not_obvious | BQ25, BQ26 |
| SURF-CRG2026R0031 + SURF-CRG2026R0032 | 2 | not_obvious | BQ30, BQ243 |
| SURF-CRG2026R0051 + SURF-GAX1970R002 | 2 | not_obvious | BQ032, BQ175 |
| SURF-CRG2026R0052 + SURF-GA1970R001 | 2 | not_obvious | BQ033, BQ176 |
| SURF-CGS2026R0904 | 2 | not_obvious | BQ063, BQ208 |
| SURF-CGS2026R0031 | 2 | not_obvious | BQ064, BQ207 |
| SURF-CRG2026R0027 | 2 | not_obvious | BQ068, BQ212 |
| LAB-METHOD-CONTEXT-V0 | 22 | template_cache_review_candidate | BQ23, BQ24, BQ147, BQ148, BQ149, BQ150, BQ151, BQ152, BQ153, BQ154, BQ155, BQ156, BQ157, BQ158, BQ159, BQ160, BQ249, BQ250, BQ251, BQ252, BQ253, BQ254 |
| SURF-CRG2026R0006 | 2 | template_cache_review_candidate | BQ050, BQ211 |
| SURF-CRG2026R0100 | 2 | template_cache_review_candidate | BQ072, BQ213 |
