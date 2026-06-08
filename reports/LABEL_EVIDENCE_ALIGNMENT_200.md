# Label Evidence Alignment 200

Generated: 2026-06-08T07:03:17.864Z

This audit checks whether label contracts can be satisfied by their gold
evidence and, when a retrieval report is supplied, by the retrieved packet that
will be sent to WebLLM.

## Summary

- Labels checked: 200
- Fail issues: 50
- Warn issues: 0
- Gold-evidence fail issues: 0
- Retrieval-packet fail issues: 50
- Ready for oracle/WebLLM: no

## Failures By Intent

```json
{
  "archive_orientation": 14,
  "casual_archive_help": 2,
  "region_period_recommendation": 18,
  "more_context": 16
}
```

## Failures By Code

```json
{
  "retrieval_missing_gold_evidence": 49,
  "required_field_missing_in_retrieval": 1
}
```

## Issues

| Severity | Query | Intent | Layer | Code | Field |
|---|---|---|---|---|---|
| fail | BQ01 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ04 | casual_archive_help | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ04 | casual_archive_help | retrieval_packet | required_field_missing_in_retrieval | topology |
| fail | BQ031 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ032 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ033 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ034 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ035 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ036 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ037 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ038 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ039 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ040 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ041 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ042 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ043 | archive_orientation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ128 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ129 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ130 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ131 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ132 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ133 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ134 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ135 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ136 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ137 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ138 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ139 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ140 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ141 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ143 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ144 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ145 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ146 | region_period_recommendation | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ161 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ162 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ163 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ164 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ165 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ166 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ167 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ168 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ169 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ170 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ171 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ172 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ173 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ174 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ175 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
| fail | BQ176 | more_context | retrieval_packet | retrieval_missing_gold_evidence |  |
