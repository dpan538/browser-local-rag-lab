# V4.2 Statistical Evidence

Generated: 2026-06-11T02:49:35.345Z

This report provides paper-facing confidence intervals for the final V3.3
claim. It does not modify model outputs or benchmark labels.

## Paired Latency Bootstrap

Comparison: V3.2 guarded prose prompt vs V3.3 postprocessed prose.

- Paired model-generation rows: 191
- V3.2 mean model-row total latency: 8499.0 ms
- V3.3 mean model-row total latency: 2490.8 ms
- Mean reduction: 6008.1 ms
- Mean reduction 95% bootstrap CI: 5403.8 ms - 6602.6 ms
- Mean relative reduction: 61.05%
- Mean relative reduction 95% bootstrap CI: 57.07% - 64.56%
- V3.2 P95 model-row total latency: 15250.6 ms
- V3.3 P95 model-row total latency: 4020.4 ms

## Proportion Intervals

Wilson 95% confidence intervals are reported for failure and quality-screen
rates. Zero observed failures should be read as zero observed failures in this
benchmark, not as a universal zero-risk guarantee.

| Metric | Count | Rate | Wilson 95% CI |
|---|---:|---:|---:|
| contract_failure | 0/300 | 0.00% | 0.00% - 1.26% |
| contract_warning | 0/300 | 0.00% | 0.00% - 1.26% |
| unsupported_date | 0/191 | 0.00% | 0.00% - 1.97% |
| unsupported_triple_answer | 1/191 | 0.52% | 0.09% - 2.91% |
| unsupported_entity_answer | 6/191 | 3.14% | 1.45% - 6.68% |
| prompt_leak | 0/191 | 0.00% | 0.00% - 1.97% |
| overconfidence_answer | 0/191 | 0.00% | 0.00% - 1.97% |
| unwarranted_inference_answer | 0/191 | 0.00% | 0.00% - 1.97% |
| absolute_guardrail_violation | 0/191 | 0.00% | 0.00% - 1.97% |
| first_claim_violation | 0/191 | 0.00% | 0.00% - 1.97% |
| too_short_answer | 7/191 | 3.66% | 1.79% - 7.37% |
| off_topic_answer | 0/191 | 0.00% | 0.00% - 1.97% |
