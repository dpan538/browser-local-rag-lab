# ROUND02 200 CONTRACT GOLD ONLY Design

Generated: 2026-06-08T08:15:17.534Z

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
- Max estimated prompt tokens: 1223
- Average estimated prompt tokens: 458.8
- Round 01 retry rows: BQ11, BQ22

| Query | Intent | Prompt mode | Est. tokens | Budget | Prompt audit | Round 01 retry |
|---|---|---|---:|---|---|---|
| BQ01 | archive_orientation | orientation_structure_with_tags | 371 | pass | pass | no |
| BQ02 | archive_orientation | orientation_structure_with_tags | 414 | pass | pass | no |
| BQ03 | archive_orientation | orientation_structure_with_tags | 426 | pass | pass | no |
| BQ04 | casual_archive_help | orientation_structure_with_tags | 405 | pass | pass | no |
| BQ05 | current_object_explanation | answerable_with_evidence_tags | 318 | pass | pass | no |
| BQ06 | current_object_explanation | answerable_with_evidence_tags | 331 | pass | pass | no |
| BQ07 | current_object_explanation | answerable_with_evidence_tags | 319 | pass | pass | no |
| BQ08 | source_rights_question | source_rights_strict | 360 | pass | pass | no |
| BQ09 | first_earliest_claim | hard_refusal | 107 | pass | pass | no |
| BQ10 | first_earliest_claim | hard_refusal | 104 | pass | pass | no |
| BQ11 | first_earliest_claim | hard_refusal | 105 | pass | pass | yes |
| BQ12 | comparison | answerable_with_evidence_tags | 601 | pass | pass | no |
| BQ13 | comparison | answerable_with_evidence_tags | 628 | pass | pass | no |
| BQ14 | region_period_recommendation | answerable_with_evidence_tags | 728 | pass | pass | no |
| BQ15 | region_period_recommendation | hard_refusal | 106 | pass | pass | no |
| BQ16 | region_period_recommendation | answerable_with_evidence_tags | 918 | pass | pass | no |
| BQ17 | region_period_recommendation | hard_refusal | 104 | pass | pass | no |
| BQ18 | region_period_recommendation | hard_refusal | 107 | pass | pass | no |
| BQ19 | source_rights_question | source_rights_strict | 352 | pass | pass | no |
| BQ20 | source_rights_question | source_rights_strict | 357 | pass | pass | no |
| BQ21 | source_rights_question | source_rights_strict | 359 | pass | pass | no |
| BQ22 | source_rights_question | source_rights_strict | 356 | pass | pass | yes |
| BQ23 | method_process_question | answerable_with_evidence_tags | 454 | pass | pass | no |
| BQ24 | method_process_question | answerable_with_evidence_tags | 455 | pass | pass | no |
| BQ25 | more_context | answerable_with_evidence_tags | 1223 | pass | pass | no |
| BQ26 | more_context | answerable_with_evidence_tags | 1223 | pass | pass | no |
| BQ27 | no_evidence_refusal | hard_refusal | 107 | pass | pass | no |
| BQ28 | no_evidence_refusal | hard_refusal | 112 | pass | pass | no |
| BQ29 | no_evidence_refusal | hard_refusal | 105 | pass | pass | no |
| BQ30 | casual_archive_help | orientation_structure_with_tags | 382 | pass | pass | no |
| BQ031 | archive_orientation | orientation_structure_with_tags | 429 | pass | pass | no |
| BQ032 | archive_orientation | orientation_structure_with_tags | 407 | pass | pass | no |
| BQ033 | archive_orientation | orientation_structure_with_tags | 415 | pass | pass | no |
| BQ034 | archive_orientation | orientation_structure_with_tags | 423 | pass | pass | no |
| BQ035 | archive_orientation | orientation_structure_with_tags | 365 | pass | pass | no |
| BQ036 | archive_orientation | orientation_structure_with_tags | 381 | pass | pass | no |
| BQ037 | archive_orientation | orientation_structure_with_tags | 412 | pass | pass | no |
| BQ038 | archive_orientation | orientation_structure_with_tags | 414 | pass | pass | no |
| BQ039 | archive_orientation | orientation_structure_with_tags | 416 | pass | pass | no |
| BQ040 | archive_orientation | orientation_structure_with_tags | 436 | pass | pass | no |
| BQ041 | archive_orientation | orientation_structure_with_tags | 444 | pass | pass | no |
| BQ042 | archive_orientation | orientation_structure_with_tags | 400 | pass | pass | no |
| BQ043 | archive_orientation | orientation_structure_with_tags | 387 | pass | pass | no |
| BQ044 | casual_archive_help | orientation_structure_with_tags | 342 | pass | pass | no |
| BQ045 | casual_archive_help | orientation_structure_with_tags | 322 | pass | pass | no |
| BQ046 | casual_archive_help | orientation_structure_with_tags | 322 | pass | pass | no |
| BQ047 | casual_archive_help | orientation_structure_with_tags | 322 | pass | pass | no |
| BQ048 | casual_archive_help | orientation_structure_with_tags | 325 | pass | pass | no |
| BQ049 | casual_archive_help | orientation_structure_with_tags | 317 | pass | pass | no |
| BQ050 | casual_archive_help | orientation_structure_with_tags | 340 | pass | pass | no |
| BQ051 | casual_archive_help | orientation_structure_with_tags | 349 | pass | pass | no |
| BQ052 | casual_archive_help | orientation_structure_with_tags | 352 | pass | pass | no |
| BQ053 | casual_archive_help | orientation_structure_with_tags | 360 | pass | pass | no |
| BQ054 | casual_archive_help | orientation_structure_with_tags | 368 | pass | pass | no |
| BQ055 | casual_archive_help | orientation_structure_with_tags | 311 | pass | pass | no |
| BQ056 | casual_archive_help | orientation_structure_with_tags | 324 | pass | pass | no |
| BQ057 | casual_archive_help | orientation_structure_with_tags | 335 | pass | pass | no |
| BQ058 | current_object_explanation | answerable_with_evidence_tags | 421 | pass | pass | no |
| BQ059 | current_object_explanation | answerable_with_evidence_tags | 405 | pass | pass | no |
| BQ060 | current_object_explanation | answerable_with_evidence_tags | 412 | pass | pass | no |
| BQ061 | current_object_explanation | answerable_with_evidence_tags | 478 | pass | pass | no |
| BQ062 | current_object_explanation | answerable_with_evidence_tags | 521 | pass | pass | no |
| BQ063 | current_object_explanation | answerable_with_evidence_tags | 385 | pass | pass | no |
| BQ064 | current_object_explanation | answerable_with_evidence_tags | 382 | pass | pass | no |
| BQ065 | current_object_explanation | answerable_with_evidence_tags | 613 | pass | pass | no |
| BQ066 | current_object_explanation | answerable_with_evidence_tags | 613 | pass | pass | no |
| BQ067 | current_object_explanation | answerable_with_evidence_tags | 428 | pass | pass | no |
| BQ068 | current_object_explanation | answerable_with_evidence_tags | 567 | pass | pass | no |
| BQ069 | current_object_explanation | answerable_with_evidence_tags | 487 | pass | pass | no |
| BQ070 | current_object_explanation | answerable_with_evidence_tags | 488 | pass | pass | no |
| BQ071 | current_object_explanation | answerable_with_evidence_tags | 444 | pass | pass | no |
| BQ072 | current_object_explanation | answerable_with_evidence_tags | 648 | pass | pass | no |
| BQ073 | current_object_explanation | answerable_with_evidence_tags | 350 | pass | pass | no |
| BQ074 | current_object_explanation | answerable_with_evidence_tags | 431 | pass | pass | no |
| BQ075 | current_object_explanation | answerable_with_evidence_tags | 357 | pass | pass | no |
| BQ076 | current_object_explanation | answerable_with_evidence_tags | 554 | pass | pass | no |
| BQ077 | current_object_explanation | answerable_with_evidence_tags | 355 | pass | pass | no |
| BQ078 | current_object_explanation | answerable_with_evidence_tags | 360 | pass | pass | no |
| BQ079 | current_object_explanation | answerable_with_evidence_tags | 361 | pass | pass | no |
| BQ080 | current_object_explanation | answerable_with_evidence_tags | 365 | pass | pass | no |
| BQ081 | current_object_explanation | answerable_with_evidence_tags | 378 | pass | pass | no |
| BQ082 | current_object_explanation | answerable_with_evidence_tags | 386 | pass | pass | no |
| BQ083 | source_rights_question | source_rights_strict | 338 | pass | pass | no |
| BQ084 | source_rights_question | source_rights_strict | 305 | pass | pass | no |
| BQ085 | source_rights_question | source_rights_strict | 333 | pass | pass | no |
| BQ086 | source_rights_question | source_rights_strict | 315 | pass | pass | no |
| BQ087 | source_rights_question | source_rights_strict | 288 | pass | pass | no |
| BQ088 | source_rights_question | source_rights_strict | 355 | pass | pass | no |
| BQ089 | source_rights_question | source_rights_strict | 461 | pass | pass | no |
| BQ090 | source_rights_question | source_rights_strict | 307 | pass | pass | no |
| BQ091 | source_rights_question | source_rights_strict | 328 | pass | pass | no |
| BQ092 | source_rights_question | source_rights_strict | 290 | pass | pass | no |
| BQ093 | source_rights_question | source_rights_strict | 290 | pass | pass | no |
| BQ094 | source_rights_question | source_rights_strict | 410 | pass | pass | no |
| BQ095 | source_rights_question | source_rights_strict | 521 | pass | pass | no |
| BQ096 | source_rights_question | source_rights_strict | 387 | pass | pass | no |
| BQ097 | source_rights_question | source_rights_strict | 361 | pass | pass | no |
| BQ098 | source_rights_question | source_rights_strict | 478 | pass | pass | no |
| BQ099 | source_rights_question | source_rights_strict | 372 | pass | pass | no |
| BQ100 | source_rights_question | source_rights_strict | 395 | pass | pass | no |
| BQ101 | source_rights_question | source_rights_strict | 373 | pass | pass | no |
| BQ102 | comparison | answerable_with_evidence_tags | 533 | pass | pass | no |
| BQ103 | comparison | answerable_with_evidence_tags | 798 | pass | pass | no |
| BQ104 | comparison | answerable_with_evidence_tags | 787 | pass | pass | no |
| BQ105 | comparison | answerable_with_evidence_tags | 602 | pass | pass | no |
| BQ106 | comparison | answerable_with_evidence_tags | 814 | pass | pass | no |
| BQ107 | comparison | answerable_with_evidence_tags | 778 | pass | pass | no |
| BQ108 | comparison | answerable_with_evidence_tags | 642 | pass | pass | no |
| BQ109 | comparison | answerable_with_evidence_tags | 600 | pass | pass | no |
| BQ110 | comparison | answerable_with_evidence_tags | 1029 | pass | pass | no |
| BQ111 | comparison | answerable_with_evidence_tags | 739 | pass | pass | no |
| BQ112 | comparison | answerable_with_evidence_tags | 625 | pass | pass | no |
| BQ113 | comparison | answerable_with_evidence_tags | 696 | pass | pass | no |
| BQ114 | comparison | answerable_with_evidence_tags | 807 | pass | pass | no |
| BQ115 | comparison | answerable_with_evidence_tags | 618 | pass | pass | no |
| BQ116 | comparison | answerable_with_evidence_tags | 583 | pass | pass | no |
| BQ117 | comparison | answerable_with_evidence_tags | 783 | pass | pass | no |
| BQ118 | comparison | answerable_with_evidence_tags | 494 | pass | pass | no |
| BQ119 | comparison | answerable_with_evidence_tags | 572 | pass | pass | no |
| BQ120 | comparison | answerable_with_evidence_tags | 506 | pass | pass | no |
| BQ121 | comparison | answerable_with_evidence_tags | 722 | pass | pass | no |
| BQ122 | comparison | answerable_with_evidence_tags | 443 | pass | pass | no |
| BQ123 | comparison | answerable_with_evidence_tags | 490 | pass | pass | no |
| BQ124 | comparison | answerable_with_evidence_tags | 473 | pass | pass | no |
| BQ125 | comparison | answerable_with_evidence_tags | 517 | pass | pass | no |
| BQ126 | comparison | answerable_with_evidence_tags | 552 | pass | pass | no |
| BQ127 | comparison | answerable_with_evidence_tags | 637 | pass | pass | no |
| BQ128 | region_period_recommendation | answerable_with_evidence_tags | 749 | pass | pass | no |
| BQ129 | region_period_recommendation | answerable_with_evidence_tags | 798 | pass | pass | no |
| BQ130 | region_period_recommendation | answerable_with_evidence_tags | 863 | pass | pass | no |
| BQ131 | region_period_recommendation | answerable_with_evidence_tags | 961 | pass | pass | no |
| BQ132 | region_period_recommendation | answerable_with_evidence_tags | 810 | pass | pass | no |
| BQ133 | region_period_recommendation | answerable_with_evidence_tags | 601 | pass | pass | no |
| BQ134 | region_period_recommendation | answerable_with_evidence_tags | 626 | pass | pass | no |
| BQ135 | region_period_recommendation | answerable_with_evidence_tags | 664 | pass | pass | no |
| BQ136 | region_period_recommendation | answerable_with_evidence_tags | 797 | pass | pass | no |
| BQ137 | region_period_recommendation | answerable_with_evidence_tags | 787 | pass | pass | no |
| BQ138 | region_period_recommendation | answerable_with_evidence_tags | 726 | pass | pass | no |
| BQ139 | region_period_recommendation | answerable_with_evidence_tags | 779 | pass | pass | no |
| BQ140 | region_period_recommendation | answerable_with_evidence_tags | 841 | pass | pass | no |
| BQ141 | region_period_recommendation | answerable_with_evidence_tags | 820 | pass | pass | no |
| BQ142 | region_period_recommendation | answerable_with_evidence_tags | 596 | pass | pass | no |
| BQ143 | region_period_recommendation | answerable_with_evidence_tags | 617 | pass | pass | no |
| BQ144 | region_period_recommendation | answerable_with_evidence_tags | 550 | pass | pass | no |
| BQ145 | region_period_recommendation | answerable_with_evidence_tags | 566 | pass | pass | no |
| BQ146 | region_period_recommendation | answerable_with_evidence_tags | 527 | pass | pass | no |
| BQ147 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ148 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ149 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ150 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ151 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ152 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ153 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ154 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ155 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ156 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ157 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ158 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ159 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ160 | method_process_question | answerable_with_evidence_tags | 459 | pass | pass | no |
| BQ161 | more_context | answerable_with_evidence_tags | 742 | pass | pass | no |
| BQ162 | more_context | answerable_with_evidence_tags | 645 | pass | pass | no |
| BQ163 | more_context | answerable_with_evidence_tags | 670 | pass | pass | no |
| BQ164 | more_context | answerable_with_evidence_tags | 613 | pass | pass | no |
| BQ165 | more_context | answerable_with_evidence_tags | 776 | pass | pass | no |
| BQ166 | more_context | answerable_with_evidence_tags | 881 | pass | pass | no |
| BQ167 | more_context | answerable_with_evidence_tags | 857 | pass | pass | no |
| BQ168 | more_context | answerable_with_evidence_tags | 653 | pass | pass | no |
| BQ169 | more_context | answerable_with_evidence_tags | 798 | pass | pass | no |
| BQ170 | more_context | answerable_with_evidence_tags | 634 | pass | pass | no |
| BQ171 | more_context | answerable_with_evidence_tags | 684 | pass | pass | no |
| BQ172 | more_context | answerable_with_evidence_tags | 752 | pass | pass | no |
| BQ173 | more_context | answerable_with_evidence_tags | 898 | pass | pass | no |
| BQ174 | more_context | answerable_with_evidence_tags | 846 | pass | pass | no |
| BQ175 | more_context | answerable_with_evidence_tags | 750 | pass | pass | no |
| BQ176 | more_context | answerable_with_evidence_tags | 927 | pass | pass | no |
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
