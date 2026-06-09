# Misreading And Overconfidence Check

Generated: 2026-06-09T22:26:24.362Z

This check scans delivered answer prose after removing injected `EVIDENCE TAGS`.
It catches prompt leakage, likely negation mismatches, absolute language, and
inference markers that are not present in the evidence.

## Gate

- Pass: true
- Evaluated answers: 191
- Prompt leaks: 0
- Negation mismatch ratio: 0
- Overconfidence ratio: 0.0157
- Unwarranted inference ratio: 0
- Answer source: delivered_answer_text

## Findings

| Query | Intent | Prompt Leak | Negation Mismatch | Overconfidence Terms | Inference Terms |
|---|---|---|---|---|---|
| BQ156 | method_process_question | no | no | must | none |
| BQ157 | method_process_question | no | no | must | none |
| BQ249 | method_process_question | no | no | must | none |
