# V3.1 Answer Faithfulness Check

Generated: 2026-06-09T22:26:23.927Z

This check reviews Qwen-generated prose after removing injected `EVIDENCE TAGS`.
Deterministic hybrid rows and expected-refusal rows are excluded by default.

## Gate

- Pass: true
- Evaluated Qwen answer bodies: 191
- Suspicious answer count: 12
- Suspicious answer ratio: 0.0628
- Suspicious ratio threshold: 0.1
- Date hallucination count: 0

## Findings

| Query | Intent | Date Issues | Entity Issues | Items |
|---|---|---:|---:|---|
| BQ14 | region_period_recommendation | 0 | 1 | possible_name_or_place: French |
| BQ128 | region_period_recommendation | 0 | 1 | possible_name_or_place: Reasoning |
| BQ144 | region_period_recommendation | 0 | 2 | possible_name_or_place: Recommendation; possible_name_or_place: French |
| BQ176 | more_context | 0 | 1 | possible_name_or_place: Communist Party |
| BQ213 | current_object_explanation | 0 | 1 | possible_name_or_place: PAVILLIONS D'INDOCHINE. |
| BQ229 | comparison | 0 | 1 | possible_name_or_place: Chilean |
| BQ230 | comparison | 0 | 1 | possible_name_or_place: South Indian |
| BQ232 | comparison | 0 | 2 | possible_name_or_place: Caribbean; possible_name_or_place: Americas. The |
| BQ237 | comparison | 0 | 1 | possible_name_or_place: Both |
| BQ245 | region_period_recommendation | 0 | 1 | possible_name_or_place: Recommendation |
| BQ246 | region_period_recommendation | 0 | 1 | possible_name_or_place: Recommendation |
| BQ248 | region_period_recommendation | 0 | 2 | possible_name_or_place: Conclusion; possible_name_or_place: Reasoning |
