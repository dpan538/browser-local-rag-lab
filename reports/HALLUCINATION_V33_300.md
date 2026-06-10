# Hallucination And Unsupported Fact Check

Generated: 2026-06-10T06:07:47.207Z

This check reviews delivered answer prose after removing injected `EVIDENCE TAGS`.
It flags unsupported years, unsupported named terms, and simple unsupported
subject-relation-object assertions.

## Gate

- Pass: true
- Evaluated answers: 191
- Unsupported date count: 0
- Unsupported triple answer ratio: 0.0052
- Unsupported triple threshold: 0.05
- Unsupported entity answer ratio: 0.0314
- Unsupported entity threshold: 0.1
- Answer source: delivered_answer_text

## Findings

| Query | Intent | Unsupported Dates | Unsupported Entities | Unsupported Triples |
|---|---|---|---|---|
| BQ031 | archive_orientation | none | Specific | none |
| BQ110 | comparison | none | Brazil | none |
| BQ113 | comparison | none | Japanese | none |
| BQ115 | comparison | none | South Asian | none |
| BQ230 | comparison | none | South Asia Indian; Latin American Mexico | none |
| BQ232 | comparison | none | Caribbean | [wrong_entity] an early is from the Caribbean, while the second is from Latin America/Mexico |
