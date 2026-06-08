# Quality Review Summary Round 03

Generated: 2026-06-08T11:21:29.001Z

Fixture: reports/review_fixture_round_03_quality_sample.jsonl

## Summary

- Sample rows: 50
- Reviewer decision state: pending

## By Selection Reason

| Reason | Count |
|---|---:|
| all_first_earliest_claim | 15 |
| all_no_evidence_refusal | 15 |
| latency_tail_sample | 9 |
| comparison_sample | 5 |
| region_period_sample | 6 |

## By Intent

| Intent | Count |
|---|---:|
| first_earliest_claim | 15 |
| no_evidence_refusal | 15 |
| more_context | 8 |
| comparison | 6 |
| region_period_recommendation | 6 |

## Next Step

Fill reviewer_scores, reviewer_decision, and reviewer_notes in the fixture.
After review, summarize accepted, accepted_with_notes, rejected, and
needs_regeneration rows before making semantic quality claims.
