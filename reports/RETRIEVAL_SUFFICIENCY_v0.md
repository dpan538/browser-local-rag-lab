# Retrieval Sufficiency v0

Generated: 2026-06-07T03:10:57.239Z

This report evaluates whether deterministic retrieval plus evidence-packet
variants preserve seeded gold evidence and required fields before any model
generation. Labels are marked `seed_auto_needs_human_review`; use this as a
method scaffold, not as final paper evidence.

| Variant | Runs | Sufficiency | Evidence coverage | Required fields | Refusal gate | Empty retrieval check | Avg tokens est. | Avg retrieval ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| top1_compressed_topology_source_rights | 30 | 0.7 | 0.633 | 1 | 1 | 1 | 336 | 0.705 |
| top3_compressed_topology_source_rights | 30 | 0.833 | 0.767 | 1 | 1 | 1 | 1037 | 0.68 |
| top8_compressed_topology_source_rights | 30 | 0.833 | 0.8 | 1 | 1 | 1 | 2674 | 0.71 |
| top3_raw_topology_source_rights | 30 | 0.833 | 0.767 | 1 | 1 | 1 | 1184 | 0.682 |
| top3_compressed_no_topology_source_rights | 30 | 0.733 | 0.767 | 0.833 | 1 | 1 | 881 | 0.65 |
| top3_compressed_topology_no_source_rights | 30 | 0.433 | 0.767 | 0.5 | 1 | 1 | 643 | 0.64 |

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
