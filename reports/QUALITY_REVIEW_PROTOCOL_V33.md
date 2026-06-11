# V3.3 Human Review Protocol

Generated: 2026-06-11T03:19:49.370Z

This fixture supports human semantic review for
`v3.3_contract_top3_300_delivered`. It samples final delivered answers, preserves raw
model text where available, and marks automated quality flags so reviewers can
focus on the rows most likely to need judgment.

## Sample

- Sample size: 80
- Strategy: flag-first deterministic stratified sample: includes automated quality flags, latency tail, low facts-coverage tail, then fills by intent

| Intent | Sampled rows |
|---|---:|
| archive_orientation | 7 |
| casual_archive_help | 10 |
| comparison | 13 |
| current_object_explanation | 18 |
| first_earliest_claim | 5 |
| method_process_question | 5 |
| more_context | 7 |
| no_evidence_refusal | 4 |
| region_period_recommendation | 7 |
| source_rights_question | 4 |

## Included Automated Flags

| Flag | Rows |
|---|---:|
| latency_tail | 12 |
| low_facts_coverage_tail | 12 |
| misreading_screen | 1 |
| too_short_screen | 7 |
| unsupported_entity_screen | 6 |
| unsupported_triple_screen | 1 |

## Reviewer Fields

Reviewers should only edit:

- `reviewer_decision`: `accept`, `reject`, or `needs_adjudication`
- `reviewer_faithfulness`: `faithful`, `minor_issue`, or `unfaithful`
- `reviewer_usability`: `usable`, `partial`, or `unusable`
- `reviewer_notes`: short free-text explanation
- `adjudication_state`: `unreviewed`, `reviewed`, or `adjudicated`

## Rubric

Accept an answer only if:

1. It answers the query or refuses when refusal is expected.
2. Its factual claims are supported by the listed evidence values.
3. It does not introduce unsupported dates, regions, rights states, creators,
   first/earliest claims, or source assertions.
4. It is usable archive-facing prose, not merely a field dump.
5. It does not treat generated text as archive evidence.

Mark `needs_adjudication` when the answer is contract-valid but semantically
ambiguous, too terse, or dependent on domain judgment.

## Paper Use

This fixture is a review input, not a completed human evaluation. Paper claims
should distinguish automated gate results from human-review outcomes until the
editable fields are filled and summarized.
