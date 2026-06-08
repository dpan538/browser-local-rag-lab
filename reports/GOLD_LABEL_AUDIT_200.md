# Gold Label Audit v0

Generated: 2026-06-08T05:49:41.210Z

This audit checks label consistency against the adjudication guide. It does not
judge generated model answers.

## Summary

- Labels: 200
- Stable by rule: 200
- Needs human/method review: 0
- Fail findings: 0
- Warning findings: 0
- Anomalies: 0
- Anomaly fail findings: 0
- Rule config fail findings: 0

## By Intent

| Intent | Total | Stable by rule | Needs review | Fails | Warnings |
|---|---:|---:|---:|---:|---:|
| archive_orientation | 16 | 16 | 0 | 0 | 0 |
| casual_archive_help | 16 | 16 | 0 | 0 | 0 |
| comparison | 28 | 28 | 0 | 0 | 0 |
| current_object_explanation | 28 | 28 | 0 | 0 | 0 |
| first_earliest_claim | 15 | 15 | 0 | 0 | 0 |
| method_process_question | 16 | 16 | 0 | 0 | 0 |
| more_context | 18 | 18 | 0 | 0 | 0 |
| no_evidence_refusal | 15 | 15 | 0 | 0 | 0 |
| region_period_recommendation | 24 | 24 | 0 | 0 | 0 |
| source_rights_question | 24 | 24 | 0 | 0 | 0 |

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
