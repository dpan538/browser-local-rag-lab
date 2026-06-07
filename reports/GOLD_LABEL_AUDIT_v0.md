# Gold Label Audit v0

Generated: 2026-06-07T02:58:59.306Z

This audit checks label consistency against the adjudication guide. It does not
judge generated model answers.

## Summary

- Labels: 30
- Stable by rule: 11
- Needs human/method review: 19
- Fail findings: 15
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
| method_process_question | 2 | 0 | 2 | 4 | 0 |
| more_context | 2 | 0 | 2 | 6 | 0 |
| no_evidence_refusal | 3 | 3 | 0 | 0 | 0 |
| region_period_recommendation | 5 | 0 | 5 | 0 | 0 |
| source_rights_question | 5 | 0 | 5 | 5 | 0 |

## Review Queue

| Query | Intent | Lane | Final state | Findings |
|---|---|---|---|---|
| BQ08 | source_rights_question | source_rights | FAIL | fail:C007_intent_protected_fields_not_required |
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
| BQ19 | source_rights_question | source_rights | FAIL | fail:C007_intent_protected_fields_not_required |
| BQ20 | source_rights_question | source_rights | FAIL | fail:C007_intent_protected_fields_not_required |
| BQ21 | source_rights_question | source_rights | FAIL | fail:C007_intent_protected_fields_not_required |
| BQ22 | source_rights_question | source_rights | FAIL | fail:C007_intent_protected_fields_not_required |
| BQ23 | method_process_question | research_answer | FAIL | fail:C005_insufficient_without_refusal; fail:C008_gold_evidence_missing_required_fields |
| BQ24 | method_process_question | research_answer | FAIL | fail:C005_insufficient_without_refusal; fail:C008_gold_evidence_missing_required_fields |
| BQ25 | more_context | research_answer | FAIL | fail:C002_invalid_intent_lane; fail:C003_mandatory_refusal_missing; fail:C004_mandatory_refusal_context_not_false |
| BQ26 | more_context | research_answer | FAIL | fail:C002_invalid_intent_lane; fail:C003_mandatory_refusal_missing; fail:C004_mandatory_refusal_context_not_false |

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
