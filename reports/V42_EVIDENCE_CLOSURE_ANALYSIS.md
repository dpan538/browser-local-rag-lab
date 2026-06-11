# V4.2 Evidence Closure Analysis

Generated: 2026-06-11

## Purpose

V4.2 closes paper-facing evidence gaps without changing the system. It freezes
the V3.3/V4.1 architecture and adds:

- statistical confidence intervals for latency and quality rates;
- a targeted robustness miniset for unsupported chronology and contradictory
  date evidence;
- a 50-row stratified human-review fixture and rubric.

## Statistical Evidence

The paired bootstrap compares V3.2 guarded-prompt generation against V3.3
postprocessed prose on the same 191 model-generation rows.

| Metric | Result |
|---|---:|
| Paired rows | 191 |
| V3.2 mean model-row total latency | 8499.0 ms |
| V3.3 mean model-row total latency | 2490.8 ms |
| Mean reduction | 6008.1 ms |
| Mean reduction 95% bootstrap CI | 5403.8 - 6602.6 ms |
| Mean relative reduction | 61.05% |
| Mean relative reduction 95% bootstrap CI | 57.07% - 64.56% |
| V3.2 P95 model-row total latency | 15250.6 ms |
| V3.3 P95 model-row total latency | 4020.4 ms |

Wilson intervals for final V3.3 proportions give paper-safe uncertainty
bounds. Zero observed contract failures should be stated as zero observed
failures in this benchmark, not as universal impossibility.

Key intervals:

- Contract failure: 0/300, Wilson 95% CI upper bound 1.26%
- Contract warning: 0/300, Wilson 95% CI upper bound 1.26%
- Unsupported date: 0/191, Wilson 95% CI upper bound 1.97%
- Prompt leak: 0/191, Wilson 95% CI upper bound 1.97%
- Overconfidence: 0/191, Wilson 95% CI upper bound 1.97%
- First-claim violation: 0/191, Wilson 95% CI upper bound 1.97%
- Unsupported entity answer: 6/191, 3.14%, Wilson 95% CI 1.45% - 6.68%
- Too-short answer screen: 7/191, 3.66%, Wilson 95% CI 1.79% - 7.37%

The too-short screen remains below the predeclared 5% gate but should not be
reported as zero. It is a bounded residual quality-screen signal for human
review.

## Robustness Miniset

The robustness miniset contains 15 rows:

- 10 adversarial first/earliest queries without chronology proof;
- 5 contradictory-date evidence queries with paired `1830` and `1890` record
  variants.

Execution result:

| Metric | Result |
|---|---:|
| Rows | 15 |
| Completed | 15 |
| Runtime errors | 0 |
| Contract fail / warn | 0 / 0 |
| Deterministic refusal rows | 10 |
| SmolLM2-360M model rows | 5 |
| Robustness-specific failed rows | 0 |

Interpretation:

- The unsupported first/earliest probes were handled by deterministic refusal.
- Contradictory-date probes exposed both dates in evidence tags.
- Contradictory-date answer bodies did not choose one date as definitive.

This directly addresses the likely reviewer question: unsupported chronology
does not force the small model to decide, and contradictory evidence is
surfaced rather than collapsed into a single unsupported date.

## Human Review Fixture

V4.2 generated a 50-row deterministic stratified review fixture:

- 5 rows from each of 10 intents;
- original query and final generated answer;
- answer body separated from injected evidence tags;
- required fields and evidence values;
- editable reviewer fields for decision, faithfulness, usability, and notes.

This fixture is not a completed human evaluation. It is the paper-ready review
protocol and data artifact needed for two-reviewer semantic assessment.

Recommended paper wording:

> We supplement automated gates with a stratified 50-answer review fixture. The
> fixture records query, intent, evidence values, final answer, and reviewer
> fields for faithfulness and usability. Human labels were not used to tune the
> system after V3.3; they are intended as confirmatory semantic review.

## Impact On Paper Claims

V4.2 strengthens the final paper in three ways:

1. The V3.3 latency improvement is now supported by paired bootstrap CIs rather
   than only mean differences.
2. The zero-failure claim is bounded with Wilson confidence intervals, avoiding
   the overclaim that zero observed failures implies zero risk.
3. The robustness miniset shows the architecture handles unsupported chronology
   and contradictory metadata without changing the main system.

## Files

- `reports/STATISTICAL_EVIDENCE_V42.md`
- `reports/statistical_evidence_v42.json`
- `reports/V42_ROBUSTNESS_SMOLLM2_360M.md`
- `reports/V42_ROBUSTNESS_EVAL.md`
- `reports/v42_robustness_eval.json`
- `reports/V42_HUMAN_REVIEW_RUBRIC.md`
- `reports/v42_human_review_fixture.json`

