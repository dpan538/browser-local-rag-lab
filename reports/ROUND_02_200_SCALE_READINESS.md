# Round 02 200-Query Scale Readiness

Generated: 2026-06-07T07:55:36.791Z

This gate decides whether the current 30-query Round 02 baseline is ready to
be expanded toward a 200-query benchmark. It is intentionally stricter than the
runtime contract: 0 generated-answer failures is necessary but not sufficient.

## Decision

- Scale decision: conditional
- Ready for 200-query expansion: no
- Current labels: 30
- Target labels: 200
- Additional labels needed: 170
- Recommended batch size: 50
- Recommended batches needed: 4
- Unreviewed gold labels: 0
- Open answer review rows: 0

## Blockers

| Blocker |
|---|
| none |

## Soft Blockers

| Code | Evidence id | Percent of labels | Suggested action |
|---|---|---:|---|
| evidence_overuse_soft_block | SURF-GAX1970R001 | 30% | Replace some uses, add new evidence, or attach a written diversity plan before scaling. |

## Round 02 Contract Summary

- Completed rows: 30
- Runtime errors: 0
- Contract failures: 0
- Contract warnings: 8

## Intent Distribution

| Intent | Count | Percent |
|---|---:|---:|
| archive_orientation | 3 | 10% |
| casual_archive_help | 2 | 6.7% |
| current_object_explanation | 3 | 10% |
| source_rights_question | 5 | 16.7% |
| first_earliest_claim | 3 | 10% |
| comparison | 2 | 6.7% |
| region_period_recommendation | 5 | 16.7% |
| method_process_question | 2 | 6.7% |
| more_context | 2 | 6.7% |
| no_evidence_refusal | 3 | 10% |

## Evidence Reuse Top 10

| Evidence id | Count | Percent of labels |
|---|---:|---:|
| SURF-GAX1970R001 | 9 | 30% |
| SURF-COM1970R007 | 4 | 13.3% |
| LAB-METHOD-CONTEXT-V0 | 2 | 6.7% |
| SURF-CRG2026R0071 | 2 | 6.7% |
| SURF-CRG2026R0235 | 2 | 6.7% |
| SURF-CRG2026R0274 | 2 | 6.7% |
| SURF-ER1830R015 | 2 | 6.7% |
| SURF-CGS2026R0030 | 1 | 3.3% |
| SURF-CGS2026R0328 | 1 | 3.3% |
| SURF-CGS2026R0681 | 1 | 3.3% |

## Scale-Up Rule

Do not add 170 labels in one step. Expand in audited batches of up to 50
queries. Each batch must pass label audit, retrieval sufficiency, contract
validation, regression comparison against the prior baseline, and review-state
closure before it becomes part of the benchmark.
