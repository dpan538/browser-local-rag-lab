# Gold Label Audit v0

Generated: 2026-06-11T02:47:34.700Z

This audit checks label consistency against the adjudication guide. It does not
judge generated model answers.

## Summary

- Labels: 300
- Stable by rule: 300
- Needs human/method review: 0
- Fail findings: 0
- Warning findings: 0
- Anomalies: 0
- Anomaly fail findings: 0
- Rule config fail findings: 0

## By Intent

| Intent | Total | Stable by rule | Needs review | Fails | Warnings |
|---|---:|---:|---:|---:|---:|
| archive_orientation | 22 | 22 | 0 | 0 | 0 |
| casual_archive_help | 22 | 22 | 0 | 0 | 0 |
| comparison | 38 | 38 | 0 | 0 | 0 |
| current_object_explanation | 32 | 32 | 0 | 0 | 0 |
| first_earliest_claim | 35 | 35 | 0 | 0 | 0 |
| method_process_question | 22 | 22 | 0 | 0 | 0 |
| more_context | 24 | 24 | 0 | 0 | 0 |
| no_evidence_refusal | 35 | 35 | 0 | 0 | 0 |
| region_period_recommendation | 34 | 34 | 0 | 0 | 0 |
| source_rights_question | 36 | 36 | 0 | 0 | 0 |

## Review Queue

| Query | Intent | Lane | Final state | Findings |
|---|---|---|---|---|
| none | none | none | none | none |

## Anomaly Scan

| Severity | Code | Detail |
|---|---|---|
| none | none | none |

## Rule Config Scan

| Severity | Code | Detail |
|---|---|---|
| none | none | none |

## Interpretation

- Stable-by-rule now requires intent-lane validity, no hard conflicts, and
  field-level evidence checks against the gold evidence records.
- Fail findings are label-contract errors that must be corrected before the
  affected labels can be used as paper evidence.
- When the review queue is empty, the label contract is ready for retrieval
  sufficiency experiments. This does not make generated model answers archive
  evidence.
