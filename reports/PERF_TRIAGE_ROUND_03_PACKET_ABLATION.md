# Performance Triage Round 03 Packet Ablation

Generated: 2026-06-08T11:20:43.014Z

This report triages the latency tail from the Round 02 200-query packet
ablation. It is a post-run analysis only and does not change prompts, labels,
or model outputs.

## Variant Summary

| Variant | Rows | Avg prompt tokens | Avg TTFT ms | Avg total ms | Avg tokens/s | P003 |
|---|---:|---:|---:|---:|---:|---:|
| gold-only | 200 | 458.8 | 1810.2 | 6221.4 | 16.71 | 8 |
| top3 compressed | 200 | 560.9 | 2284.9 | 7082.4 | 16.35 | 25 |
| top8 | 200 | 954.8 | 14783.2 | 20779.2 | 13.44 | 35 |

## Intent-Level Tail

| Intent | N | Median top8 total ms | Median gold-only total ms | Median top8/gold |
|---|---:|---:|---:|---:|
| more_context | 18 | 44996.1 | 10657.2 | 4.66x |
| region_period_recommendation | 24 | 33825.9 | 8910.6 | 3.69x |
| current_object_explanation | 28 | 30929.1 | 7485 | 4.25x |
| casual_archive_help | 16 | 20196.5 | 3798.5 | 4.75x |
| comparison | 28 | 18371 | 8193.7 | 2.37x |
| source_rights_question | 24 | 16063.4 | 6421.5 | 2.32x |
| archive_orientation | 16 | 15860.5 | 5021.3 | 2.97x |
| method_process_question | 16 | 11809.8 | 6045.8 | 2.02x |
| no_evidence_refusal | 15 | 1968.4 | 868.5 | 2.22x |
| first_earliest_claim | 15 | 1927.9 | 872.5 | 2.21x |

## Slow Query Optimization List

Threshold: 15000 ms

| Query | Intent | Top8 prompt tokens | Top8 total ms | Gold-only total ms | Top8/gold | Suggested optimization |
|---|---|---:|---:|---:|---:|---|
| BQ174 | more_context | 2785 | 57601 | 11476.4 | 5.02x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ173 | more_context | 2736 | 56175.4 | 11399 | 4.93x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ167 | more_context | 2730 | 55863.1 | 11527.2 | 4.85x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ172 | more_context | 2691 | 55747.5 | 10476.8 | 5.32x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ166 | more_context | 2730 | 49822.8 | 11366 | 4.38x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ07 | current_object_explanation | 1724 | 47722.6 | 6432 | 7.42x | Prefer gold-only or top3; top8 adds latency without a contract benefit. |
| BQ169 | more_context | 2396 | 47005.4 | 10933.8 | 4.3x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ176 | more_context | 2103 | 46301.2 | 12022.7 | 3.85x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ175 | more_context | 2057 | 45635.3 | 10837.5 | 4.21x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ26 | more_context | 2901 | 45026.1 | 11410.2 | 3.95x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ25 | more_context | 2901 | 44966.1 | 11374.7 | 3.95x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ171 | more_context | 2278 | 44852.5 | 9699.2 | 4.62x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ170 | more_context | 2233 | 44524.7 | 9464.3 | 4.7x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ165 | more_context | 2715 | 43742.5 | 9267.4 | 4.72x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ168 | more_context | 2212 | 43329.1 | 9782.9 | 4.43x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ16 | region_period_recommendation | 2482 | 42943.3 | 9786 | 4.39x | Use route-specific top3 records and suppress extra topology spillover. |
| BQ163 | more_context | 2687 | 42591.6 | 7701.7 | 5.53x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ162 | more_context | 2585 | 41809 | 7973 | 5.24x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ164 | more_context | 2547 | 41226 | 7683.9 | 5.37x | Use adaptive top3 or a precompressed context skeleton; avoid default top8. |
| BQ080 | current_object_explanation | 1636 | 40053.6 | 8865.9 | 4.52x | Prefer gold-only or top3; top8 adds latency without a contract benefit. |

## Interpretation

- Top8 is contract-stable but creates a large latency tail.
- The slowest rows concentrate in more-context and region-period lanes.
- Gold-only remains the fastest contract-safe baseline.
- The next packet candidate should be adaptive: keep strict source-rights and
  hard-refusal lanes, but cap context-heavy lanes at top3 or a route-specific
  summary.
