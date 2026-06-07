# Retrieval Sufficiency v0

Generated: 2026-06-07T02:30:31.010Z

This report evaluates whether deterministic retrieval plus evidence-packet
variants preserve seeded gold evidence and required fields before any model
generation. Labels are marked `seed_auto_needs_human_review`; use this as a
method scaffold, not as final paper evidence.

| Variant | Runs | Sufficiency | Evidence coverage | Required fields | Refusal gate | Empty retrieval check | Avg tokens est. | Avg retrieval ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| top1_compressed_topology_source_rights | 30 | 0.633 | 0.633 | 0.933 | 1 | 0.933 | 289 | 0.759 |
| top3_compressed_topology_source_rights | 30 | 0.767 | 0.767 | 0.933 | 1 | 0.933 | 900 | 0.691 |
| top8_compressed_topology_source_rights | 30 | 0.767 | 0.8 | 0.933 | 1 | 0.933 | 2313 | 0.684 |
| top3_raw_topology_source_rights | 30 | 0.767 | 0.767 | 0.933 | 1 | 0.933 | 1047 | 0.7 |
| top3_compressed_no_topology_source_rights | 30 | 0.6 | 0.767 | 0.7 | 1 | 0.933 | 744 | 0.697 |
| top3_compressed_topology_no_source_rights | 30 | 0.367 | 0.767 | 0.333 | 1 | 0.933 | 643 | 0.684 |

## Reading

- Top-k variants should be interpreted against seeded evidence labels.
- Source/rights removal is a negative control because it cannot satisfy
  source/rights queries even if it reduces prompt size.
- First/earliest and rights-upgrade claims are deliberately marked
  refusal-expected until human review exists. They may still retrieve related
  records; the benchmark treats this as a generation gate, not an empty-search
  requirement.
- Method/process questions currently lack method-context fixture records; this
  is an intentional gap to fill before research-mode claims.
