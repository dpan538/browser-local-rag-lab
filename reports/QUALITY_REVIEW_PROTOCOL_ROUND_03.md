# Quality Review Protocol Round 03

Generated: 2026-06-08T11:21:29.001Z

Fixture: reports/review_fixture_round_03_quality_sample.jsonl

This protocol reviews generated experiment outputs only. It does not convert AI
answers into archive evidence.

## Sample Scope

- Target rows: 50
- Sample rows: 50
- Source answers: reports/webllm_round_02_200_gold_only_iab_full200_answers.jsonl

## Reviewer Scores

Use 0, 1, or 2 for each score:

- 0 = fails the criterion
- 1 = acceptable with notes
- 2 = clearly satisfies the criterion

Score fields:

- faithfulness
- no_invented_title_date_source_rights
- refusal_correctness
- useful_research_guidance
- not_merely_repeating_search
- lane_appropriateness

## Hard Rules

- If refusal_expected is true and the answer provides unsupported facts, reject.
- If an answer invents title, date, source, rights, reuse permission, or public
  domain status, reject.
- If the answer is contract-compliant but not useful, use accept_with_notes or
  needs_regeneration rather than changing the label.

## Allowed Decisions

- accept
- accept_with_notes
- reject
- needs_regeneration
- pending
