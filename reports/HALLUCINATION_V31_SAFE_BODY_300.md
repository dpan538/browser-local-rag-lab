# Hallucination And Unsupported Fact Check

Generated: 2026-06-09T22:26:24.237Z

This check reviews delivered answer prose after removing injected `EVIDENCE TAGS`.
It flags unsupported years, unsupported named terms, and simple unsupported
subject-relation-object assertions.

## Gate

- Pass: true
- Evaluated answers: 191
- Unsupported date count: 0
- Unsupported triple answer ratio: 0.0105
- Unsupported triple threshold: 0.05
- Unsupported entity answer ratio: 0.0157
- Unsupported entity threshold: 0.1
- Answer source: delivered_answer_text

## Findings

| Query | Intent | Unsupported Dates | Unsupported Entities | Unsupported Triples |
|---|---|---|---|---|
| BQ176 | more_context | none | Communist Party | which is a 1970 Soviet Union publication by the Communist Party of the Soviet Union (1970 CPA 3886) |
| BQ213 | current_object_explanation | none | PAVILLIONS D'INDOCHINE. | none |
| BQ232 | comparison | none | Caribbean; Americas. The | era and region. The first is from the 1840s in the Caribbean, while the second is from 1846 in the Americas; The first is from the 1840s in the Caribbean, while the second is from 1846 in the Americas |
