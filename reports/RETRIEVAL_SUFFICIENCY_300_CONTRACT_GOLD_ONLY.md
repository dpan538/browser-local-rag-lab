# Retrieval Sufficiency Contract Variant

Generated: 2026-06-08T11:31:29.103Z

This is a research-only controlled evidence-packet variant. It injects each
answerable label's gold evidence IDs into the packet before adding filler
records from the original retrieval result. It does not represent product
retrieval quality.

## Summary

- Source variant: top3_compressed_topology_source_rights
- Contract variant: gold_only_contract_source_rights
- Rows: 300
- Rows with injected gold evidence: 69
- Total injected gold IDs: 103

## Changed Rows

| Query | Intent | Injected gold count | Retrieved IDs |
|---|---|---:|---|
| BQ01 | archive_orientation | 2 | SURF-ER1830R004|SURF-ER1830R015 |
| BQ04 | casual_archive_help | 2 | SURF-ER1830R015|SURF-CRG2026R0051 |
| BQ031 | archive_orientation | 1 | SURF-CRG2026R0001|SURF-CRG2026R0050 |
| BQ032 | archive_orientation | 2 | SURF-GAX1970R002|SURF-CRG2026R0051 |
| BQ033 | archive_orientation | 2 | SURF-GA1970R001|SURF-CRG2026R0052 |
| BQ034 | archive_orientation | 2 | SURF-GAX1970R003|SURF-CRG2026R0071 |
| BQ035 | archive_orientation | 2 | SURF-GAX1970R004|SURF-COM1970R007 |
| BQ036 | archive_orientation | 2 | SURF-GAX1970R005|SURF-CRG2026R0235 |
| BQ037 | archive_orientation | 1 | SURF-CRG2026R0006|SURF-CRG2026R0246 |
| BQ038 | archive_orientation | 2 | SURF-CRG2026R0050|SURF-CRG2026R0274 |
| BQ039 | archive_orientation | 2 | SURF-CRG2026R0051|SURF-CGS2026R0681 |
| BQ040 | archive_orientation | 2 | SURF-CRG2026R0052|SURF-CGS2026R0328 |
| BQ041 | archive_orientation | 2 | SURF-CRG2026R0071|SURF-CGS2026R0030 |
| BQ042 | archive_orientation | 1 | SURF-COM1970R007|SURF-CGS2026R0908 |
| BQ043 | archive_orientation | 2 | SURF-CRG2026R0235|SURF-CGS2026R0904 |
| BQ128 | region_period_recommendation | 1 | SURF-CRG2026R0001|SURF-CRG2026R0050 |
| BQ129 | region_period_recommendation | 2 | SURF-CRG2026R0050|SURF-CRG2026R0051 |
| BQ130 | region_period_recommendation | 2 | SURF-CRG2026R0051|SURF-CRG2026R0052 |
| BQ131 | region_period_recommendation | 2 | SURF-CRG2026R0052|SURF-CRG2026R0071 |
| BQ132 | region_period_recommendation | 2 | SURF-CRG2026R0071|SURF-CRG2026R0235 |
| BQ133 | region_period_recommendation | 2 | SURF-CRG2026R0235|SURF-CRG2026R0246 |
| BQ134 | region_period_recommendation | 2 | SURF-CRG2026R0246|SURF-CRG2026R0274 |
| BQ135 | region_period_recommendation | 2 | SURF-CRG2026R0274|SURF-CRG2026R0020 |
| BQ136 | region_period_recommendation | 2 | SURF-CRG2026R0020|SURF-CRG2026R0175 |
| BQ137 | region_period_recommendation | 2 | SURF-CRG2026R0175|SURF-CRG2026R0002 |
| BQ138 | region_period_recommendation | 2 | SURF-CRG2026R0002|SURF-CRG2026R0003 |
| BQ139 | region_period_recommendation | 2 | SURF-CRG2026R0003|SURF-CRG2026R0004 |
| BQ140 | region_period_recommendation | 2 | SURF-CRG2026R0004|SURF-CRG2026R0005 |
| BQ141 | region_period_recommendation | 1 | SURF-CRG2026R0005|SURF-CRG2026R0001 |
| BQ143 | region_period_recommendation | 1 | SURF-GA1970R001|SURF-GAX1970R003 |
| BQ144 | region_period_recommendation | 2 | SURF-GAX1970R003|SURF-GAX1970R004 |
| BQ145 | region_period_recommendation | 2 | SURF-GAX1970R004|SURF-GAX1970R005 |
| BQ146 | region_period_recommendation | 2 | SURF-GAX1970R005|SURF-ER1830R046 |
| BQ161 | more_context | 1 | SURF-ER1830R019|SURF-ER1830R004 |
| BQ162 | more_context | 1 | SURF-ER1830R001-GROUP|SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES |
| BQ163 | more_context | 1 | SURF-CHW2026R001|SURF-ER1830R008 |
| BQ164 | more_context | 1 | SURF-ER1830R002|SURF-ER1830R018 |
| BQ165 | more_context | 1 | SURF-SI1970R001|SURF-CRG2026R0004 |
| BQ166 | more_context | 1 | SURF-CRG2026R0002|SURF-CRG2026R0005 |
| BQ167 | more_context | 1 | SURF-CRG2026R0003|SURF-CRG2026R0001 |
| BQ168 | more_context | 1 | SURF-ER1830R004|SURF-GAX1970R002 |
| BQ169 | more_context | 1 | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES|SURF-GA1970R001 |
| BQ170 | more_context | 1 | SURF-ER1830R008|SURF-GAX1970R003 |
| BQ171 | more_context | 1 | SURF-ER1830R018|SURF-GAX1970R004 |
| BQ172 | more_context | 1 | SURF-CRG2026R0004|SURF-GAX1970R005 |
| BQ173 | more_context | 1 | SURF-CRG2026R0005|SURF-CRG2026R0006 |
| BQ174 | more_context | 1 | SURF-CRG2026R0001|SURF-CRG2026R0050 |
| BQ175 | more_context | 1 | SURF-GAX1970R002|SURF-CRG2026R0051 |
| BQ176 | more_context | 1 | SURF-GA1970R001|SURF-CRG2026R0052 |
| BQ201 | archive_orientation | 2 | SURF-CGS2026R0031|SURF-ER1830R064 |
| BQ202 | archive_orientation | 2 | SURF-CGS2026R0904|SURF-ER1830R065 |
| BQ203 | archive_orientation | 1 | SURF-CHW2026R001|SURF-ER1830R066 |
| BQ204 | archive_orientation | 1 | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES|SURF-SI1970R001 |
| BQ205 | archive_orientation | 1 | SURF-CRG2026R0006|SURF-CGS2026R0030 |
| BQ206 | archive_orientation | 2 | SURF-CRG2026R0027|SURF-CGS2026R0328 |
| BQ239 | region_period_recommendation | 1 | SURF-CGS2026R0031|SURF-CGS2026R0030 |
| BQ241 | region_period_recommendation | 1 | SURF-CGS2026R0328|SURF-CGS2026R0031 |
| BQ242 | region_period_recommendation | 1 | SURF-CRG2026R0153|SURF-CRG2026R0031 |
| BQ244 | region_period_recommendation | 1 | SURF-CRG2026R0032|SURF-CRG2026R0153 |
| BQ245 | region_period_recommendation | 2 | SURF-ER1830R008|SURF-ER1830R011 |
| BQ246 | region_period_recommendation | 2 | SURF-ER1830R011|SURF-ER1830R017 |
| BQ247 | region_period_recommendation | 2 | SURF-ER1830R017|SURF-ER1830R018 |
| BQ248 | region_period_recommendation | 2 | SURF-ER1830R018|SURF-ER1830R019 |
| BQ255 | more_context | 1 | SURF-ER1830R059|SURF-CRG2026R0004 |
| BQ256 | more_context | 1 | SURF-ER1830R064|SURF-CRG2026R0020 |
| BQ257 | more_context | 1 | SURF-ER1830R065|SURF-CRG2026R0175 |
| BQ258 | more_context | 1 | SURF-ER1830R066|SURF-CRG2026R0246 |
| BQ259 | more_context | 1 | SURF-SI1970R001|SURF-ER1830R015 |
| BQ260 | more_context | 1 | SURF-CGS2026R0030|SURF-CRG2026R0005 |
