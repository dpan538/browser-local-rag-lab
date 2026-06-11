# Raw vs Delivered V3.3

Generated: 2026-06-11T02:49:35.065Z

This report separates raw model text from delivered answer text for
`v3.3_contract_top3_300_delivered`. It exists to prevent paper claims from
mistaking system-level reliability for raw Qwen generation behavior.

## Summary

| Metric | Value |
|---|---:|
| Rows | 300 |
| Completed rows | 300 |
| Deterministic hybrid rows | 109 |
| Qwen model-generation rows | 191 |
| Raw model rows with evidence tags | 0 |
| Delivered model rows with evidence tags | 191 |
| Raw body differs from stored model body | 0 |
| Delivered bodies changed from model body by finalizer/postprocess | 76 |
| Qwen average TTFT | 1105.8 ms |
| Qwen average total latency | 2490.8 ms |
| Deterministic average total latency | 0.015 ms |
| All-row average total latency | 1585.8 ms |

## Deterministic Lane Counts

| Lane | Rows |
|---|---:|
| refusal | 73 |
| source_rights | 36 |

## Postprocess Action Counts

| Action | Rows |
|---|---:|
| fallback_readability_body | 12 |
| fallback_too_short_body | 1 |
| insert_hedge | 18 |
| none | 146 |
| soften_the_earliest | 2 |
| soften_the_first | 2 |
| split_long_sentence | 8 |
| split_long_sentence_finalizer | 3 |

## Interpretation

- Raw Qwen model rows are evaluated separately from delivered answers.
- Delivered answers include deterministic evidence tags, deterministic lanes,
  and prose polishing where applicable.
- Contract-compliance claims should be phrased as delivered-answer system
  claims, not raw model claims.
