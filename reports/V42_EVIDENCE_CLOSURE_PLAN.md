# V4.2 Evidence Closure Plan

Generated: 2026-06-11

## Purpose

V4.2 is not a model-optimization round. It is a paper-hardening round that
turns the existing V3.3/V4.1 results into a more rigorous evidence package for
review.

The system components remain frozen:

- deterministic refusal and source/rights lanes
- V3.3 post-generation prose polisher
- deterministic evidence-tag injection
- evidence-field contract validation

## Questions V4.2 Answers

1. Do adversarial first/earliest queries without chronology proof reliably
   refuse?
2. Do contradictory date evidence probes expose both dates without choosing one
   as definitive?
3. Is the V3.3 latency improvement over V3.2 statistically stable under
   paired bootstrap resampling?
4. What confidence intervals should be reported for zero observed failures and
   quality-screen rates?
5. What is the human-review protocol for checking that contract-valid answers
   remain useful prose?

## Planned Outputs

| Output | Script | Purpose |
|---|---|---|
| `STATISTICAL_EVIDENCE_V42.md` | `scripts/statistical_evidence_v42.mjs` | Bootstrap latency CI and Wilson proportion CIs. |
| `V42_ROBUSTNESS_EVAL.md` | `scripts/evaluate_v42_robustness.mjs` | Robustness miniset gate for first/earliest and contradictory-date probes. |
| `V42_HUMAN_REVIEW_RUBRIC.md` | `scripts/build_v42_human_review_fixture.mjs` | Stratified 50-row human review fixture and rubric. |

## Experiment Sequence

1. Build or refresh the V4.1 robustness miniset.
2. Export model-agnostic packets for that miniset.
3. Generate raw model outputs with SmolLM2-360M for the non-deterministic
   contradictory-date rows.
4. Finalize answers through the same V4.1/V3.3 post-processing layer.
5. Run contract validation and robustness-specific checks.
6. Generate statistical evidence from existing V3.2 and V3.3 300-query logs.
7. Generate the 50-row human review fixture.

## Success Criteria

- Robustness miniset contract fail/warn: 0/0
- Adversarial first/earliest refusal rows: 10/10 exact refusal
- Contradictory date rows: 5/5 expose both `1830` and `1890` in evidence tags
- Contradictory date answer bodies do not select one date as definitive
- Bootstrap CI confirms V3.3 reduces model-row mean latency vs V3.2
- Human review fixture contains 50 stratified rows and a stable rubric

## Expected Interpretation

If V4.2 passes, the paper can claim that the final system is not merely
contract-clean on the main benchmark, but also robust to two targeted edge
classes: unsupported chronology requests and contradictory metadata. The
statistical report supplies confidence intervals for the latency and quality
claims, while the review fixture documents how automated gates can be backed by
human semantic review.

