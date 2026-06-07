# Retrieval Sufficiency v0

Generated: 2026-06-07T03:23:43.544Z

This report evaluates whether deterministic retrieval plus evidence-packet
variants preserve seeded gold evidence and required fields before any model
generation. Labels are marked `seed_auto_needs_human_review`; use this as a
method scaffold, not as final paper evidence.

| Variant | Runs | Sufficiency | Evidence coverage | Required fields | Refusal gate | Empty retrieval check | Avg tokens est. | Avg retrieval ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| top1_compressed_topology_source_rights | 30 | 0.633 | 0.633 | 1 | 1 | 1 | 303 | 0.441 |
| top3_compressed_topology_source_rights | 30 | 0.933 | 0.933 | 1 | 1 | 1 | 844 | 0.346 |
| top8_compressed_topology_source_rights | 30 | 0.933 | 0.933 | 1 | 1 | 1 | 2079 | 0.348 |
| top3_raw_topology_source_rights | 30 | 0.933 | 0.933 | 1 | 1 | 1 | 962 | 0.36 |
| top3_compressed_no_topology_source_rights | 30 | 0.767 | 0.933 | 0.767 | 1 | 1 | 718 | 0.368 |
| top3_compressed_topology_no_source_rights | 30 | 0.467 | 0.933 | 0.533 | 1 | 1 | 523 | 0.358 |

## Reading

- Top-k variants should be interpreted against seeded evidence labels.
- Source/rights removal is a negative control because it cannot satisfy
  source/rights queries even if it reduces prompt size.
- First/earliest and rights-upgrade claims are deliberately marked
  refusal-expected unless the fixture contains chronology proof. The benchmark
  treats this as a generation gate, not an empty-search requirement.
- Method/process questions use the research-only method context fixture record;
  this record is not archive object evidence.
