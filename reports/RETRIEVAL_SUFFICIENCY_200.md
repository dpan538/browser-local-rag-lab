# Retrieval Sufficiency v0

Generated: 2026-06-08T05:49:41.352Z

This report evaluates whether deterministic retrieval plus evidence-packet
variants preserve seeded gold evidence and required fields before any model
generation. Labels are marked `seed_auto_needs_human_review`; use this as a
method scaffold, not as final paper evidence.

| Variant | Runs | Sufficiency | Evidence coverage | Required fields | Refusal gate | Empty retrieval check | Avg tokens est. | Avg retrieval ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| top1_compressed_topology_source_rights | 200 | 0.575 | 0.575 | 0.995 | 1 | 1 | 356 | 0.126 |
| top3_compressed_topology_source_rights | 200 | 0.755 | 0.755 | 0.995 | 1 | 1 | 927 | 0.116 |
| top8_compressed_topology_source_rights | 200 | 0.8 | 0.8 | 0.995 | 1 | 1 | 2176 | 0.116 |
| top3_raw_topology_source_rights | 200 | 0.755 | 0.755 | 0.995 | 1 | 1 | 1707 | 0.113 |
| top3_compressed_no_topology_source_rights | 200 | 0.66 | 0.755 | 0.75 | 1 | 1 | 786 | 0.113 |
| top3_compressed_topology_no_source_rights | 200 | 0.33 | 0.755 | 0.4 | 1 | 1 | 589 | 0.111 |

## Reading

- Top-k variants should be interpreted against seeded evidence labels.
- Source/rights removal is a negative control because it cannot satisfy
  source/rights queries even if it reduces prompt size.
- First/earliest and rights-upgrade claims are deliberately marked
  refusal-expected unless the fixture contains chronology proof. The benchmark
  treats this as a generation gate, not an empty-search requirement.
- Method/process questions use the research-only method context fixture record;
  this record is not archive object evidence.
