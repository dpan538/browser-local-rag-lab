# V3.1 Answer Usability Check

Generated: 2026-06-09T14:47:01.476Z

This check reviews Qwen-generated prose after removing injected `EVIDENCE TAGS`.
It is a fast screen for extremely short or obviously off-topic answer bodies, not a
replacement for human semantic review.

## Gate

- Pass: true
- Evaluated Qwen answer bodies: 191
- Too-short count: 1
- Too-short ratio: 0.0052
- Too-short ratio threshold: 0.05
- Off-topic count: 0
- Off-topic ratio: 0
- Off-topic ratio threshold: 0.05

## Flagged Rows

| Query | Intent | Answer Words | Query/Answer Jaccard | Too Short | Off Topic |
|---|---|---:|---:|---|---|
| BQ109 | comparison | 2 | 0.1429 | true | false |
