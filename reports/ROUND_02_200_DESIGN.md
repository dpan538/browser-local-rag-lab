# ROUND02 200 Design

Generated: 2026-06-08T05:47:36.083Z

## Round 01 Diagnosis

Round 01 proved that the WebLLM/Qwen runtime path works, but it is not yet a
quality-passing RAG setup:

- 30 rows executed; 28 completed and 2 hit context-window errors.
- BQ11 and BQ22 exceeded the 4096 context window.
- The generation contract reported 9 fail findings and 43 warnings.
- The dominant failure modes were refusal-missing answers, oversized prompts,
  and insufficient field externalization.

## Round 02 Objective

Round 02 is a repair round, not a paper-quality ablation round. Its goal is to
remove preventable runtime/prompt failures before broader comparison:

- 0 token-budget errors before WebLLM generation.
- 0 completed rows missing metric fields.
- Refusal-expected rows must start with the exact refusal phrase.
- Source/rights answers must copy exact evidence field text, not interpret it.
- Required fields should be visible enough for the generation contract.

## Prompt Strategy

- Orientation/help lanes use archive-structure facts, not object-level JSON.
- Refusal lanes use a hard refusal template and do not include tempting object
  facts.
- Source/rights lanes use explicit field summaries with exact rights strings.
- Other answerable lanes use compact required-field summaries instead of raw
  evidence JSON.

## Token Budget Preflight

- Token budget: 3800
- Rows checked: 200
- Token-budget failures: 0
- Prompt-audit failures: 0
- Max estimated prompt tokens: 1435
- Average estimated prompt tokens: 529.0
- Round 01 retry rows: BQ11, BQ22

| Query | Intent | Prompt mode | Est. tokens | Budget | Prompt audit | Round 01 retry |
|---|---|---|---:|---|---|---|
| BQ01 | archive_orientation | orientation_structure_summary | 175 | pass | pass | no |
| BQ02 | archive_orientation | orientation_structure_summary | 369 | pass | pass | no |
| BQ03 | archive_orientation | orientation_structure_summary | 346 | pass | pass | no |
| BQ04 | casual_archive_help | orientation_structure_summary | 171 | pass | pass | no |
| BQ05 | current_object_explanation | compact_required_field_summary | 686 | pass | pass | no |
| BQ06 | current_object_explanation | compact_required_field_summary | 508 | pass | pass | no |
| BQ07 | current_object_explanation | compact_required_field_summary | 754 | pass | pass | no |
| BQ08 | source_rights_question | source_rights_field_summary | 349 | pass | pass | no |
| BQ09 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ10 | first_earliest_claim | hard_refusal | 104 | pass | pass | no |
| BQ11 | first_earliest_claim | hard_refusal | 105 | pass | pass | yes |
| BQ12 | comparison | compact_required_field_summary | 597 | pass | pass | no |
| BQ13 | comparison | compact_required_field_summary | 624 | pass | pass | no |
| BQ14 | region_period_recommendation | compact_required_field_summary | 694 | pass | pass | no |
| BQ15 | region_period_recommendation | hard_refusal | 106 | pass | pass | no |
| BQ16 | region_period_recommendation | compact_required_field_summary | 929 | pass | pass | no |
| BQ17 | region_period_recommendation | hard_refusal | 104 | pass | pass | no |
| BQ18 | region_period_recommendation | hard_refusal | 107 | pass | pass | no |
| BQ19 | source_rights_question | source_rights_field_summary | 342 | pass | pass | no |
| BQ20 | source_rights_question | source_rights_field_summary | 346 | pass | pass | no |
| BQ21 | source_rights_question | source_rights_field_summary | 348 | pass | pass | no |
| BQ22 | source_rights_question | source_rights_field_summary | 345 | pass | pass | yes |
| BQ23 | method_process_question | compact_required_field_summary | 432 | pass | pass | no |
| BQ24 | method_process_question | compact_required_field_summary | 433 | pass | pass | no |
| BQ25 | more_context | compact_required_field_summary | 1215 | pass | pass | no |
| BQ26 | more_context | compact_required_field_summary | 1215 | pass | pass | no |
| BQ27 | no_evidence_refusal | hard_refusal | 107 | pass | pass | no |
| BQ28 | no_evidence_refusal | hard_refusal | 112 | pass | pass | no |
| BQ29 | no_evidence_refusal | hard_refusal | 105 | pass | pass | no |
| BQ30 | casual_archive_help | orientation_structure_summary | 323 | pass | pass | no |
| BQ031 | archive_orientation | orientation_structure_summary | 336 | pass | pass | no |
| BQ032 | archive_orientation | orientation_structure_summary | 387 | pass | pass | no |
| BQ033 | archive_orientation | orientation_structure_summary | 387 | pass | pass | no |
| BQ034 | archive_orientation | orientation_structure_summary | 387 | pass | pass | no |
| BQ035 | archive_orientation | orientation_structure_summary | 376 | pass | pass | no |
| BQ036 | archive_orientation | orientation_structure_summary | 387 | pass | pass | no |
| BQ037 | archive_orientation | orientation_structure_summary | 323 | pass | pass | no |
| BQ038 | archive_orientation | orientation_structure_summary | 336 | pass | pass | no |
| BQ039 | archive_orientation | orientation_structure_summary | 368 | pass | pass | no |
| BQ040 | archive_orientation | orientation_structure_summary | 369 | pass | pass | no |
| BQ041 | archive_orientation | orientation_structure_summary | 369 | pass | pass | no |
| BQ042 | archive_orientation | orientation_structure_summary | 399 | pass | pass | no |
| BQ043 | archive_orientation | orientation_structure_summary | 369 | pass | pass | no |
| BQ044 | casual_archive_help | orientation_structure_summary | 317 | pass | pass | no |
| BQ045 | casual_archive_help | orientation_structure_summary | 256 | pass | pass | no |
| BQ046 | casual_archive_help | orientation_structure_summary | 256 | pass | pass | no |
| BQ047 | casual_archive_help | orientation_structure_summary | 256 | pass | pass | no |
| BQ048 | casual_archive_help | orientation_structure_summary | 258 | pass | pass | no |
| BQ049 | casual_archive_help | orientation_structure_summary | 285 | pass | pass | no |
| BQ050 | casual_archive_help | orientation_structure_summary | 318 | pass | pass | no |
| BQ051 | casual_archive_help | orientation_structure_summary | 327 | pass | pass | no |
| BQ052 | casual_archive_help | orientation_structure_summary | 330 | pass | pass | no |
| BQ053 | casual_archive_help | orientation_structure_summary | 337 | pass | pass | no |
| BQ054 | casual_archive_help | orientation_structure_summary | 346 | pass | pass | no |
| BQ055 | casual_archive_help | orientation_structure_summary | 284 | pass | pass | no |
| BQ056 | casual_archive_help | orientation_structure_summary | 307 | pass | pass | no |
| BQ057 | casual_archive_help | orientation_structure_summary | 313 | pass | pass | no |
| BQ058 | current_object_explanation | compact_required_field_summary | 803 | pass | pass | no |
| BQ059 | current_object_explanation | compact_required_field_summary | 787 | pass | pass | no |
| BQ060 | current_object_explanation | compact_required_field_summary | 794 | pass | pass | no |
| BQ061 | current_object_explanation | compact_required_field_summary | 859 | pass | pass | no |
| BQ062 | current_object_explanation | compact_required_field_summary | 902 | pass | pass | no |
| BQ063 | current_object_explanation | compact_required_field_summary | 766 | pass | pass | no |
| BQ064 | current_object_explanation | compact_required_field_summary | 763 | pass | pass | no |
| BQ065 | current_object_explanation | compact_required_field_summary | 965 | pass | pass | no |
| BQ066 | current_object_explanation | compact_required_field_summary | 965 | pass | pass | no |
| BQ067 | current_object_explanation | compact_required_field_summary | 809 | pass | pass | no |
| BQ068 | current_object_explanation | compact_required_field_summary | 946 | pass | pass | no |
| BQ069 | current_object_explanation | compact_required_field_summary | 868 | pass | pass | no |
| BQ070 | current_object_explanation | compact_required_field_summary | 870 | pass | pass | no |
| BQ071 | current_object_explanation | compact_required_field_summary | 825 | pass | pass | no |
| BQ072 | current_object_explanation | compact_required_field_summary | 1000 | pass | pass | no |
| BQ073 | current_object_explanation | compact_required_field_summary | 716 | pass | pass | no |
| BQ074 | current_object_explanation | compact_required_field_summary | 813 | pass | pass | no |
| BQ075 | current_object_explanation | compact_required_field_summary | 724 | pass | pass | no |
| BQ076 | current_object_explanation | compact_required_field_summary | 936 | pass | pass | no |
| BQ077 | current_object_explanation | compact_required_field_summary | 721 | pass | pass | no |
| BQ078 | current_object_explanation | compact_required_field_summary | 726 | pass | pass | no |
| BQ079 | current_object_explanation | compact_required_field_summary | 727 | pass | pass | no |
| BQ080 | current_object_explanation | compact_required_field_summary | 731 | pass | pass | no |
| BQ081 | current_object_explanation | compact_required_field_summary | 744 | pass | pass | no |
| BQ082 | current_object_explanation | compact_required_field_summary | 753 | pass | pass | no |
| BQ083 | source_rights_question | source_rights_field_summary | 327 | pass | pass | no |
| BQ084 | source_rights_question | source_rights_field_summary | 294 | pass | pass | no |
| BQ085 | source_rights_question | source_rights_field_summary | 323 | pass | pass | no |
| BQ086 | source_rights_question | source_rights_field_summary | 304 | pass | pass | no |
| BQ087 | source_rights_question | source_rights_field_summary | 277 | pass | pass | no |
| BQ088 | source_rights_question | source_rights_field_summary | 344 | pass | pass | no |
| BQ089 | source_rights_question | source_rights_field_summary | 450 | pass | pass | no |
| BQ090 | source_rights_question | source_rights_field_summary | 296 | pass | pass | no |
| BQ091 | source_rights_question | source_rights_field_summary | 317 | pass | pass | no |
| BQ092 | source_rights_question | source_rights_field_summary | 279 | pass | pass | no |
| BQ093 | source_rights_question | source_rights_field_summary | 279 | pass | pass | no |
| BQ094 | source_rights_question | source_rights_field_summary | 399 | pass | pass | no |
| BQ095 | source_rights_question | source_rights_field_summary | 510 | pass | pass | no |
| BQ096 | source_rights_question | source_rights_field_summary | 376 | pass | pass | no |
| BQ097 | source_rights_question | source_rights_field_summary | 350 | pass | pass | no |
| BQ098 | source_rights_question | source_rights_field_summary | 467 | pass | pass | no |
| BQ099 | source_rights_question | source_rights_field_summary | 362 | pass | pass | no |
| BQ100 | source_rights_question | source_rights_field_summary | 385 | pass | pass | no |
| BQ101 | source_rights_question | source_rights_field_summary | 362 | pass | pass | no |
| BQ102 | comparison | compact_required_field_summary | 514 | pass | pass | no |
| BQ103 | comparison | compact_required_field_summary | 764 | pass | pass | no |
| BQ104 | comparison | compact_required_field_summary | 753 | pass | pass | no |
| BQ105 | comparison | compact_required_field_summary | 598 | pass | pass | no |
| BQ106 | comparison | compact_required_field_summary | 808 | pass | pass | no |
| BQ107 | comparison | compact_required_field_summary | 774 | pass | pass | no |
| BQ108 | comparison | compact_required_field_summary | 638 | pass | pass | no |
| BQ109 | comparison | compact_required_field_summary | 596 | pass | pass | no |
| BQ110 | comparison | compact_required_field_summary | 965 | pass | pass | no |
| BQ111 | comparison | compact_required_field_summary | 690 | pass | pass | no |
| BQ112 | comparison | compact_required_field_summary | 621 | pass | pass | no |
| BQ113 | comparison | compact_required_field_summary | 675 | pass | pass | no |
| BQ114 | comparison | compact_required_field_summary | 803 | pass | pass | no |
| BQ115 | comparison | compact_required_field_summary | 599 | pass | pass | no |
| BQ116 | comparison | compact_required_field_summary | 564 | pass | pass | no |
| BQ117 | comparison | compact_required_field_summary | 734 | pass | pass | no |
| BQ118 | comparison | compact_required_field_summary | 460 | pass | pass | no |
| BQ119 | comparison | compact_required_field_summary | 553 | pass | pass | no |
| BQ120 | comparison | compact_required_field_summary | 472 | pass | pass | no |
| BQ121 | comparison | compact_required_field_summary | 703 | pass | pass | no |
| BQ122 | comparison | compact_required_field_summary | 409 | pass | pass | no |
| BQ123 | comparison | compact_required_field_summary | 456 | pass | pass | no |
| BQ124 | comparison | compact_required_field_summary | 439 | pass | pass | no |
| BQ125 | comparison | compact_required_field_summary | 485 | pass | pass | no |
| BQ126 | comparison | compact_required_field_summary | 533 | pass | pass | no |
| BQ127 | comparison | compact_required_field_summary | 618 | pass | pass | no |
| BQ128 | region_period_recommendation | compact_required_field_summary | 697 | pass | pass | no |
| BQ129 | region_period_recommendation | compact_required_field_summary | 695 | pass | pass | no |
| BQ130 | region_period_recommendation | compact_required_field_summary | 705 | pass | pass | no |
| BQ131 | region_period_recommendation | compact_required_field_summary | 694 | pass | pass | no |
| BQ132 | region_period_recommendation | compact_required_field_summary | 695 | pass | pass | no |
| BQ133 | region_period_recommendation | compact_required_field_summary | 701 | pass | pass | no |
| BQ134 | region_period_recommendation | compact_required_field_summary | 701 | pass | pass | no |
| BQ135 | region_period_recommendation | compact_required_field_summary | 697 | pass | pass | no |
| BQ136 | region_period_recommendation | compact_required_field_summary | 700 | pass | pass | no |
| BQ137 | region_period_recommendation | compact_required_field_summary | 697 | pass | pass | no |
| BQ138 | region_period_recommendation | compact_required_field_summary | 697 | pass | pass | no |
| BQ139 | region_period_recommendation | compact_required_field_summary | 701 | pass | pass | no |
| BQ140 | region_period_recommendation | compact_required_field_summary | 701 | pass | pass | no |
| BQ141 | region_period_recommendation | compact_required_field_summary | 701 | pass | pass | no |
| BQ142 | region_period_recommendation | compact_required_field_summary | 698 | pass | pass | no |
| BQ143 | region_period_recommendation | compact_required_field_summary | 698 | pass | pass | no |
| BQ144 | region_period_recommendation | compact_required_field_summary | 698 | pass | pass | no |
| BQ145 | region_period_recommendation | compact_required_field_summary | 698 | pass | pass | no |
| BQ146 | region_period_recommendation | compact_required_field_summary | 698 | pass | pass | no |
| BQ147 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ148 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ149 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ150 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ151 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ152 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ153 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ154 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ155 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ156 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ157 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ158 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ159 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ160 | method_process_question | compact_required_field_summary | 437 | pass | pass | no |
| BQ161 | more_context | compact_required_field_summary | 1211 | pass | pass | no |
| BQ162 | more_context | compact_required_field_summary | 1195 | pass | pass | no |
| BQ163 | more_context | compact_required_field_summary | 1215 | pass | pass | no |
| BQ164 | more_context | compact_required_field_summary | 1260 | pass | pass | no |
| BQ165 | more_context | compact_required_field_summary | 1291 | pass | pass | no |
| BQ166 | more_context | compact_required_field_summary | 1219 | pass | pass | no |
| BQ167 | more_context | compact_required_field_summary | 1088 | pass | pass | no |
| BQ168 | more_context | compact_required_field_summary | 1088 | pass | pass | no |
| BQ169 | more_context | compact_required_field_summary | 1128 | pass | pass | no |
| BQ170 | more_context | compact_required_field_summary | 1188 | pass | pass | no |
| BQ171 | more_context | compact_required_field_summary | 1045 | pass | pass | no |
| BQ172 | more_context | compact_required_field_summary | 1045 | pass | pass | no |
| BQ173 | more_context | compact_required_field_summary | 1435 | pass | pass | no |
| BQ174 | more_context | compact_required_field_summary | 1303 | pass | pass | no |
| BQ175 | more_context | compact_required_field_summary | 1045 | pass | pass | no |
| BQ176 | more_context | compact_required_field_summary | 1435 | pass | pass | no |
| BQ177 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ178 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ179 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ180 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ181 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ182 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ183 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ184 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ185 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ186 | first_earliest_claim | hard_refusal | 108 | pass | pass | no |
| BQ187 | first_earliest_claim | hard_refusal | 108 | pass | pass | no |
| BQ188 | first_earliest_claim | hard_refusal | 108 | pass | pass | no |
| BQ189 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ190 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ191 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ192 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ193 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ194 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ195 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ196 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ197 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ198 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ199 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |
| BQ200 | no_evidence_refusal | hard_refusal | 113 | pass | pass | no |

## Round 02 Run Protocol

1. Implement the Round 02 prompt modes in the browser runner.
2. Run `npm run round2:preflight` and require 0 token-budget failures.
3. Run the browser WebLLM round with cache state recorded as
   `warm_from_previous`, `cold_cleared`, or `ambiguous`.
4. Retry each runtime error at most once with the compact prompt mode.
5. Import the browser export.
6. Treat contract fail findings as blockers, not as qualitative caveats.
