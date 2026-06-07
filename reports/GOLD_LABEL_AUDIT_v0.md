# Gold Label Audit v0

Generated: 2026-06-07T02:37:57.652Z

This audit checks label consistency against the adjudication guide. It does not
judge generated model answers.

## Summary

- Labels: 30
- Stable by rule: 16
- Needs human/method review: 14
- Fail findings: 0
- Warning findings: 2

## By Intent

| Intent | Total | Stable by rule | Needs review | Fails | Warnings |
|---|---:|---:|---:|---:|---:|
| archive_orientation | 3 | 3 | 0 | 0 | 0 |
| casual_archive_help | 2 | 2 | 0 | 0 | 0 |
| comparison | 2 | 0 | 2 | 0 | 0 |
| current_object_explanation | 3 | 3 | 0 | 0 | 0 |
| first_earliest_claim | 3 | 0 | 3 | 0 | 0 |
| method_process_question | 2 | 0 | 2 | 0 | 2 |
| more_context | 2 | 0 | 2 | 0 | 0 |
| no_evidence_refusal | 3 | 3 | 0 | 0 | 0 |
| region_period_recommendation | 5 | 0 | 5 | 0 | 0 |
| source_rights_question | 5 | 5 | 0 | 0 | 0 |

## Review Queue

| Query | Intent | Lane | Stable by rule | Needs review | Findings |
|---|---|---|---|---|---|
| BQ09 | first_earliest_claim | research_answer | no | yes | method review |
| BQ10 | first_earliest_claim | research_answer | no | yes | method review |
| BQ11 | first_earliest_claim | research_answer | no | yes | method review |
| BQ12 | comparison | research_answer | no | yes | method review |
| BQ13 | comparison | research_answer | no | yes | method review |
| BQ14 | region_period_recommendation | research_answer | no | yes | method review |
| BQ15 | region_period_recommendation | research_answer | no | yes | method review |
| BQ16 | region_period_recommendation | research_answer | no | yes | method review |
| BQ17 | region_period_recommendation | research_answer | no | yes | method review |
| BQ18 | region_period_recommendation | research_answer | no | yes | method review |
| BQ23 | method_process_question | research_answer | no | yes | warn:insufficient_without_refusal |
| BQ24 | method_process_question | research_answer | no | yes | warn:insufficient_without_refusal |
| BQ25 | more_context | research_answer | no | yes | method review |
| BQ26 | more_context | research_answer | no | yes | method review |

## Interpretation

- Stable-by-rule labels can be promoted after a quick spot check.
- Review-queue labels need method review, not blind preference testing.
- First/earliest, comparison, region-period, method, and more-context questions
  should remain non-final until their evidence sufficiency is manually checked.
