# V3.3 Failure Mode And Layer Necessity Analysis

Generated: 2026-06-10T06:47:22.474Z

This report organizes existing experiment evidence into a layer-removal
ablation table. It is intended for the paper's failure-mode analysis section:
the point is not only that the final system works, but that each layer prevents
a previously observed failure class.

## Summary

- Rows: 6
- Purpose: Show why each reliability/latency layer is necessary rather than decorative.

## Layer Removal Table

| Removed layer | Expected failure mode | Observed without layer | Observed with final layer |
|---|---|---|---|
| deterministic refusal lane | model answers when evidence contract requires refusal | Round 01: 8 G002 refusal failures; 2 context-window runtime errors also show prompt-only routing fragility. | V3.3 latency300: deterministic refusal rows complete with contract fail/warn = 0/0. |
| deterministic source/rights lane | rights/source labels missing, truncated, interpreted, or mismatched | Round 01/02: 47 G005 unverified field assertions, 12 G006 missing source-rights tags, and 3 G007 tag mismatches. | V3.3 latency300: source/rights rows are deterministic hybrid rows; contract fail/warn = 0/0. |
| post-generation evidence tag injection | required fields are implicit, omitted, or copied imprecisely | Round 02 200: 61 contract failures and 146 warnings; 146 G101 required-field visibility warnings. | V3.3 latency300: contract fail/warn = 0/0 because required tags are exact evidence-derived strings. |
| post-generation prose polisher | overconfidence and unsupported first/earliest language leak into delivered prose | V3.1 safe-body 300: 3/191 overconfidence answers. | V3.3 latency300: 0 overconfidence, 0 unwarranted inference; guardrail compliance pass. |
| prompt-heavy guardrails | prompt-only guardrails preserve quality but inflate latency | V3.2 guarded prose: Qwen avg total 8499 ms, P95 15307 ms, slow >10s 63. | V3.3 postprocessed prose: Qwen avg total 2491 ms, P95 4190 ms, slow >10s 0; quality gates still pass. |
| evidence pruning / compact value-only packets | larger prompts increase TTFT and long-tail latency | Earlier less-pruned variants show higher generation cost; V3.1 safe body Qwen avg total 3100 ms and P95 7916 ms. | V3.3 Qwen avg TTFT is reported separately in latency300 output and Qwen P95 total is 4190 ms. |

## Notes For Paper

- Treat deterministic-lane latency and model-generation latency separately.
- The source/rights and refusal rows demonstrate system reliability, not Qwen
  generation skill.
- The V3.2 to V3.3 comparison is the clearest evidence that prompt-heavy
  guardrails are not the only way to obtain cautious prose.
