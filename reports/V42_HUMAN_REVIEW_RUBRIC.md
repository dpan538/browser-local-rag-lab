# V4.2 Human Review Rubric

Generated: 2026-06-11T01:59:15.132Z

This fixture supports a lightweight human review of the final V3.3 300-query
answer set. It does not change labels, evidence, or generated answers.

## Sample

- Sample size: 50
- Strategy: deterministic stratified sample by intent, with at least one row per intent when available

| Intent | Sampled rows |
|---|---:|
| archive_orientation | 5 |
| casual_archive_help | 5 |
| comparison | 5 |
| current_object_explanation | 5 |
| first_earliest_claim | 5 |
| method_process_question | 5 |
| more_context | 5 |
| no_evidence_refusal | 5 |
| region_period_recommendation | 5 |
| source_rights_question | 5 |

## Reviewer Fields

Reviewers should only edit:

- `reviewer_decision`: `accept`, `reject`, or `needs_adjudication`
- `reviewer_faithfulness`: `faithful`, `minor_issue`, or `unfaithful`
- `reviewer_usability`: `usable`, `partial`, or `unusable`
- `reviewer_notes`: short free-text explanation

## Rubric

Accept an answer only if:

1. It answers the query or refuses when refusal is expected.
2. Its factual claims are supported by the listed evidence values.
3. It does not introduce unsupported dates, regions, rights states, creators,
   first/earliest claims, or source assertions.
4. It is usable as archive-facing prose, not merely a field dump.

Mark `needs_adjudication` when the answer is contract-valid but semantically
ambiguous, too vague, or dependent on domain judgment.

## Inter-Rater Plan

For a paper-ready review, two reviewers should independently fill the fixture.
Agreement can be reported as percent agreement and, if both reviewers use the
same categorical labels, Cohen's kappa.
