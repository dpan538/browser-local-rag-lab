# Quality Metrics v0

Generated: 2026-06-07T04:21:37.423Z

This report summarizes label-contract health and retrieval-sufficiency behavior.
It does not evaluate generated model answers.

## Label Health

- Labels: 30
- Stable-by-rule rate: 100%
- Fail rate: 0%
- Review queue rate: 0%
- Warning rate: 0%
- Anomalies: 1
- Anomaly fail findings: 0
- Rule config fail findings: 0
- Empty retrieval integrity: 100%
- Empty retrieval failures: 0
- Average evidence ids per label: 1.2
- Median evidence ids per label: 1

## Required-Field Missing Rate By Intent

| Intent | Missing rate |
|---|---:|
| archive_orientation | 0% |
| casual_archive_help | 0% |
| current_object_explanation | 0% |
| source_rights_question | 0% |
| first_earliest_claim | 0% |
| comparison | 0% |
| region_period_recommendation | 0% |
| method_process_question | 0% |
| more_context | 0% |
| no_evidence_refusal | 0% |

## Sufficiency Variants

| Variant | Sufficiency | Evidence coverage | Required fields | Avg tokens |
|---|---:|---:|---:|---:|
| top3_compressed_topology_source_rights | 0.933 | 0.933 | 1 | 844 |
| top3_raw_topology_source_rights | 0.933 | 0.933 | 1 | 962 |
| top8_compressed_topology_source_rights | 0.933 | 0.933 | 1 | 2079 |
| top3_compressed_no_topology_source_rights | 0.767 | 0.933 | 0.767 | 718 |
| top1_compressed_topology_source_rights | 0.633 | 0.633 | 1 | 303 |
| top3_compressed_topology_no_source_rights | 0.467 | 0.933 | 0.533 | 523 |

## Highest Difficulty Labels

| Query | Intent | Difficulty | Evidence ids | Refusal |
|---|---|---:|---:|---|
| BQ09 | first_earliest_claim | 6 | 0 | yes |
| BQ10 | first_earliest_claim | 6 | 0 | yes |
| BQ11 | first_earliest_claim | 6 | 0 | yes |
| BQ15 | region_period_recommendation | 5 | 0 | yes |
| BQ17 | region_period_recommendation | 5 | 0 | yes |
| BQ18 | region_period_recommendation | 5 | 0 | yes |
| BQ12 | comparison | 4 | 2 | no |
| BQ13 | comparison | 4 | 2 | no |
| BQ14 | region_period_recommendation | 4 | 3 | no |
| BQ16 | region_period_recommendation | 4 | 3 | no |
