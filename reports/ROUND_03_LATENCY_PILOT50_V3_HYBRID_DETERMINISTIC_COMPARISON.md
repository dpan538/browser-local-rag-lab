# Round 03 Pilot50 V3 Hybrid Deterministic Comparison

Generated: 2026-06-09

This report compares the Round 03 pilot50 optimization variants. V3 is a hybrid
system intervention: refusal and source/rights lanes are returned by
deterministic runtime logic and reported as `hybrid_system_latency`, not as Qwen
generation latency.

## Gate Status

| Variant | Rows | Contract fails | Contract warnings | Ready |
|---|---:|---:|---:|---|
| Baseline | 50 | 0 | 0 | yes |
| V1 length control | 50 | 0 | 0 | yes |
| V2 evidence compress cooldown | 50 | 0 | 0 | yes |
| V3 hybrid deterministic lanes | 50 | 0 | 0 | yes |

## Runtime Summary

| Variant | All rows avg total ms | Qwen rows | Hybrid rows | Qwen avg TTFT ms | Qwen avg total ms | Qwen P95 total ms | Qwen avg tokens/s | Slow rows >10s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline | 9526.0 | 50 | 0 | 3242.2 | 9526.0 | 13500.0 | 11.51 | 31 |
| V1 length control | 6649.8 | 50 | 0 | 2823.3 | 6649.8 | 15987.7 | 11.78 | 5 |
| V2 evidence compress cooldown | 10502.1 | 50 | 0 | 3113.6 | 10502.1 | 14852.7 | 9.51 | 32 |
| V3 hybrid deterministic lanes | 7378.2 | 36 | 14 | 2550.0 | 10247.5 | 17027.7 | 13.45 | 13 |

## V3 Lane Split

| Lane bucket | Rows | Total ms | Avg ms |
|---|---:|---:|---:|
| Qwen generation | 36 | 368909.9 | 10247.5 |
| Deterministic source/rights | 5 | 0.6 | 0.1 |
| Deterministic refusal | 9 | 0.3 | 0.0 |
| Deterministic combined | 14 | 0.9 | 0.1 |

## Interpretation

- V3 preserves the contract-clean result: 0 fail and 0 warnings.
- V3 reduces all-row average total latency from 9526.0 ms to 7378.2 ms, a
  22.5% hybrid-system improvement for this pilot.
- V3 reduces slow rows from 31 to 13 by removing refusal and source/rights rows
  from model generation.
- V3 must not be described as a pure Qwen speedup. The Qwen-only subset has 36
  rows and should be compared as a model-generation bucket; deterministic rows
  belong to the system-latency bucket.
- The Qwen-only average total latency is 10247.5 ms because the remaining rows
  are the harder explanatory, recommendation, comparison, context, and help
  lanes. This is expected after deterministic lane removal.

## Next Step

The next useful pilot is a V4 combined system: V1 length control for Qwen lanes,
V2-style evidence compression only where prompt pressure is high, and V3
deterministic handling for refusal and source/rights lanes. Success requires
0 contract failures, 0 contract warnings, lower all-row average latency than V3,
and fewer slow rows than V1 without hiding deterministic rows inside Qwen
generation metrics.
