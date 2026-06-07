# Gold Label Audit v0

Generated: 2026-06-07T03:11:29.638Z

This audit checks label consistency against the adjudication guide. It does not
judge generated model answers.

## Summary

- Labels: 30
- Stable by rule: 16
- Needs human/method review: 14
- Fail findings: 0
- Warning findings: 0
- Anomalies: 1

## By Intent

| Intent | Total | Stable by rule | Needs review | Fails | Warnings |
|---|---:|---:|---:|---:|---:|
| archive_orientation | 3 | 3 | 0 | 0 | 0 |
| casual_archive_help | 2 | 2 | 0 | 0 | 0 |
| comparison | 2 | 0 | 2 | 0 | 0 |
| current_object_explanation | 3 | 3 | 0 | 0 | 0 |
| first_earliest_claim | 3 | 0 | 3 | 0 | 0 |
| method_process_question | 2 | 0 | 2 | 0 | 0 |
| more_context | 2 | 0 | 2 | 0 | 0 |
| no_evidence_refusal | 3 | 3 | 0 | 0 | 0 |
| region_period_recommendation | 5 | 0 | 5 | 0 | 0 |
| source_rights_question | 5 | 5 | 0 | 0 | 0 |

## Review Queue

| Query | Intent | Lane | Final state | Findings |
|---|---|---|---|---|
| BQ09 | first_earliest_claim | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ10 | first_earliest_claim | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ11 | first_earliest_claim | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ12 | comparison | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ13 | comparison | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ14 | region_period_recommendation | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ15 | region_period_recommendation | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ16 | region_period_recommendation | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ17 | region_period_recommendation | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ18 | region_period_recommendation | research_answer | NEEDS_HUMAN_REVIEW | method review |
| BQ23 | method_process_question | refusal_more_context | NEEDS_HUMAN_REVIEW | method review |
| BQ24 | method_process_question | refusal_more_context | NEEDS_HUMAN_REVIEW | method review |
| BQ25 | more_context | refusal_more_context | NEEDS_HUMAN_REVIEW | method review |
| BQ26 | more_context | refusal_more_context | NEEDS_HUMAN_REVIEW | method review |

## Anomaly Scan

| Severity | Code | Detail |
|---|---|---|
| warn | A002_evidence_overused | SURF-GAX1970R001 used 8 times |

## Interpretation

- Stable-by-rule now requires intent-lane validity, no hard conflicts, and
  field-level evidence checks against the gold evidence records.
- Fail findings are label-contract errors that must be corrected before the
  affected labels can be used as paper evidence.
- Review-queue labels need method review, not blind preference testing.
- Method-review intents remain non-final until their evidence sufficiency is
  manually checked.
