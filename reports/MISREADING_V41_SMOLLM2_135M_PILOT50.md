# Misreading And Overconfidence Check

Generated: 2026-06-10T07:23:23.787Z

This check scans delivered answer prose after removing injected `EVIDENCE TAGS`.
It catches prompt leakage, likely negation mismatches, absolute language, and
inference markers that are not present in the evidence.

## Gate

- Pass: true
- Evaluated answers: 36
- Prompt leaks: 0
- Negation mismatch ratio: 0.0278
- Overconfidence ratio: 0
- Unwarranted inference ratio: 0
- Answer source: delivered_answer_text

## Findings

| Query | Intent | Prompt Leak | Negation Mismatch | Overconfidence Terms | Inference Terms |
|---|---|---|---|---|---|
| BQ30 | casual_archive_help | no | yes | none | none |
