# Hallucination And Unsupported Fact Check

Generated: 2026-06-10T07:23:23.693Z

This check reviews delivered answer prose after removing injected `EVIDENCE TAGS`.
It flags unsupported years, unsupported named terms, and simple unsupported
subject-relation-object assertions.

## Gate

- Pass: false
- Evaluated answers: 36
- Unsupported date count: 0
- Unsupported triple answer ratio: 0
- Unsupported triple threshold: 0.05
- Unsupported entity answer ratio: 0.1111
- Unsupported entity threshold: 0.1
- Answer source: delivered_answer_text

## Findings

| Query | Intent | Unsupported Dates | Unsupported Entities | Unsupported Triples |
|---|---|---|---|---|
| BQ01 | archive_orientation | none | Question; Intent; Start | none |
| BQ05 | current_object_explanation | none | Output; DOCTYPE; DTD XHTML; Transitional | none |
| BQ07 | current_object_explanation | none | Output; DOCTYPE | none |
| BQ042 | archive_orientation | none | Intent; Start | none |
