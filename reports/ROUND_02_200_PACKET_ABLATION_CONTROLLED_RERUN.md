# Round 02 200 Packet Ablation Controlled Rerun

Generated: 2026-06-08

This report records the in-app-browser WebLLM controlled-condition rerun for
the 200-query Round 02 expansion set. It compares three contract-safe packet
variants for `Qwen3.5-0.8B-q4f16_1-MLC`:

- `gold_only_contract_source_rights`
- `top3_compressed_topology_source_rights`
- `top8_gold_contract_source_rights`

All runs are research-only browser-local runtime measurements. Generated
answers are experiment outputs only and are not archive evidence.

## Gate Summary

| Variant | Scope | Completed | Runtime Errors | Contract Fail | Contract Warn | Gate Fail | Gate Warn | Anomaly Fail | Anomaly Warn |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| gold-only | pilot50 | 50/50 | 0 | 0 | 0 | 0 | 8 | not run full-scope | not run full-scope |
| gold-only | full200 | 200/200 | 0 | 0 | 0 | 0 | 8 | 0 | 8 |
| top8 | pilot50 | 50/50 | 0 | 0 | 0 | 0 | 9 | 0 | 9 |
| top8 | full200 | 200/200 | 0 | 0 | 0 | 0 | 35 | 0 | 35 |

The top8 pilot anomaly scan uses `--only-answered`, because pilot scopes should
not treat the unrun 150 labels as missing-answer failures.

## Performance Comparison

| Variant | Rows | Avg Prompt Tokens | Avg TTFT ms | Avg Total ms | P95 Total ms | Max Total ms | Avg Tokens/s |
|---|---:|---:|---:|---:|---:|---:|---:|
| gold-only | 200 | 458.8 | 1810.2 | 6221.4 | 10476.8 | 12022.7 | 16.71 |
| top3 compressed | 200 | 560.9 | 2284.9 | 7082.4 | 12852.1 | 15190.0 | 16.35 |
| top8 | 200 | 954.8 | 14783.2 | 20779.2 | 44966.1 | 57601.0 | 13.44 |

## Observations

The gold-only packet is the fastest contract-safe configuration in this rerun.
It completed full200 with zero contract failures and zero contract warnings,
while reducing average total latency by about 12% relative to the top3
compressed baseline.

The top8 packet is stable but expensive. It completed full200 with zero runtime
errors and zero contract failures, but average total latency rose to 20.8s and
P95 latency rose to 45.0s. More-context and region-period route queries formed
the slowest tail, with the worst query reaching 57.6s.

The controlled rerun supports a clear paper claim: for browser-local 0.8B RAG,
larger evidence packets can preserve contract faithfulness but may violate
usable-latency targets. Compact, contract-aware packets are not merely a prompt
optimization; they are a runtime feasibility requirement.

## Script Fixes Made During Rerun

- Tightened refusal detection in `scripts/validate_generation_contract.mjs` so
  answerable method responses are not falsely rejected merely for mentioning
  insufficient evidence as a concept. Refusal is now keyed to the canonical hard
  refusal phrase.
- Added `--only-answered` to `scripts/detect_anomalies.mjs` so pilot scopes can
  be anomaly-scanned without treating unrun labels as missing answers.

## Report Artifacts

- `reports/WEBLLM_ROUND_02_200_GOLD_ONLY_IAB_FULL200.md`
- `reports/WEBLLM_ROUND_02_200_GOLD_ONLY_IAB_FULL200_GATE.md`
- `reports/ANOMALY_DETECTION_ROUND_02_200_GOLD_ONLY_IAB_FULL200.md`
- `reports/PERFORMANCE_STRATIFICATION_ROUND_02_200_GOLD_ONLY_IAB_FULL200.md`
- `reports/WEBLLM_ROUND_02_200_TOP8_IAB_PILOT50.md`
- `reports/WEBLLM_ROUND_02_200_TOP8_IAB_PILOT50_GATE.md`
- `reports/ANOMALY_DETECTION_ROUND_02_200_TOP8_IAB_PILOT50.md`
- `reports/WEBLLM_ROUND_02_200_TOP8_IAB_FULL200.md`
- `reports/WEBLLM_ROUND_02_200_TOP8_IAB_FULL200_GATE.md`
- `reports/ANOMALY_DETECTION_ROUND_02_200_TOP8_IAB_FULL200.md`
- `reports/PERFORMANCE_STRATIFICATION_ROUND_02_200_TOP8_IAB_FULL200.md`
