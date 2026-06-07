# Retrieval Coverage v0

Generated: 2026-06-07T04:56:16.645Z

This report checks whether retrieved packets include the exact
`gold_evidence_ids`, not only equivalent required fields.

## Summary

| Variant | Queries | Gold-id coverage | Covered | Queries with missing ids |
|---|---:|---:|---:|---:|
| top3_compressed_no_topology_source_rights | 30 | 0.889 | 32/36 | 2 |
| top3_compressed_topology_no_source_rights | 30 | 0.889 | 32/36 | 2 |
| top3_compressed_topology_source_rights | 30 | 0.889 | 32/36 | 2 |
| top3_raw_topology_source_rights | 30 | 0.889 | 32/36 | 2 |
| top8_compressed_topology_source_rights | 30 | 0.889 | 32/36 | 2 |
| top1_compressed_topology_source_rights | 30 | 0.528 | 19/36 | 11 |

## Missing Gold Evidence

| Variant | Query | Intent | Missing ids |
|---|---|---|---|
| top3_compressed_no_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| top3_compressed_no_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| top3_compressed_topology_no_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| top3_compressed_topology_no_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| top3_compressed_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| top3_compressed_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| top3_raw_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| top3_raw_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| top8_compressed_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| top8_compressed_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| top1_compressed_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| top1_compressed_topology_source_rights | BQ02 | archive_orientation | SURF-CGS2026R0910 |
| top1_compressed_topology_source_rights | BQ03 | archive_orientation | SURF-CRG2026R0005 |
| top1_compressed_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| top1_compressed_topology_source_rights | BQ12 | comparison | SURF-CRG2026R0235 |
| top1_compressed_topology_source_rights | BQ13 | comparison | SURF-CRG2026R0235 |
| top1_compressed_topology_source_rights | BQ14 | region_period_recommendation | SURF-GAX1970R002|SURF-GA1970R001 |
| top1_compressed_topology_source_rights | BQ16 | region_period_recommendation | SURF-CGS2026R0328|SURF-CGS2026R0030 |
| top1_compressed_topology_source_rights | BQ25 | more_context | SURF-CRG2026R0274|SURF-CRG2026R0071 |
| top1_compressed_topology_source_rights | BQ26 | more_context | SURF-CRG2026R0274|SURF-CRG2026R0071 |
| top1_compressed_topology_source_rights | BQ30 | casual_archive_help | SURF-CRG2026R0032 |
