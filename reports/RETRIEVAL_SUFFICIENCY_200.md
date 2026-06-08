# Retrieval Sufficiency v0

Generated: 2026-06-08T07:13:19.041Z

This report evaluates whether deterministic retrieval plus evidence-packet
variants preserve seeded gold evidence and required fields before any model
generation. Labels are marked `seed_auto_needs_human_review`; use this as a
method scaffold, not as final paper evidence.

| Variant | Runs | Sufficiency | Evidence coverage | Gold ID coverage | Gold ID fail rows | Required fields | Refusal gate | Empty retrieval check | Avg tokens est. | Avg retrieval ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| top1_compressed_topology_source_rights | 200 | 0.575 | 0.575 | 0.5273 | 85 | 0.995 | 1 | 1 | 356 | 0.138 |
| top3_compressed_topology_source_rights | 200 | 0.755 | 0.755 | 0.7031 | 49 | 0.995 | 1 | 1 | 927 | 0.13 |
| top8_compressed_topology_source_rights | 200 | 0.8 | 0.8 | 0.7617 | 40 | 0.995 | 1 | 1 | 2176 | 0.124 |
| top3_raw_topology_source_rights | 200 | 0.755 | 0.755 | 0.7031 | 49 | 0.995 | 1 | 1 | 1707 | 0.122 |
| top3_compressed_no_topology_source_rights | 200 | 0.66 | 0.755 | 0.7031 | 49 | 0.75 | 1 | 1 | 786 | 0.12 |
| top3_compressed_topology_no_source_rights | 200 | 0.33 | 0.755 | 0.7031 | 49 | 0.4 | 1 | 1 | 589 | 0.123 |

## Gold Evidence Coverage Gate

Any variant with `gold_id_coverage_rate < 1.0` has fail-level findings and
must not be used for generation experiments unless it is explicitly a
research-only negative-control retrieval condition.

- Fail findings: 321

| Severity | Variant | Query | Intent | Missing gold evidence IDs |
|---|---|---|---|---|
| fail | top1_compressed_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| fail | top1_compressed_topology_source_rights | BQ02 | archive_orientation | SURF-CGS2026R0910 |
| fail | top1_compressed_topology_source_rights | BQ03 | archive_orientation | SURF-CGS2026R0908 |
| fail | top1_compressed_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| fail | top1_compressed_topology_source_rights | BQ12 | comparison | SURF-CRG2026R0235 |
| fail | top1_compressed_topology_source_rights | BQ13 | comparison | SURF-CRG2026R0235 |
| fail | top1_compressed_topology_source_rights | BQ14 | region_period_recommendation | SURF-GAX1970R002|SURF-GA1970R001 |
| fail | top1_compressed_topology_source_rights | BQ16 | region_period_recommendation | SURF-CGS2026R0328|SURF-CGS2026R0030 |
| fail | top1_compressed_topology_source_rights | BQ25 | more_context | SURF-CRG2026R0274|SURF-CRG2026R0071 |
| fail | top1_compressed_topology_source_rights | BQ26 | more_context | SURF-CRG2026R0274|SURF-CRG2026R0071 |
| fail | top1_compressed_topology_source_rights | BQ30 | casual_archive_help | SURF-CRG2026R0032 |
| fail | top1_compressed_topology_source_rights | BQ031 | archive_orientation | SURF-CRG2026R0050 |
| fail | top1_compressed_topology_source_rights | BQ032 | archive_orientation | SURF-GAX1970R002|SURF-CRG2026R0051 |
| fail | top1_compressed_topology_source_rights | BQ033 | archive_orientation | SURF-GA1970R001|SURF-CRG2026R0052 |
| fail | top1_compressed_topology_source_rights | BQ034 | archive_orientation | SURF-GAX1970R003|SURF-CRG2026R0071 |
| fail | top1_compressed_topology_source_rights | BQ035 | archive_orientation | SURF-GAX1970R004|SURF-COM1970R007 |
| fail | top1_compressed_topology_source_rights | BQ036 | archive_orientation | SURF-GAX1970R005|SURF-CRG2026R0235 |
| fail | top1_compressed_topology_source_rights | BQ037 | archive_orientation | SURF-CRG2026R0246 |
| fail | top1_compressed_topology_source_rights | BQ038 | archive_orientation | SURF-CRG2026R0050|SURF-CRG2026R0274 |
| fail | top1_compressed_topology_source_rights | BQ039 | archive_orientation | SURF-CRG2026R0051|SURF-CGS2026R0681 |
| fail | top1_compressed_topology_source_rights | BQ040 | archive_orientation | SURF-CRG2026R0052|SURF-CGS2026R0328 |
| fail | top1_compressed_topology_source_rights | BQ041 | archive_orientation | SURF-CRG2026R0071|SURF-CGS2026R0030 |
| fail | top1_compressed_topology_source_rights | BQ042 | archive_orientation | SURF-COM1970R007|SURF-CGS2026R0908 |
| fail | top1_compressed_topology_source_rights | BQ043 | archive_orientation | SURF-CRG2026R0235|SURF-CGS2026R0904 |
| fail | top1_compressed_topology_source_rights | BQ102 | comparison | SURF-CGS2026R0031 |
| fail | top1_compressed_topology_source_rights | BQ103 | comparison | SURF-CGS2026R0909 |
| fail | top1_compressed_topology_source_rights | BQ104 | comparison | SURF-CGS2026R0910 |
| fail | top1_compressed_topology_source_rights | BQ105 | comparison | SURF-CRG2026R0020 |
| fail | top1_compressed_topology_source_rights | BQ106 | comparison | SURF-CRG2026R0027 |
| fail | top1_compressed_topology_source_rights | BQ107 | comparison | SURF-CRG2026R0031 |
| fail | top1_compressed_topology_source_rights | BQ108 | comparison | SURF-CRG2026R0032 |
| fail | top1_compressed_topology_source_rights | BQ109 | comparison | SURF-ER1830R015 |
| fail | top1_compressed_topology_source_rights | BQ110 | comparison | SURF-CRG2026R0100 |
| fail | top1_compressed_topology_source_rights | BQ111 | comparison | SURF-ER1830R046 |
| fail | top1_compressed_topology_source_rights | BQ112 | comparison | SURF-CRG2026R0153 |
| fail | top1_compressed_topology_source_rights | BQ113 | comparison | SURF-ER1830R059 |
| fail | top1_compressed_topology_source_rights | BQ114 | comparison | SURF-CRG2026R0175 |
| fail | top1_compressed_topology_source_rights | BQ115 | comparison | SURF-ER1830R052 |
| fail | top1_compressed_topology_source_rights | BQ116 | comparison | SURF-ER1830R064 |
| fail | top1_compressed_topology_source_rights | BQ117 | comparison | SURF-ER1830R065 |
| fail | top1_compressed_topology_source_rights | BQ118 | comparison | SURF-ER1830R066 |
| fail | top1_compressed_topology_source_rights | BQ119 | comparison | SURF-ER1830R011 |
| fail | top1_compressed_topology_source_rights | BQ120 | comparison | SURF-ER1830R017 |
| fail | top1_compressed_topology_source_rights | BQ121 | comparison | SURF-ER1830R019 |
| fail | top1_compressed_topology_source_rights | BQ122 | comparison | SURF-ER1830R001-GROUP |
| fail | top1_compressed_topology_source_rights | BQ123 | comparison | SURF-CHW2026R001 |
| fail | top1_compressed_topology_source_rights | BQ124 | comparison | SURF-ER1830R002 |
| fail | top1_compressed_topology_source_rights | BQ125 | comparison | SURF-SI1970R001 |
| fail | top1_compressed_topology_source_rights | BQ126 | comparison | SURF-CRG2026R0002 |
| fail | top1_compressed_topology_source_rights | BQ127 | comparison | SURF-CRG2026R0003 |
| fail | top1_compressed_topology_source_rights | BQ128 | region_period_recommendation | SURF-CRG2026R0001|SURF-CRG2026R0050 |
| fail | top1_compressed_topology_source_rights | BQ129 | region_period_recommendation | SURF-CRG2026R0050|SURF-CRG2026R0051 |
| fail | top1_compressed_topology_source_rights | BQ130 | region_period_recommendation | SURF-CRG2026R0051|SURF-CRG2026R0052 |
| fail | top1_compressed_topology_source_rights | BQ131 | region_period_recommendation | SURF-CRG2026R0052|SURF-CRG2026R0071 |
| fail | top1_compressed_topology_source_rights | BQ132 | region_period_recommendation | SURF-CRG2026R0071|SURF-CRG2026R0235 |
| fail | top1_compressed_topology_source_rights | BQ133 | region_period_recommendation | SURF-CRG2026R0235|SURF-CRG2026R0246 |
| fail | top1_compressed_topology_source_rights | BQ134 | region_period_recommendation | SURF-CRG2026R0246|SURF-CRG2026R0274 |
| fail | top1_compressed_topology_source_rights | BQ135 | region_period_recommendation | SURF-CRG2026R0274|SURF-CRG2026R0020 |
| fail | top1_compressed_topology_source_rights | BQ136 | region_period_recommendation | SURF-CRG2026R0020|SURF-CRG2026R0175 |
| fail | top1_compressed_topology_source_rights | BQ137 | region_period_recommendation | SURF-CRG2026R0175|SURF-CRG2026R0002 |
| fail | top1_compressed_topology_source_rights | BQ138 | region_period_recommendation | SURF-CRG2026R0002|SURF-CRG2026R0003 |
| fail | top1_compressed_topology_source_rights | BQ139 | region_period_recommendation | SURF-CRG2026R0003|SURF-CRG2026R0004 |
| fail | top1_compressed_topology_source_rights | BQ140 | region_period_recommendation | SURF-CRG2026R0004|SURF-CRG2026R0005 |
| fail | top1_compressed_topology_source_rights | BQ141 | region_period_recommendation | SURF-CRG2026R0005|SURF-CRG2026R0001 |
| fail | top1_compressed_topology_source_rights | BQ142 | region_period_recommendation | SURF-GAX1970R002|SURF-GA1970R001 |
| fail | top1_compressed_topology_source_rights | BQ143 | region_period_recommendation | SURF-GA1970R001|SURF-GAX1970R003 |
| fail | top1_compressed_topology_source_rights | BQ144 | region_period_recommendation | SURF-GAX1970R003|SURF-GAX1970R004 |
| fail | top1_compressed_topology_source_rights | BQ145 | region_period_recommendation | SURF-GAX1970R004|SURF-GAX1970R005 |
| fail | top1_compressed_topology_source_rights | BQ146 | region_period_recommendation | SURF-GAX1970R005|SURF-ER1830R046 |
| fail | top1_compressed_topology_source_rights | BQ161 | more_context | SURF-ER1830R004 |
| fail | top1_compressed_topology_source_rights | BQ162 | more_context | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES |
| fail | top1_compressed_topology_source_rights | BQ163 | more_context | SURF-ER1830R008 |
| fail | top1_compressed_topology_source_rights | BQ164 | more_context | SURF-ER1830R018 |
| fail | top1_compressed_topology_source_rights | BQ165 | more_context | SURF-CRG2026R0004 |
| fail | top1_compressed_topology_source_rights | BQ166 | more_context | SURF-CRG2026R0005 |
| fail | top1_compressed_topology_source_rights | BQ167 | more_context | SURF-CRG2026R0001 |
| fail | top1_compressed_topology_source_rights | BQ168 | more_context | SURF-GAX1970R002 |
| fail | top1_compressed_topology_source_rights | BQ169 | more_context | SURF-GA1970R001 |
| fail | top1_compressed_topology_source_rights | BQ170 | more_context | SURF-GAX1970R003 |
| fail | top1_compressed_topology_source_rights | BQ171 | more_context | SURF-GAX1970R004 |
| fail | top1_compressed_topology_source_rights | BQ172 | more_context | SURF-GAX1970R005 |
| fail | top1_compressed_topology_source_rights | BQ173 | more_context | SURF-CRG2026R0006 |
| fail | top1_compressed_topology_source_rights | BQ174 | more_context | SURF-CRG2026R0050 |
| fail | top1_compressed_topology_source_rights | BQ175 | more_context | SURF-CRG2026R0051 |
| fail | top1_compressed_topology_source_rights | BQ176 | more_context | SURF-CRG2026R0052 |
| fail | top3_compressed_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| fail | top3_compressed_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| fail | top3_compressed_topology_source_rights | BQ031 | archive_orientation | SURF-CRG2026R0050 |
| fail | top3_compressed_topology_source_rights | BQ032 | archive_orientation | SURF-GAX1970R002|SURF-CRG2026R0051 |
| fail | top3_compressed_topology_source_rights | BQ033 | archive_orientation | SURF-GA1970R001|SURF-CRG2026R0052 |
| fail | top3_compressed_topology_source_rights | BQ034 | archive_orientation | SURF-GAX1970R003|SURF-CRG2026R0071 |
| fail | top3_compressed_topology_source_rights | BQ035 | archive_orientation | SURF-GAX1970R004|SURF-COM1970R007 |
| fail | top3_compressed_topology_source_rights | BQ036 | archive_orientation | SURF-GAX1970R005|SURF-CRG2026R0235 |
| fail | top3_compressed_topology_source_rights | BQ037 | archive_orientation | SURF-CRG2026R0246 |
| fail | top3_compressed_topology_source_rights | BQ038 | archive_orientation | SURF-CRG2026R0050|SURF-CRG2026R0274 |
| fail | top3_compressed_topology_source_rights | BQ039 | archive_orientation | SURF-CRG2026R0051|SURF-CGS2026R0681 |
| fail | top3_compressed_topology_source_rights | BQ040 | archive_orientation | SURF-CRG2026R0052|SURF-CGS2026R0328 |
| fail | top3_compressed_topology_source_rights | BQ041 | archive_orientation | SURF-CRG2026R0071|SURF-CGS2026R0030 |
| fail | top3_compressed_topology_source_rights | BQ042 | archive_orientation | SURF-COM1970R007 |
| fail | top3_compressed_topology_source_rights | BQ043 | archive_orientation | SURF-CRG2026R0235|SURF-CGS2026R0904 |
| fail | top3_compressed_topology_source_rights | BQ128 | region_period_recommendation | SURF-CRG2026R0050 |
| fail | top3_compressed_topology_source_rights | BQ129 | region_period_recommendation | SURF-CRG2026R0050|SURF-CRG2026R0051 |
| fail | top3_compressed_topology_source_rights | BQ130 | region_period_recommendation | SURF-CRG2026R0051|SURF-CRG2026R0052 |
| fail | top3_compressed_topology_source_rights | BQ131 | region_period_recommendation | SURF-CRG2026R0052|SURF-CRG2026R0071 |
| fail | top3_compressed_topology_source_rights | BQ132 | region_period_recommendation | SURF-CRG2026R0071|SURF-CRG2026R0235 |
| fail | top3_compressed_topology_source_rights | BQ133 | region_period_recommendation | SURF-CRG2026R0235|SURF-CRG2026R0246 |
| fail | top3_compressed_topology_source_rights | BQ134 | region_period_recommendation | SURF-CRG2026R0246|SURF-CRG2026R0274 |
| fail | top3_compressed_topology_source_rights | BQ135 | region_period_recommendation | SURF-CRG2026R0274|SURF-CRG2026R0020 |
| fail | top3_compressed_topology_source_rights | BQ136 | region_period_recommendation | SURF-CRG2026R0020|SURF-CRG2026R0175 |
| fail | top3_compressed_topology_source_rights | BQ137 | region_period_recommendation | SURF-CRG2026R0175|SURF-CRG2026R0002 |
| fail | top3_compressed_topology_source_rights | BQ138 | region_period_recommendation | SURF-CRG2026R0002|SURF-CRG2026R0003 |
| fail | top3_compressed_topology_source_rights | BQ139 | region_period_recommendation | SURF-CRG2026R0003|SURF-CRG2026R0004 |
| fail | top3_compressed_topology_source_rights | BQ140 | region_period_recommendation | SURF-CRG2026R0004|SURF-CRG2026R0005 |
| fail | top3_compressed_topology_source_rights | BQ141 | region_period_recommendation | SURF-CRG2026R0005 |
| fail | top3_compressed_topology_source_rights | BQ143 | region_period_recommendation | SURF-GAX1970R003 |
| fail | top3_compressed_topology_source_rights | BQ144 | region_period_recommendation | SURF-GAX1970R003|SURF-GAX1970R004 |
| fail | top3_compressed_topology_source_rights | BQ145 | region_period_recommendation | SURF-GAX1970R004|SURF-GAX1970R005 |
| fail | top3_compressed_topology_source_rights | BQ146 | region_period_recommendation | SURF-GAX1970R005|SURF-ER1830R046 |
| fail | top3_compressed_topology_source_rights | BQ161 | more_context | SURF-ER1830R004 |
| fail | top3_compressed_topology_source_rights | BQ162 | more_context | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES |
| fail | top3_compressed_topology_source_rights | BQ163 | more_context | SURF-ER1830R008 |
| fail | top3_compressed_topology_source_rights | BQ164 | more_context | SURF-ER1830R018 |
| fail | top3_compressed_topology_source_rights | BQ165 | more_context | SURF-CRG2026R0004 |
| fail | top3_compressed_topology_source_rights | BQ166 | more_context | SURF-CRG2026R0005 |
| fail | top3_compressed_topology_source_rights | BQ167 | more_context | SURF-CRG2026R0001 |
| fail | top3_compressed_topology_source_rights | BQ168 | more_context | SURF-GAX1970R002 |
| fail | top3_compressed_topology_source_rights | BQ169 | more_context | SURF-GA1970R001 |
| fail | top3_compressed_topology_source_rights | BQ170 | more_context | SURF-GAX1970R003 |
| fail | top3_compressed_topology_source_rights | BQ171 | more_context | SURF-GAX1970R004 |
| fail | top3_compressed_topology_source_rights | BQ172 | more_context | SURF-GAX1970R005 |
| fail | top3_compressed_topology_source_rights | BQ173 | more_context | SURF-CRG2026R0006 |
| fail | top3_compressed_topology_source_rights | BQ174 | more_context | SURF-CRG2026R0050 |
| fail | top3_compressed_topology_source_rights | BQ175 | more_context | SURF-CRG2026R0051 |
| fail | top3_compressed_topology_source_rights | BQ176 | more_context | SURF-CRG2026R0052 |
| fail | top8_compressed_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| fail | top8_compressed_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| fail | top8_compressed_topology_source_rights | BQ032 | archive_orientation | SURF-GAX1970R002|SURF-CRG2026R0051 |
| fail | top8_compressed_topology_source_rights | BQ033 | archive_orientation | SURF-GA1970R001|SURF-CRG2026R0052 |
| fail | top8_compressed_topology_source_rights | BQ034 | archive_orientation | SURF-GAX1970R003|SURF-CRG2026R0071 |
| fail | top8_compressed_topology_source_rights | BQ035 | archive_orientation | SURF-GAX1970R004|SURF-COM1970R007 |
| fail | top8_compressed_topology_source_rights | BQ036 | archive_orientation | SURF-GAX1970R005|SURF-CRG2026R0235 |
| fail | top8_compressed_topology_source_rights | BQ037 | archive_orientation | SURF-CRG2026R0246 |
| fail | top8_compressed_topology_source_rights | BQ038 | archive_orientation | SURF-CRG2026R0274 |
| fail | top8_compressed_topology_source_rights | BQ039 | archive_orientation | SURF-CRG2026R0051|SURF-CGS2026R0681 |
| fail | top8_compressed_topology_source_rights | BQ040 | archive_orientation | SURF-CRG2026R0052|SURF-CGS2026R0328 |
| fail | top8_compressed_topology_source_rights | BQ041 | archive_orientation | SURF-CRG2026R0071|SURF-CGS2026R0030 |
| fail | top8_compressed_topology_source_rights | BQ042 | archive_orientation | SURF-COM1970R007 |
| fail | top8_compressed_topology_source_rights | BQ043 | archive_orientation | SURF-CRG2026R0235|SURF-CGS2026R0904 |
| fail | top8_compressed_topology_source_rights | BQ128 | region_period_recommendation | SURF-CRG2026R0050 |
| fail | top8_compressed_topology_source_rights | BQ129 | region_period_recommendation | SURF-CRG2026R0050|SURF-CRG2026R0051 |
| fail | top8_compressed_topology_source_rights | BQ130 | region_period_recommendation | SURF-CRG2026R0051|SURF-CRG2026R0052 |
| fail | top8_compressed_topology_source_rights | BQ131 | region_period_recommendation | SURF-CRG2026R0052|SURF-CRG2026R0071 |
| fail | top8_compressed_topology_source_rights | BQ132 | region_period_recommendation | SURF-CRG2026R0071|SURF-CRG2026R0235 |
| fail | top8_compressed_topology_source_rights | BQ133 | region_period_recommendation | SURF-CRG2026R0235|SURF-CRG2026R0246 |
| fail | top8_compressed_topology_source_rights | BQ134 | region_period_recommendation | SURF-CRG2026R0246|SURF-CRG2026R0274 |
| fail | top8_compressed_topology_source_rights | BQ135 | region_period_recommendation | SURF-CRG2026R0274|SURF-CRG2026R0020 |
| fail | top8_compressed_topology_source_rights | BQ136 | region_period_recommendation | SURF-CRG2026R0020|SURF-CRG2026R0175 |
| fail | top8_compressed_topology_source_rights | BQ137 | region_period_recommendation | SURF-CRG2026R0175 |
| fail | top8_compressed_topology_source_rights | BQ138 | region_period_recommendation | SURF-CRG2026R0003 |
| fail | top8_compressed_topology_source_rights | BQ139 | region_period_recommendation | SURF-CRG2026R0003|SURF-CRG2026R0004 |
| fail | top8_compressed_topology_source_rights | BQ140 | region_period_recommendation | SURF-CRG2026R0004|SURF-CRG2026R0005 |
| fail | top8_compressed_topology_source_rights | BQ141 | region_period_recommendation | SURF-CRG2026R0005 |
| fail | top8_compressed_topology_source_rights | BQ162 | more_context | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES |
| fail | top8_compressed_topology_source_rights | BQ164 | more_context | SURF-ER1830R018 |
| fail | top8_compressed_topology_source_rights | BQ165 | more_context | SURF-CRG2026R0004 |
| fail | top8_compressed_topology_source_rights | BQ168 | more_context | SURF-GAX1970R002 |
| fail | top8_compressed_topology_source_rights | BQ169 | more_context | SURF-GA1970R001 |
| fail | top8_compressed_topology_source_rights | BQ170 | more_context | SURF-GAX1970R003 |
| fail | top8_compressed_topology_source_rights | BQ171 | more_context | SURF-GAX1970R004 |
| fail | top8_compressed_topology_source_rights | BQ172 | more_context | SURF-GAX1970R005 |
| fail | top8_compressed_topology_source_rights | BQ173 | more_context | SURF-CRG2026R0006 |
| fail | top8_compressed_topology_source_rights | BQ174 | more_context | SURF-CRG2026R0050 |
| fail | top8_compressed_topology_source_rights | BQ175 | more_context | SURF-CRG2026R0051 |
| fail | top8_compressed_topology_source_rights | BQ176 | more_context | SURF-CRG2026R0052 |
| fail | top3_raw_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| fail | top3_raw_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| fail | top3_raw_topology_source_rights | BQ031 | archive_orientation | SURF-CRG2026R0050 |
| fail | top3_raw_topology_source_rights | BQ032 | archive_orientation | SURF-GAX1970R002|SURF-CRG2026R0051 |
| fail | top3_raw_topology_source_rights | BQ033 | archive_orientation | SURF-GA1970R001|SURF-CRG2026R0052 |
| fail | top3_raw_topology_source_rights | BQ034 | archive_orientation | SURF-GAX1970R003|SURF-CRG2026R0071 |
| fail | top3_raw_topology_source_rights | BQ035 | archive_orientation | SURF-GAX1970R004|SURF-COM1970R007 |
| fail | top3_raw_topology_source_rights | BQ036 | archive_orientation | SURF-GAX1970R005|SURF-CRG2026R0235 |
| fail | top3_raw_topology_source_rights | BQ037 | archive_orientation | SURF-CRG2026R0246 |
| fail | top3_raw_topology_source_rights | BQ038 | archive_orientation | SURF-CRG2026R0050|SURF-CRG2026R0274 |
| fail | top3_raw_topology_source_rights | BQ039 | archive_orientation | SURF-CRG2026R0051|SURF-CGS2026R0681 |
| fail | top3_raw_topology_source_rights | BQ040 | archive_orientation | SURF-CRG2026R0052|SURF-CGS2026R0328 |
| fail | top3_raw_topology_source_rights | BQ041 | archive_orientation | SURF-CRG2026R0071|SURF-CGS2026R0030 |
| fail | top3_raw_topology_source_rights | BQ042 | archive_orientation | SURF-COM1970R007 |
| fail | top3_raw_topology_source_rights | BQ043 | archive_orientation | SURF-CRG2026R0235|SURF-CGS2026R0904 |
| fail | top3_raw_topology_source_rights | BQ128 | region_period_recommendation | SURF-CRG2026R0050 |
| fail | top3_raw_topology_source_rights | BQ129 | region_period_recommendation | SURF-CRG2026R0050|SURF-CRG2026R0051 |
| fail | top3_raw_topology_source_rights | BQ130 | region_period_recommendation | SURF-CRG2026R0051|SURF-CRG2026R0052 |
| fail | top3_raw_topology_source_rights | BQ131 | region_period_recommendation | SURF-CRG2026R0052|SURF-CRG2026R0071 |
| fail | top3_raw_topology_source_rights | BQ132 | region_period_recommendation | SURF-CRG2026R0071|SURF-CRG2026R0235 |
| fail | top3_raw_topology_source_rights | BQ133 | region_period_recommendation | SURF-CRG2026R0235|SURF-CRG2026R0246 |
| fail | top3_raw_topology_source_rights | BQ134 | region_period_recommendation | SURF-CRG2026R0246|SURF-CRG2026R0274 |
| fail | top3_raw_topology_source_rights | BQ135 | region_period_recommendation | SURF-CRG2026R0274|SURF-CRG2026R0020 |
| fail | top3_raw_topology_source_rights | BQ136 | region_period_recommendation | SURF-CRG2026R0020|SURF-CRG2026R0175 |
| fail | top3_raw_topology_source_rights | BQ137 | region_period_recommendation | SURF-CRG2026R0175|SURF-CRG2026R0002 |
| fail | top3_raw_topology_source_rights | BQ138 | region_period_recommendation | SURF-CRG2026R0002|SURF-CRG2026R0003 |
| fail | top3_raw_topology_source_rights | BQ139 | region_period_recommendation | SURF-CRG2026R0003|SURF-CRG2026R0004 |
| fail | top3_raw_topology_source_rights | BQ140 | region_period_recommendation | SURF-CRG2026R0004|SURF-CRG2026R0005 |
| fail | top3_raw_topology_source_rights | BQ141 | region_period_recommendation | SURF-CRG2026R0005 |
| fail | top3_raw_topology_source_rights | BQ143 | region_period_recommendation | SURF-GAX1970R003 |
| fail | top3_raw_topology_source_rights | BQ144 | region_period_recommendation | SURF-GAX1970R003|SURF-GAX1970R004 |
| fail | top3_raw_topology_source_rights | BQ145 | region_period_recommendation | SURF-GAX1970R004|SURF-GAX1970R005 |
| fail | top3_raw_topology_source_rights | BQ146 | region_period_recommendation | SURF-GAX1970R005|SURF-ER1830R046 |
| fail | top3_raw_topology_source_rights | BQ161 | more_context | SURF-ER1830R004 |
| fail | top3_raw_topology_source_rights | BQ162 | more_context | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES |
| fail | top3_raw_topology_source_rights | BQ163 | more_context | SURF-ER1830R008 |
| fail | top3_raw_topology_source_rights | BQ164 | more_context | SURF-ER1830R018 |
| fail | top3_raw_topology_source_rights | BQ165 | more_context | SURF-CRG2026R0004 |
| fail | top3_raw_topology_source_rights | BQ166 | more_context | SURF-CRG2026R0005 |
| fail | top3_raw_topology_source_rights | BQ167 | more_context | SURF-CRG2026R0001 |
| fail | top3_raw_topology_source_rights | BQ168 | more_context | SURF-GAX1970R002 |
| fail | top3_raw_topology_source_rights | BQ169 | more_context | SURF-GA1970R001 |
| fail | top3_raw_topology_source_rights | BQ170 | more_context | SURF-GAX1970R003 |
| fail | top3_raw_topology_source_rights | BQ171 | more_context | SURF-GAX1970R004 |
| fail | top3_raw_topology_source_rights | BQ172 | more_context | SURF-GAX1970R005 |
| fail | top3_raw_topology_source_rights | BQ173 | more_context | SURF-CRG2026R0006 |
| fail | top3_raw_topology_source_rights | BQ174 | more_context | SURF-CRG2026R0050 |
| fail | top3_raw_topology_source_rights | BQ175 | more_context | SURF-CRG2026R0051 |
| fail | top3_raw_topology_source_rights | BQ176 | more_context | SURF-CRG2026R0052 |
| fail | top3_compressed_no_topology_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| fail | top3_compressed_no_topology_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| fail | top3_compressed_no_topology_source_rights | BQ031 | archive_orientation | SURF-CRG2026R0050 |
| fail | top3_compressed_no_topology_source_rights | BQ032 | archive_orientation | SURF-GAX1970R002|SURF-CRG2026R0051 |
| fail | top3_compressed_no_topology_source_rights | BQ033 | archive_orientation | SURF-GA1970R001|SURF-CRG2026R0052 |
| fail | top3_compressed_no_topology_source_rights | BQ034 | archive_orientation | SURF-GAX1970R003|SURF-CRG2026R0071 |
| fail | top3_compressed_no_topology_source_rights | BQ035 | archive_orientation | SURF-GAX1970R004|SURF-COM1970R007 |
| fail | top3_compressed_no_topology_source_rights | BQ036 | archive_orientation | SURF-GAX1970R005|SURF-CRG2026R0235 |
| fail | top3_compressed_no_topology_source_rights | BQ037 | archive_orientation | SURF-CRG2026R0246 |
| fail | top3_compressed_no_topology_source_rights | BQ038 | archive_orientation | SURF-CRG2026R0050|SURF-CRG2026R0274 |
| fail | top3_compressed_no_topology_source_rights | BQ039 | archive_orientation | SURF-CRG2026R0051|SURF-CGS2026R0681 |
| fail | top3_compressed_no_topology_source_rights | BQ040 | archive_orientation | SURF-CRG2026R0052|SURF-CGS2026R0328 |
| fail | top3_compressed_no_topology_source_rights | BQ041 | archive_orientation | SURF-CRG2026R0071|SURF-CGS2026R0030 |
| fail | top3_compressed_no_topology_source_rights | BQ042 | archive_orientation | SURF-COM1970R007 |
| fail | top3_compressed_no_topology_source_rights | BQ043 | archive_orientation | SURF-CRG2026R0235|SURF-CGS2026R0904 |
| fail | top3_compressed_no_topology_source_rights | BQ128 | region_period_recommendation | SURF-CRG2026R0050 |
| fail | top3_compressed_no_topology_source_rights | BQ129 | region_period_recommendation | SURF-CRG2026R0050|SURF-CRG2026R0051 |
| fail | top3_compressed_no_topology_source_rights | BQ130 | region_period_recommendation | SURF-CRG2026R0051|SURF-CRG2026R0052 |
| fail | top3_compressed_no_topology_source_rights | BQ131 | region_period_recommendation | SURF-CRG2026R0052|SURF-CRG2026R0071 |
| fail | top3_compressed_no_topology_source_rights | BQ132 | region_period_recommendation | SURF-CRG2026R0071|SURF-CRG2026R0235 |
| fail | top3_compressed_no_topology_source_rights | BQ133 | region_period_recommendation | SURF-CRG2026R0235|SURF-CRG2026R0246 |
| fail | top3_compressed_no_topology_source_rights | BQ134 | region_period_recommendation | SURF-CRG2026R0246|SURF-CRG2026R0274 |
| fail | top3_compressed_no_topology_source_rights | BQ135 | region_period_recommendation | SURF-CRG2026R0274|SURF-CRG2026R0020 |
| fail | top3_compressed_no_topology_source_rights | BQ136 | region_period_recommendation | SURF-CRG2026R0020|SURF-CRG2026R0175 |
| fail | top3_compressed_no_topology_source_rights | BQ137 | region_period_recommendation | SURF-CRG2026R0175|SURF-CRG2026R0002 |
| fail | top3_compressed_no_topology_source_rights | BQ138 | region_period_recommendation | SURF-CRG2026R0002|SURF-CRG2026R0003 |
| fail | top3_compressed_no_topology_source_rights | BQ139 | region_period_recommendation | SURF-CRG2026R0003|SURF-CRG2026R0004 |
| fail | top3_compressed_no_topology_source_rights | BQ140 | region_period_recommendation | SURF-CRG2026R0004|SURF-CRG2026R0005 |
| fail | top3_compressed_no_topology_source_rights | BQ141 | region_period_recommendation | SURF-CRG2026R0005 |
| fail | top3_compressed_no_topology_source_rights | BQ143 | region_period_recommendation | SURF-GAX1970R003 |
| fail | top3_compressed_no_topology_source_rights | BQ144 | region_period_recommendation | SURF-GAX1970R003|SURF-GAX1970R004 |
| fail | top3_compressed_no_topology_source_rights | BQ145 | region_period_recommendation | SURF-GAX1970R004|SURF-GAX1970R005 |
| fail | top3_compressed_no_topology_source_rights | BQ146 | region_period_recommendation | SURF-GAX1970R005|SURF-ER1830R046 |
| fail | top3_compressed_no_topology_source_rights | BQ161 | more_context | SURF-ER1830R004 |
| fail | top3_compressed_no_topology_source_rights | BQ162 | more_context | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES |
| fail | top3_compressed_no_topology_source_rights | BQ163 | more_context | SURF-ER1830R008 |
| fail | top3_compressed_no_topology_source_rights | BQ164 | more_context | SURF-ER1830R018 |
| fail | top3_compressed_no_topology_source_rights | BQ165 | more_context | SURF-CRG2026R0004 |
| fail | top3_compressed_no_topology_source_rights | BQ166 | more_context | SURF-CRG2026R0005 |
| fail | top3_compressed_no_topology_source_rights | BQ167 | more_context | SURF-CRG2026R0001 |
| fail | top3_compressed_no_topology_source_rights | BQ168 | more_context | SURF-GAX1970R002 |
| fail | top3_compressed_no_topology_source_rights | BQ169 | more_context | SURF-GA1970R001 |
| fail | top3_compressed_no_topology_source_rights | BQ170 | more_context | SURF-GAX1970R003 |
| fail | top3_compressed_no_topology_source_rights | BQ171 | more_context | SURF-GAX1970R004 |
| fail | top3_compressed_no_topology_source_rights | BQ172 | more_context | SURF-GAX1970R005 |
| fail | top3_compressed_no_topology_source_rights | BQ173 | more_context | SURF-CRG2026R0006 |
| fail | top3_compressed_no_topology_source_rights | BQ174 | more_context | SURF-CRG2026R0050 |
| fail | top3_compressed_no_topology_source_rights | BQ175 | more_context | SURF-CRG2026R0051 |
| fail | top3_compressed_no_topology_source_rights | BQ176 | more_context | SURF-CRG2026R0052 |
| fail | top3_compressed_topology_no_source_rights | BQ01 | archive_orientation | SURF-ER1830R004|SURF-ER1830R015 |
| fail | top3_compressed_topology_no_source_rights | BQ04 | casual_archive_help | SURF-ER1830R015|SURF-CRG2026R0051 |
| fail | top3_compressed_topology_no_source_rights | BQ031 | archive_orientation | SURF-CRG2026R0050 |
| fail | top3_compressed_topology_no_source_rights | BQ032 | archive_orientation | SURF-GAX1970R002|SURF-CRG2026R0051 |
| fail | top3_compressed_topology_no_source_rights | BQ033 | archive_orientation | SURF-GA1970R001|SURF-CRG2026R0052 |
| fail | top3_compressed_topology_no_source_rights | BQ034 | archive_orientation | SURF-GAX1970R003|SURF-CRG2026R0071 |
| fail | top3_compressed_topology_no_source_rights | BQ035 | archive_orientation | SURF-GAX1970R004|SURF-COM1970R007 |
| fail | top3_compressed_topology_no_source_rights | BQ036 | archive_orientation | SURF-GAX1970R005|SURF-CRG2026R0235 |
| fail | top3_compressed_topology_no_source_rights | BQ037 | archive_orientation | SURF-CRG2026R0246 |
| fail | top3_compressed_topology_no_source_rights | BQ038 | archive_orientation | SURF-CRG2026R0050|SURF-CRG2026R0274 |
| fail | top3_compressed_topology_no_source_rights | BQ039 | archive_orientation | SURF-CRG2026R0051|SURF-CGS2026R0681 |
| fail | top3_compressed_topology_no_source_rights | BQ040 | archive_orientation | SURF-CRG2026R0052|SURF-CGS2026R0328 |
| fail | top3_compressed_topology_no_source_rights | BQ041 | archive_orientation | SURF-CRG2026R0071|SURF-CGS2026R0030 |
| fail | top3_compressed_topology_no_source_rights | BQ042 | archive_orientation | SURF-COM1970R007 |
| fail | top3_compressed_topology_no_source_rights | BQ043 | archive_orientation | SURF-CRG2026R0235|SURF-CGS2026R0904 |
| fail | top3_compressed_topology_no_source_rights | BQ128 | region_period_recommendation | SURF-CRG2026R0050 |
| fail | top3_compressed_topology_no_source_rights | BQ129 | region_period_recommendation | SURF-CRG2026R0050|SURF-CRG2026R0051 |
| fail | top3_compressed_topology_no_source_rights | BQ130 | region_period_recommendation | SURF-CRG2026R0051|SURF-CRG2026R0052 |
| fail | top3_compressed_topology_no_source_rights | BQ131 | region_period_recommendation | SURF-CRG2026R0052|SURF-CRG2026R0071 |
| fail | top3_compressed_topology_no_source_rights | BQ132 | region_period_recommendation | SURF-CRG2026R0071|SURF-CRG2026R0235 |
| fail | top3_compressed_topology_no_source_rights | BQ133 | region_period_recommendation | SURF-CRG2026R0235|SURF-CRG2026R0246 |
| fail | top3_compressed_topology_no_source_rights | BQ134 | region_period_recommendation | SURF-CRG2026R0246|SURF-CRG2026R0274 |
| fail | top3_compressed_topology_no_source_rights | BQ135 | region_period_recommendation | SURF-CRG2026R0274|SURF-CRG2026R0020 |
| fail | top3_compressed_topology_no_source_rights | BQ136 | region_period_recommendation | SURF-CRG2026R0020|SURF-CRG2026R0175 |
| fail | top3_compressed_topology_no_source_rights | BQ137 | region_period_recommendation | SURF-CRG2026R0175|SURF-CRG2026R0002 |
| fail | top3_compressed_topology_no_source_rights | BQ138 | region_period_recommendation | SURF-CRG2026R0002|SURF-CRG2026R0003 |
| fail | top3_compressed_topology_no_source_rights | BQ139 | region_period_recommendation | SURF-CRG2026R0003|SURF-CRG2026R0004 |
| fail | top3_compressed_topology_no_source_rights | BQ140 | region_period_recommendation | SURF-CRG2026R0004|SURF-CRG2026R0005 |
| fail | top3_compressed_topology_no_source_rights | BQ141 | region_period_recommendation | SURF-CRG2026R0005 |
| fail | top3_compressed_topology_no_source_rights | BQ143 | region_period_recommendation | SURF-GAX1970R003 |
| fail | top3_compressed_topology_no_source_rights | BQ144 | region_period_recommendation | SURF-GAX1970R003|SURF-GAX1970R004 |
| fail | top3_compressed_topology_no_source_rights | BQ145 | region_period_recommendation | SURF-GAX1970R004|SURF-GAX1970R005 |
| fail | top3_compressed_topology_no_source_rights | BQ146 | region_period_recommendation | SURF-GAX1970R005|SURF-ER1830R046 |
| fail | top3_compressed_topology_no_source_rights | BQ161 | more_context | SURF-ER1830R004 |
| fail | top3_compressed_topology_no_source_rights | BQ162 | more_context | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES |
| fail | top3_compressed_topology_no_source_rights | BQ163 | more_context | SURF-ER1830R008 |
| fail | top3_compressed_topology_no_source_rights | BQ164 | more_context | SURF-ER1830R018 |
| fail | top3_compressed_topology_no_source_rights | BQ165 | more_context | SURF-CRG2026R0004 |
| fail | top3_compressed_topology_no_source_rights | BQ166 | more_context | SURF-CRG2026R0005 |
| fail | top3_compressed_topology_no_source_rights | BQ167 | more_context | SURF-CRG2026R0001 |
| fail | top3_compressed_topology_no_source_rights | BQ168 | more_context | SURF-GAX1970R002 |
| fail | top3_compressed_topology_no_source_rights | BQ169 | more_context | SURF-GA1970R001 |
| fail | top3_compressed_topology_no_source_rights | BQ170 | more_context | SURF-GAX1970R003 |
| fail | top3_compressed_topology_no_source_rights | BQ171 | more_context | SURF-GAX1970R004 |
| fail | top3_compressed_topology_no_source_rights | BQ172 | more_context | SURF-GAX1970R005 |
| fail | top3_compressed_topology_no_source_rights | BQ173 | more_context | SURF-CRG2026R0006 |
| fail | top3_compressed_topology_no_source_rights | BQ174 | more_context | SURF-CRG2026R0050 |
| fail | top3_compressed_topology_no_source_rights | BQ175 | more_context | SURF-CRG2026R0051 |
| fail | top3_compressed_topology_no_source_rights | BQ176 | more_context | SURF-CRG2026R0052 |

## Reading

- Top-k variants should be interpreted against seeded evidence labels.
- Source/rights removal is a negative control because it cannot satisfy
  source/rights queries even if it reduces prompt size.
- First/earliest and rights-upgrade claims are deliberately marked
  refusal-expected unless the fixture contains chronology proof. The benchmark
  treats this as a generation gate, not an empty-search requirement.
- Method/process questions use the research-only method context fixture record;
  this record is not archive object evidence.
