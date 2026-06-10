# Hallucination And Unsupported Fact Check

Generated: 2026-06-10T00:00:24.065Z

This check reviews delivered answer prose after removing injected `EVIDENCE TAGS`.
It flags unsupported years, unsupported named terms, and simple unsupported
subject-relation-object assertions.

## Gate

- Pass: true
- Evaluated answers: 191
- Unsupported date count: 0
- Unsupported triple answer ratio: 0.0105
- Unsupported triple threshold: 0.05
- Unsupported entity answer ratio: 0.0366
- Unsupported entity threshold: 0.1
- Answer source: delivered_answer_text

## Findings

| Query | Intent | Unsupported Dates | Unsupported Entities | Unsupported Triples |
|---|---|---|---|---|
| BQ060 | current_object_explanation | none | Latin American; Spanish Constitution. | none |
| BQ062 | current_object_explanation | none | Latin American | none |
| BQ109 | comparison | none | Latin American | none |
| BQ113 | comparison | none | Japanese; Japanese Army's | [wrong_entity] the primary evidence is the 1863 Japanese aerial photograph of the Japanese Army's headquarters in Tokyo, while the secondary record provides the 19th-century sculptress from France |
| BQ145 | region_period_recommendation | none | Strasbourg. Given | none |
| BQ231 | comparison | none | British Empire. The | [wrong_entity] the present. The primary source is the 1830-1922 trade card, which details the movement of goods between the United States and the British Empire |
| BQ244 | region_period_recommendation | none | South Asian | none |
