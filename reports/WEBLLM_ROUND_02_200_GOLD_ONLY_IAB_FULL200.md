# WEBLLM ROUND 02 200 GOLD ONLY IAB FULL200

Generated: 2026-06-08T08:58:41.738Z

## Scope

This report imports a browser-exported WebLLM custom-model run for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/webllm_round_02_200_gold_only_iab_full200.json
- Generated answer JSONL: reports/webllm_round_02_200_gold_only_iab_full200_answers.jsonl
- Variant: gold_only_contract_source_rights
- Model id: Qwen3.5-0.8B-q4f16_1-MLC
- WebGPU status: available

## Runtime Summary

- Result rows: 200
- Completed rows: 200
- Error rows: 0
- Average TTFT: 1810.2 ms
- Average total latency: 6221.4 ms
- Average tokens/s: 16.71
- Average prompt tokens estimate: 458.8
- Metric validity issues: 0

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
| none | none | none | none | none |

## Status Counts

| Status | Count |
|---|---:|
| completed | 200 |

## Contract Gate

- Answers checked: 200
- Expected labels: 200
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
