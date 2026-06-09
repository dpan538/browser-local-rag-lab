# V3.1 Answer Usability Check

Generated: 2026-06-09T14:32:31.625Z

This check reviews Qwen-generated prose after removing injected `EVIDENCE TAGS`.
It is a fast screen for extremely short or obviously off-topic answer bodies, not a
replacement for human semantic review.

## Gate

- Pass: false
- Evaluated Qwen answer bodies: 191
- Too-short count: 1
- Too-short ratio: 0.0052
- Too-short ratio threshold: 0.05
- Off-topic count: 23
- Off-topic ratio: 0.1204
- Off-topic ratio threshold: 0.05

## Flagged Rows

| Query | Intent | Answer Words | Query/Answer Jaccard | Too Short | Off Topic |
|---|---|---:|---:|---|---|
| BQ05 | current_object_explanation | 5 | 0 | false | true |
| BQ07 | current_object_explanation | 5 | 0 | false | true |
| BQ058 | current_object_explanation | 11 | 0 | false | true |
| BQ059 | current_object_explanation | 7 | 0 | false | true |
| BQ060 | current_object_explanation | 8 | 0 | false | true |
| BQ061 | current_object_explanation | 12 | 0 | false | true |
| BQ062 | current_object_explanation | 3 | 0.75 | true | false |
| BQ063 | current_object_explanation | 6 | 0 | false | true |
| BQ064 | current_object_explanation | 6 | 0 | false | true |
| BQ067 | current_object_explanation | 11 | 0 | false | true |
| BQ070 | current_object_explanation | 17 | 0 | false | true |
| BQ071 | current_object_explanation | 8 | 0 | false | true |
| BQ073 | current_object_explanation | 4 | 0 | false | true |
| BQ074 | current_object_explanation | 9 | 0 | false | true |
| BQ075 | current_object_explanation | 5 | 0 | false | true |
| BQ076 | current_object_explanation | 18 | 0 | false | true |
| BQ078 | current_object_explanation | 5 | 0 | false | true |
| BQ079 | current_object_explanation | 5 | 0 | false | true |
| BQ080 | current_object_explanation | 7 | 0 | false | true |
| BQ172 | more_context | 63 | 0 | false | true |
| BQ213 | current_object_explanation | 29 | 0 | false | true |
| BQ214 | current_object_explanation | 9 | 0 | false | true |
| BQ215 | current_object_explanation | 6 | 0 | false | true |
| BQ216 | current_object_explanation | 8 | 0 | false | true |
