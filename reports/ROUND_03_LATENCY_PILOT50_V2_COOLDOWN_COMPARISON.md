# Round 03 Latency Pilot50 V2 Cooldown Comparison

Generated: 2026-06-09

This memo records the valid cooldown run of `r03_v2_evidence_compress` on the
fixed Round 03 latency pilot50 set. It compares V2 against the pilot50 baseline
and the valid fresh V1 length-control run.

## Inputs

Baseline:

- `reports/webllm_round_03_latency_pilot50_baseline.json`
- `reports/round03_latency_pilot50_baseline_triage.json`

V1 length control:

- `reports/webllm_round_03_latency_pilot50_v1_length_control_fresh.json`
- `reports/round03_latency_pilot50_v1_length_control_fresh_triage.json`

V2 evidence compress:

- `reports/webllm_round_03_latency_pilot50_v2_evidence_compress_cooldown.json`
- `reports/webllm_round_03_latency_pilot50_v2_evidence_compress_cooldown_gate.json`
- `reports/round03_latency_pilot50_v2_evidence_compress_cooldown_triage.json`

## Gate Result

| Run | Completed | Runtime errors | Contract fails | Contract warnings | Blocking findings | Notes |
|---|---:|---:|---:|---:|---:|---|
| baseline | 50 | 0 | 0 | 0 | 0 | 8 low-speed observations |
| V1 length control fresh | 50 | 0 | 0 | 0 | 0 | 9 low-speed observations |
| V2 evidence compress cooldown | 50 | 0 | 0 | 0 | 0 | 1 low-speed observation, BQ089 |

V2 is reliability-clean. Its only gate finding is observational:

```text
P003_generation_speed_low: BQ089 tokens_per_second=3.04; avg=9.51
```

## Runtime Comparison

| Metric | Baseline | V1 length | V2 compress |
|---|---:|---:|---:|
| Avg TTFT ms | 3242.2 | 2823.3 | 3113.6 |
| P50 TTFT ms | 3919.7 | 2621.3 | 3418.9 |
| P95 TTFT ms | 5264.8 | 6227.5 | 4924.1 |
| Avg total ms | 9526.0 | 6649.8 | 10502.1 |
| P50 total ms | 10837.8 | 7002.2 | 11321.7 |
| P95 total ms | 13500.0 | 15987.7 | 14852.7 |
| Max total ms | 14490.5 | 17315.6 | 16129.5 |
| Avg tokens/s | 11.5 | 11.8 | 9.5 |
| Avg prompt tokens | 771.1 | 596.6 | 633.2 |
| Avg output tokens | 59.5 | 33.0 | 61.7 |
| Slow rows > 10000 ms | 31 | 5 | 32 |
| Low-speed rows | 8 | 9 | 1 |

## Interpretation

V2 compresses evidence as intended:

- average prompt tokens fall from `771.1` to `633.2` (`-17.9%`);
- average TTFT falls from `3242.2 ms` to `3113.6 ms` (`-4.0%`);
- P95 TTFT improves from `5264.8 ms` to `4924.1 ms`.

But V2 does not improve total latency:

- average total latency increases from `9526.0 ms` to `10502.1 ms`;
- P50 total latency increases from `10837.8 ms` to `11321.7 ms`;
- P95 total latency increases from `13500.0 ms` to `14852.7 ms`;
- average output tokens remain essentially unchanged (`59.5 -> 61.7`).

This separates two mechanisms:

- Evidence compression can reduce prompt/TTFT pressure.
- It does not reduce decode work unless paired with output-length control.

## Decision

- Keep V2 as a reliability-clean mechanism, but do not promote it alone as the
  performance solution.
- V1 is currently the stronger single intervention for average and median
  latency because it reduces output length.
- The next valid Round 03 candidate is a combined run: V1 length control plus V2
  evidence compression.
- Source/rights and refusal rows still need a separate hybrid deterministic
  lane test, because neither V1 nor V2 should be described as improving Qwen
  generation ability for those lanes.

## Next Step

Run `r03_v4_combined` on the same pilot50 set after a cool-down or in a fresh
session:

- preserve V2 evidence compression;
- preserve V1 concise answer-body control;
- keep deterministic post-processing of evidence tags;
- optionally add hybrid deterministic source/rights and refusal rows as a
  separate reporting bucket, not as Qwen generation latency.
