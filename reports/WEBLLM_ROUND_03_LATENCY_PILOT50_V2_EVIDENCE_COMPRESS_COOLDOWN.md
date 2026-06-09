# WEBLLM ROUND 03 LATENCY PILOT50 V2 EVIDENCE COMPRESS COOLDOWN

Generated: 2026-06-09T11:55:23.758Z

## Scope

This report imports a browser-exported WebLLM custom-model run for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/webllm_round_03_latency_pilot50_v2_evidence_compress_cooldown.json
- Generated answer JSONL: reports/webllm_round_03_latency_pilot50_v2_evidence_compress_cooldown_answers.jsonl
- Variant: top3_gold_contract_source_rights
- Model id: Qwen3.5-0.8B-q4f16_1-MLC
- WebGPU status: available

## Runtime Summary

- Result rows: 50
- Completed rows: 50
- Error rows: 0
- Average TTFT: 3113.6 ms
- Average total latency: 10502.1 ms
- Average tokens/s: 9.51
- Average prompt tokens estimate: 633.2
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
