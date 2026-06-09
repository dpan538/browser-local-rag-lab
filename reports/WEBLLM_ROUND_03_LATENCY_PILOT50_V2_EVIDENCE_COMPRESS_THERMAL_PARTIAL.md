# WEBLLM ROUND 03 LATENCY PILOT50 V2 EVIDENCE COMPRESS

Generated: 2026-06-09T10:46:27.812Z

## Scope

This report imports a browser-exported WebLLM custom-model run for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/webllm_round_03_latency_pilot50_v2_evidence_compress_thermal_partial.json
- Generated answer JSONL: reports/webllm_round_03_latency_pilot50_v2_evidence_compress_thermal_partial_answers.jsonl
- Variant: top3_gold_contract_source_rights
- Model id: Qwen3.5-0.8B-q4f16_1-MLC
- WebGPU status: available

## Runtime Summary

- Result rows: 8
- Completed rows: 8
- Error rows: 0
- Average TTFT: 6135.8 ms
- Average total latency: 16559.9 ms
- Average tokens/s: 5.99
- Average prompt tokens estimate: 882.0
- Metric validity issues: 0

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
| none | none | none | none | none |

## Status Counts

| Status | Count |
|---|---:|
| completed | 8 |

## Contract Gate

- Answers checked: 8
- Expected labels: 8
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
