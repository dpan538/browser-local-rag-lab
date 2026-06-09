# Round 03 V2 Evidence Compress Thermal Partial Note

Generated: 2026-06-09

`r03_v2_evidence_compress` was started after several continuous WebLLM runs in
the same browser/device session:

1. latency pilot50 baseline;
2. an invalid cache-confounded V1 attempt;
3. fresh V1 length-control pilot50.

The V2 run was stopped after 8 completed rows because the early measurements
were clearly thermal/order-confounded and should not be treated as a valid V2
pilot. The partial export is retained only as an audit trail:

- `reports/webllm_round_03_latency_pilot50_v2_evidence_compress_thermal_partial_browser_export.json`
- `reports/webllm_round_03_latency_pilot50_v2_evidence_compress_thermal_partial.json`
- `reports/webllm_round_03_latency_pilot50_v2_evidence_compress_thermal_partial_answers.jsonl`
- `reports/WEBLLM_ROUND_03_LATENCY_PILOT50_V2_EVIDENCE_COMPRESS_THERMAL_PARTIAL.md`

Partial result:

- Completed rows: 8
- Runtime errors: 0
- Metric issues: 0
- Contract failures: 0
- Contract warnings: 0

Decision:

- Do not use this partial V2 run for optimization claims.
- Re-run V2 after a cool-down or in a counterbalanced order.
- Preferred next measurement design: run V2 first in a fresh session, then run
  baseline or V1 on a matched subset, or use interleaved query blocks to reduce
  thermal/order bias.
