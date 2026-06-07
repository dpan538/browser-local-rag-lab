# Quality Review Sheet Round 02

Generated: 2026-06-07T06:58:51.750Z

Answers: reports/webllm_round_02_answers.jsonl

This sheet is a reviewer aid. It does not turn generated answers into archive
evidence. It checks which required evidence values are visibly present in the
Round 02 answer text and records contract findings for human adjudication.

## Summary

- Rows: 30
- hard_fail_reject: 0
- needs_human_review: 30
- needs_field_visibility_review: 0
- reviewed_candidate: 0

## Rows Requiring Attention

| Query | Intent | Refusal | Suggested decision | Field status | Contract findings |
|---|---|---|---|---|---|
| BQ05 | current_object_explanation | no | needs_human_review | title:MISSING_OR_IMPLICIT; region:MISSING_OR_IMPLICIT; source:MISSING_OR_IMPLICIT | warn:G101_required_field_value_not_observed:title; warn:G101_required_field_value_not_observed:region; warn:G101_required_field_value_not_observed:source |
| BQ14 | region_period_recommendation | no | needs_human_review | date_text:MISSING_OR_IMPLICIT; region:MISSING_OR_IMPLICIT; source:MISSING_OR_IMPLICIT | warn:G101_required_field_value_not_observed:date_text; warn:G101_required_field_value_not_observed:region; warn:G101_required_field_value_not_observed:source |
| BQ25 | more_context | no | needs_human_review | source:MISSING_OR_IMPLICIT | warn:G101_required_field_value_not_observed:source |
| BQ26 | more_context | no | needs_human_review | source:MISSING_OR_IMPLICIT | warn:G101_required_field_value_not_observed:source |

## Reviewer Protocol

1. Hard failures are automatic rejects.
2. Refusal-expected answers must not provide factual claims beyond the
   insufficient-evidence statement.
3. Required fields may be accepted only if the answer visibly carries the
   evidence value or the reviewer records why implicit wording is sufficient.
4. A row becomes paper-usable only after `reviewer_decision` is filled in a
   reviewed answer fixture.
