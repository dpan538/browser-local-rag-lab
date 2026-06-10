# Failure Mode Analysis: Why Each Layer Is Necessary

## Purpose

The final system works, but the more important paper argument is that each layer prevents a specific observed failure mode. The ablation evidence below is drawn from existing experiment reports, especially `reports/FAILURE_MODE_ANALYSIS_V33.md`, Round 01, Round 02 200-query runs, and V3.1/V3.2/V3.3 Round 03 runs.

## Layer Removal Ablation

| Removed layer | Expected failure mode | Observed without layer | Observed with final layer |
|---|---|---|---|
| Deterministic refusal lane | Model answers when evidence contract requires refusal | Round 01: 8 `G002_refusal_missing` failures; 2 context-window runtime errors also show prompt-only routing fragility. | V3.3 latency300: deterministic refusal rows complete with contract fail/warn = 0/0. |
| Deterministic source/rights lane | Rights/source labels are missing, interpreted, truncated, or mismatched | Round 01/02: 47 `G005_unverified_field_assertion`, 12 `G006_missing_source_rights_tags`, and 3 `G007_tag_mismatch` findings. | V3.3 latency300: source/rights rows are deterministic hybrid rows; contract fail/warn = 0/0. |
| Post-generation evidence tag injection | Required fields remain implicit, omitted, or copied imprecisely | Round 02 200: 61 contract failures and 146 warnings, including 146 `G101_required_field_value_not_observed` warnings. | V3.3 latency300: contract fail/warn = 0/0 because required tags are exact evidence-derived strings. |
| Post-generation prose polisher | Overconfidence and unsupported first/earliest language leak into delivered prose | V3.1 safe-body 300: 3/191 overconfidence answers. | V3.3 latency300: 0 overconfidence, 0 unwarranted inference; guardrail compliance passed. |
| Prompt-heavy guardrails instead of postprocessing | Prompt-only guardrails preserve quality but inflate latency | V3.2 guarded prose: Qwen average total latency 8499 ms, P95 15307 ms, slow rows over 10 seconds = 63. | V3.3 postprocessed prose: Qwen average total latency 2491 ms, P95 4190 ms, slow rows over 10 seconds = 0; quality gates still pass. |
| Evidence pruning / compact value-only packets | Larger prompts increase TTFT and long-tail latency | Earlier less-pruned variants showed higher generation cost; V3.1 safe-body Qwen average total latency was about 3100 ms and P95 about 7916-8023 ms depending on report path. | V3.3 Qwen average TTFT 1106 ms and Qwen P95 total latency 4190 ms. |

## Interpretation

The ablation pattern shows that the final pipeline is not over-engineered ornamentation. Each layer is linked to a previously observed failure:

- Refusal failures are prevented by deterministic refusal routing.
- Rights/source hallucinations are prevented by deterministic source/rights formatting.
- Field visibility warnings are prevented by evidence tag injection.
- Overconfidence is prevented by the post-generation prose polisher.
- Long-tail latency is reduced by compact packets and by avoiding prompt-heavy guardrails.

This is stronger than a final-score report because it shows how the system fails when a layer is removed. That evidence is what makes the architecture defensible to reviewers.

## Figure To Use With This Section

Use `essay/failure_mode_layer_matrix.png` as the visual companion. It maps each layer to the metric that collapses when that layer is absent.

