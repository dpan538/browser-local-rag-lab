# V3.1 Answer Faithfulness Check

Generated: 2026-06-10T00:00:23.570Z

This check reviews Qwen-generated prose after removing injected `EVIDENCE TAGS`.
Deterministic hybrid rows and expected-refusal rows are excluded by default.

## Gate

- Pass: true
- Evaluated Qwen answer bodies: 191
- Suspicious answer count: 7
- Suspicious answer ratio: 0.0366
- Suspicious ratio threshold: 0.1
- Date hallucination count: 0

## Findings

| Query | Intent | Date Issues | Entity Issues | Items |
|---|---|---:|---:|---|
| BQ060 | current_object_explanation | 0 | 2 | possible_name_or_place: Latin American; possible_name_or_place: Spanish Constitution. |
| BQ062 | current_object_explanation | 0 | 1 | possible_name_or_place: Latin American |
| BQ109 | comparison | 0 | 2 | possible_name_or_place: One; possible_name_or_place: Latin American |
| BQ113 | comparison | 0 | 2 | possible_name_or_place: Japanese; possible_name_or_place: Japanese Army's |
| BQ145 | region_period_recommendation | 0 | 2 | possible_name_or_place: France. While; possible_name_or_place: Strasbourg. Given |
| BQ231 | comparison | 0 | 2 | possible_name_or_place: United States; possible_name_or_place: British Empire. The |
| BQ244 | region_period_recommendation | 0 | 1 | possible_name_or_place: South Asian |
