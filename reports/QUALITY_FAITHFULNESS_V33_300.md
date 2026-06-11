# V3.1 Answer Faithfulness Check

Generated: 2026-06-11T02:47:53.845Z

This check reviews Qwen-generated prose after removing injected `EVIDENCE TAGS`.
Deterministic hybrid rows and expected-refusal rows are excluded by default.

## Gate

- Pass: true
- Evaluated Qwen answer bodies: 191
- Suspicious answer count: 6
- Suspicious answer ratio: 0.0314
- Suspicious ratio threshold: 0.1
- Date hallucination count: 0

## Findings

| Query | Intent | Date Issues | Entity Issues | Items |
|---|---|---:|---:|---|
| BQ031 | archive_orientation | 0 | 1 | possible_name_or_place: Specific |
| BQ110 | comparison | 0 | 1 | possible_name_or_place: Brazil |
| BQ113 | comparison | 0 | 1 | possible_name_or_place: Japanese |
| BQ115 | comparison | 0 | 1 | possible_name_or_place: South Asian |
| BQ230 | comparison | 0 | 2 | possible_name_or_place: South Asia Indian; possible_name_or_place: Latin American Mexico |
| BQ232 | comparison | 0 | 1 | possible_name_or_place: Caribbean |
