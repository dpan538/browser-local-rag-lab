# Gold Label Audit v0

Generated: 2026-06-07T05:06:04.307Z

This audit checks label consistency against the adjudication guide. It does not
judge generated model answers.

## Summary

- Labels: 30
- Stable by rule: 30
- Needs human/method review: 0
- Fail findings: 0
- Warning findings: 0
- Anomalies: 1
- Anomaly fail findings: 0
- Rule config fail findings: 0

## By Intent

| Intent | Total | Stable by rule | Needs review | Fails | Warnings |
|---|---:|---:|---:|---:|---:|
| archive_orientation | 3 | 3 | 0 | 0 | 0 |
| casual_archive_help | 2 | 2 | 0 | 0 | 0 |
| comparison | 2 | 2 | 0 | 0 | 0 |
| current_object_explanation | 3 | 3 | 0 | 0 | 0 |
| first_earliest_claim | 3 | 3 | 0 | 0 | 0 |
| method_process_question | 2 | 2 | 0 | 0 | 0 |
| more_context | 2 | 2 | 0 | 0 | 0 |
| no_evidence_refusal | 3 | 3 | 0 | 0 | 0 |
| region_period_recommendation | 5 | 5 | 0 | 0 | 0 |
| source_rights_question | 5 | 5 | 0 | 0 | 0 |

## Review Queue

| Query | Intent | Lane | Final state | Findings |
|---|---|---|---|---|
| none | none | none | none | none |

## Anomaly Scan

| Severity | Code | Detail |
|---|---|---|
| warn | A002_evidence_overused_warn | SURF-GAX1970R001 used 9/30 labels (0.300) |

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
