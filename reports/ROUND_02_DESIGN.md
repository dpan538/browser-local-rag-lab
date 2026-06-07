# Round 02 Design

Generated: 2026-06-07T06:17:31.780Z

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
- Rows checked: 30
- Token-budget failures: 0
- Max estimated prompt tokens: 965
- Average estimated prompt tokens: 404.0
- Round 01 retry rows: BQ11, BQ22

| Query | Intent | Prompt mode | Est. tokens | Budget | Round 01 retry |
|---|---|---|---:|---|---|
| BQ01 | archive_orientation | orientation_structure_summary | 222 | pass | no |
| BQ02 | archive_orientation | orientation_structure_summary | 281 | pass | no |
| BQ03 | archive_orientation | orientation_structure_summary | 260 | pass | no |
| BQ04 | casual_archive_help | orientation_structure_summary | 222 | pass | no |
| BQ05 | current_object_explanation | compact_required_field_summary | 497 | pass | no |
| BQ06 | current_object_explanation | compact_required_field_summary | 476 | pass | no |
| BQ07 | current_object_explanation | compact_required_field_summary | 550 | pass | no |
| BQ08 | source_rights_question | source_rights_field_summary | 742 | pass | no |
| BQ09 | first_earliest_claim | hard_refusal | 143 | pass | no |
| BQ10 | first_earliest_claim | hard_refusal | 139 | pass | no |
| BQ11 | first_earliest_claim | hard_refusal | 141 | pass | yes |
| BQ12 | comparison | compact_required_field_summary | 453 | pass | no |
| BQ13 | comparison | compact_required_field_summary | 480 | pass | no |
| BQ14 | region_period_recommendation | compact_required_field_summary | 491 | pass | no |
| BQ15 | region_period_recommendation | hard_refusal | 144 | pass | no |
| BQ16 | region_period_recommendation | compact_required_field_summary | 690 | pass | no |
| BQ17 | region_period_recommendation | hard_refusal | 142 | pass | no |
| BQ18 | region_period_recommendation | hard_refusal | 144 | pass | no |
| BQ19 | source_rights_question | source_rights_field_summary | 680 | pass | no |
| BQ20 | source_rights_question | source_rights_field_summary | 622 | pass | no |
| BQ21 | source_rights_question | source_rights_field_summary | 655 | pass | no |
| BQ22 | source_rights_question | source_rights_field_summary | 965 | pass | yes |
| BQ23 | method_process_question | compact_required_field_summary | 314 | pass | no |
| BQ24 | method_process_question | compact_required_field_summary | 315 | pass | no |
| BQ25 | more_context | compact_required_field_summary | 834 | pass | no |
| BQ26 | more_context | compact_required_field_summary | 834 | pass | no |
| BQ27 | no_evidence_refusal | hard_refusal | 142 | pass | no |
| BQ28 | no_evidence_refusal | hard_refusal | 147 | pass | no |
| BQ29 | no_evidence_refusal | hard_refusal | 140 | pass | no |
| BQ30 | casual_archive_help | orientation_structure_summary | 254 | pass | no |

## Round 02 Run Protocol

1. Implement the Round 02 prompt modes in the browser runner.
2. Run `npm run round2:preflight` and require 0 token-budget failures.
3. Run the browser WebLLM round with cache state recorded as
   `warm_from_previous`, `cold_cleared`, or `ambiguous`.
4. Retry each runtime error at most once with the compact prompt mode.
5. Import the browser export.
6. Treat contract fail findings as blockers, not as qualitative caveats.
