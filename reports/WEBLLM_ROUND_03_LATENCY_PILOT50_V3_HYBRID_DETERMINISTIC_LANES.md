# WEBLLM ROUND 03 LATENCY PILOT50 V3 HYBRID DETERMINISTIC LANES

Generated: 2026-06-09T13:43:23.146Z

## Scope

This report imports a browser-exported WebLLM custom-model run for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/webllm_round_03_latency_pilot50_v3_hybrid_deterministic_lanes.json
- Generated answer JSONL: reports/webllm_round_03_latency_pilot50_v3_hybrid_deterministic_lanes_answers.jsonl
- Variant: top3_gold_contract_source_rights
- Model id: Qwen3.5-0.8B-q4f16_1-MLC
- WebGPU status: available

## Runtime Summary

- Result rows: 50
- Completed rows: 50
- Error rows: 0
- Deterministic hybrid rows: 14
- Qwen model-generation rows: 36
- Qwen average TTFT: 2550.0 ms
- Qwen average total latency: 10247.5 ms
- Qwen average tokens/s: 13.45
- Qwen average prompt tokens estimate: 541.5
- Hybrid deterministic average total latency: 0.064 ms
- All-row average total latency: 7378.2 ms
- Metric validity issues: 0

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
| none | none | none | none | none |

## Status Counts

| Status | Count |
|---|---:|
| completed | 50 |

## Contract Gate

- Answers checked: 50
- Expected labels: 50
- Fail findings: 0
- Warning findings: 0

| Severity | Query | Code | Field | Detail |
|---|---|---|---|---|
| none | none | none | none | none |

## Runtime Errors

| Query | Status | Error |
|---|---|---|
| none | none | none |

## Interpretation

- A paper-quality round requires all 30 seed queries to complete or an explicit
  failure-analysis table for device/runtime failures.
- Contract failures block generated-answer quality claims.
- Contract warnings can still be useful for prompt and evidence-packet tuning,
  but they should not be reported as faithful answers without review.
