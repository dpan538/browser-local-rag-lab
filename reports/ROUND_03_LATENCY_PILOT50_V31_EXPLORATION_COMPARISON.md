# Round 03 Pilot50 V3.1 Exploration Comparison

Generated: 2026-06-09

V3.1 is an exploration inside Round 03, not the start of V4. It keeps the V3
hybrid deterministic split for refusal and source/rights lanes, then optimizes
only the remaining Qwen generation rows by reducing the model's structural
output burden.

## Intervention

V3.1 uses `r03_v31_evidence_prune_tag_injection`.

- Deterministic refusal and source/rights lanes remain short-circuited as
  `hybrid_system_latency`.
- Qwen rows receive a pruned value-only evidence summary with primary evidence
  first.
- The prompt no longer asks Qwen to generate the official evidence tag block.
- The browser lab appends exact evidence tags after generation through the
  existing deterministic postprocess path.

This tests whether latency improves when the model is asked to generate prose
only, while the system owns exact field reproduction.

## Gate Status

| Variant | Rows | Contract fails | Contract warnings | Gate warnings | Ready |
|---|---:|---:|---:|---:|---|
| Baseline | 50 | 0 | 0 | 8 | yes |
| V1 length control | 50 | 0 | 0 | 9 | yes |
| V2 evidence compress cooldown | 50 | 0 | 0 | 1 | yes |
| V3 hybrid deterministic lanes | 50 | 0 | 0 | 3 | yes |
| V3.1 evidence prune + tag injection | 50 | 0 | 0 | 0 | yes |

## Runtime Summary

| Variant | All rows avg total ms | Qwen rows | Hybrid rows | Qwen avg TTFT ms | Qwen P95 TTFT ms | Qwen avg total ms | Qwen P95 total ms | Qwen avg prompt tokens | Qwen avg output tokens | Slow rows >10s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline | 9526.0 | 50 | 0 | 3242.2 | 5264.8 | 9526.0 | 13500.0 | 771.1 | 59.5 | 31 |
| V1 length control | 6649.8 | 50 | 0 | 2823.3 | 6227.5 | 6649.8 | 15987.7 | 596.6 | 33.0 | 5 |
| V2 evidence compress cooldown | 10502.1 | 50 | 0 | 3113.6 | 4924.1 | 10502.1 | 14852.7 | 633.2 | 61.7 | 32 |
| V3 hybrid deterministic lanes | 7378.2 | 36 | 14 | 2550.0 | 5374.8 | 10247.5 | 17027.7 | 541.5 | 95.8 | 13 |
| V3.1 evidence prune + tag injection | 2440.9 | 36 | 14 | 1427.2 | 1931.7 | 3390.1 | 8718.8 | 367.4 | 25.9 | 0 |

## V3 To V3.1 Delta

| Metric | V3 | V3.1 | Change |
|---|---:|---:|---:|
| Qwen avg TTFT ms | 2550.0 | 1427.2 | -44.0% |
| Qwen P95 TTFT ms | 5374.8 | 1931.7 | -64.1% |
| Qwen avg total ms | 10247.5 | 3390.1 | -66.9% |
| Qwen P95 total ms | 17027.7 | 8718.8 | -48.8% |
| Qwen avg prompt tokens | 541.5 | 367.4 | -32.2% |
| Qwen avg output tokens | 95.8 | 25.9 | -73.0% |
| Slow rows >10s | 13 | 0 | -100% |
| Gate warnings | 3 | 0 | -100% |

## Interpretation

- V3.1 confirms that a large part of the latency tail came from asking the
  0.8B model to do two jobs at once: write prose and reproduce structured
  evidence tags.
- Moving exact tag reproduction to deterministic postprocessing preserves
  contract reliability and sharply reduces output tokens.
- Value-only, primary-first evidence summaries reduce prompt pressure without
  changing the gold evidence or retrieval packet.
- The result is still a hybrid system result, not a pure model capability
  claim. Qwen generation latency is reported only on the 36 non-deterministic
  rows.

## Next Decision

V3.1 should become the preferred Round 03 optimization candidate for a larger
confirmation run. It is stronger than V1, V2, and V3 on this pilot while keeping
the same 0-fail contract status. V4 should wait until V3.1 is confirmed on a
larger slice or the full 300-query set, because V3.1 may already contain the
main useful mechanism: system-owned structure plus model-owned prose.
