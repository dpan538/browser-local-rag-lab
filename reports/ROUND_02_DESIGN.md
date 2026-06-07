# Round 02 Design

Generated: 2026-06-07T06:38:37.862Z

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
- Prompt-audit failures: 0
- Max estimated prompt tokens: 1215
- Average estimated prompt tokens: 417.9
- Round 01 retry rows: BQ11, BQ22

| Query | Intent | Prompt mode | Est. tokens | Budget | Prompt audit | Round 01 retry |
|---|---|---|---:|---|---|---|
| BQ01 | archive_orientation | orientation_structure_summary | 321 | pass | pass | no |
| BQ02 | archive_orientation | orientation_structure_summary | 350 | pass | pass | no |
| BQ03 | archive_orientation | orientation_structure_summary | 352 | pass | pass | no |
| BQ04 | casual_archive_help | orientation_structure_summary | 294 | pass | pass | no |
| BQ05 | current_object_explanation | compact_required_field_summary | 686 | pass | pass | no |
| BQ06 | current_object_explanation | compact_required_field_summary | 631 | pass | pass | no |
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

## Round 02 Run Protocol

1. Implement the Round 02 prompt modes in the browser runner.
2. Run `npm run round2:preflight` and require 0 token-budget failures.
3. Run the browser WebLLM round with cache state recorded as
   `warm_from_previous`, `cold_cleared`, or `ambiguous`.
4. Retry each runtime error at most once with the compact prompt mode.
5. Import the browser export.
6. Treat contract fail findings as blockers, not as qualitative caveats.
