# Hallucination And Unsupported Fact Check

Generated: 2026-06-10T07:44:34.085Z

This check reviews delivered answer prose after removing injected `EVIDENCE TAGS`.
It flags unsupported years, unsupported named terms, and simple unsupported
subject-relation-object assertions.

## Gate

- Pass: true
- Evaluated answers: 191
- Unsupported date count: 0
- Unsupported triple answer ratio: 0
- Unsupported triple threshold: 0.05
- Unsupported entity answer ratio: 0.0314
- Unsupported entity threshold: 0.1
- Answer source: delivered_answer_text

## Findings

| Query | Intent | Unsupported Dates | Unsupported Entities | Unsupported Triples |
|---|---|---|---|---|
| BQ079 | current_object_explanation | none | France Summary | none |
| BQ081 | current_object_explanation | none | Summary | none |
| BQ131 | region_period_recommendation | none | Next | none |
| BQ211 | casual_archive_help | none | Images | none |
| BQ214 | current_object_explanation | none | Output | none |
| BQ233 | comparison | none | Output | none |
