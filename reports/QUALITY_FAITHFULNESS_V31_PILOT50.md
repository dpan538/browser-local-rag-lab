# V3.1 Answer Faithfulness Check

Generated: 2026-06-09T14:17:55.896Z

This check reviews Qwen-generated prose after removing injected `EVIDENCE TAGS`.
Deterministic hybrid rows and expected-refusal rows are excluded by default.

## Gate

- Pass: false
- Evaluated Qwen answer bodies: 36
- Suspicious answer count: 1
- Suspicious answer ratio: 0.0278
- Suspicious ratio threshold: 0.1
- Date hallucination count: 2

## Findings

| Query | Intent | Date Issues | Entity Issues | Items |
|---|---|---:|---:|---|
| BQ12 | comparison | 2 | 0 | date_not_in_evidence: 1970; date_not_in_evidence: 2026 |
