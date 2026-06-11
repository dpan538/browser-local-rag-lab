# V3.3 Blind Semantic Review Instructions

Use these files:

- Reviewer A: `reports/human_review/v33_reviewer_a_blind_fixture.json`
- Reviewer B: `reports/human_review/v33_reviewer_b_blind_fixture.json`

Each file contains the same 80 review rows with technical metadata removed.
Reviewers should edit only:

- `reviewer_decision`
- `reviewer_faithfulness`
- `reviewer_usability`
- `reviewer_notes`

## Allowed Values

`reviewer_decision`:

- `accept`
- `reject`
- `needs_adjudication`

`reviewer_faithfulness`:

- `faithful`
- `minor_issue`
- `unfaithful`

`reviewer_usability`:

- `usable`
- `partial`
- `unusable`

`reviewer_notes`:

- short free-text note, especially for `reject`, `minor_issue`,
  `unfaithful`, `partial`, `unusable`, or `needs_adjudication`

## Review Rule

Accept an answer only if:

1. It answers the query or refuses when refusal is expected.
2. Its factual claims are supported by the listed evidence values.
3. It does not introduce unsupported dates, regions, rights states, creators,
   first/earliest claims, or source assertions.
4. It is usable as archive-facing prose, not merely a field dump.

Mark `needs_adjudication` when the answer is contract-valid but semantically
ambiguous, too vague, too terse, or dependent on domain judgment.

## Blinding

The blind files omit model internals, automated screening outputs, row-selection
cues, raw model text, post-processing actions, timing, and variant labels.
