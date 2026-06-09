# V3.1 Answer Faithfulness Check

Generated: 2026-06-09T14:32:01.532Z

This check reviews Qwen-generated prose after removing injected `EVIDENCE TAGS`.
Deterministic hybrid rows and expected-refusal rows are excluded by default.

## Gate

- Pass: false
- Evaluated Qwen answer bodies: 191
- Suspicious answer count: 21
- Suspicious answer ratio: 0.1099
- Suspicious ratio threshold: 0.1
- Date hallucination count: 5

## Findings

| Query | Intent | Date Issues | Entity Issues | Items |
|---|---|---:|---:|---|
| BQ25 | more_context | 0 | 1 | possible_name_or_place: Soviet-era |
| BQ068 | current_object_explanation | 0 | 1 | possible_name_or_place: Japanese |
| BQ072 | current_object_explanation | 0 | 1 | possible_name_or_place: PAVILLIONS D'INDOCHINE. |
| BQ104 | comparison | 0 | 1 | possible_name_or_place: Rio Grande. Both |
| BQ107 | comparison | 0 | 1 | possible_name_or_place: Both |
| BQ113 | comparison | 0 | 1 | possible_name_or_place: Both |
| BQ115 | comparison | 2 | 0 | date_not_in_evidence: 2026; date_not_in_evidence: 1830 |
| BQ129 | region_period_recommendation | 0 | 3 | possible_name_or_place: Reason; possible_name_or_place: Matches Global; possible_name_or_place: Grounded |
| BQ133 | region_period_recommendation | 0 | 1 | possible_name_or_place: Explore Global |
| BQ137 | region_period_recommendation | 0 | 1 | possible_name_or_place: France Generate |
| BQ145 | region_period_recommendation | 0 | 3 | possible_name_or_place: Primary; possible_name_or_place: France Output; possible_name_or_place: Write |
| BQ162 | more_context | 0 | 1 | possible_name_or_place: United Kingdom. Therefore |
| BQ170 | more_context | 1 | 0 | date_not_in_evidence: 1860s |
| BQ229 | comparison | 0 | 1 | possible_name_or_place: Chilean |
| BQ233 | comparison | 1 | 0 | date_not_in_evidence: 1869 |
| BQ234 | comparison | 0 | 1 | possible_name_or_place: Zanzibar. Both |
| BQ239 | region_period_recommendation | 0 | 3 | possible_name_or_place: Primary; possible_name_or_place: Chile Output; possible_name_or_place: Write |
| BQ245 | region_period_recommendation | 0 | 3 | possible_name_or_place: Recommendation; possible_name_or_place: Conclusion; possible_name_or_place: Combine |
| BQ246 | region_period_recommendation | 0 | 1 | possible_name_or_place: Recommendation |
| BQ248 | region_period_recommendation | 0 | 1 | possible_name_or_place: France. Reasoning |
| BQ255 | more_context | 1 | 0 | date_not_in_evidence: 1741 |
