# V3.1 Answer Faithfulness Check

Generated: 2026-06-10T05:55:52.479Z

This check reviews Qwen-generated prose after removing injected `EVIDENCE TAGS`.
Deterministic hybrid rows and expected-refusal rows are excluded by default.

## Gate

- Pass: true
- Evaluated Qwen answer bodies: 36
- Suspicious answer count: 1
- Suspicious answer ratio: 0.0278
- Suspicious ratio threshold: 0.1
- Date hallucination count: 0

## Findings

| Query | Intent | Date Issues | Entity Issues | Items |
|---|---|---:|---:|---|
| BQ031 | archive_orientation | 0 | 1 | possible_name_or_place: Specific |
