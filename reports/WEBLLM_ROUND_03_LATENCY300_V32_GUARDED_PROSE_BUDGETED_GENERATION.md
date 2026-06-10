# WEBLLM ROUND 03 LATENCY300 V32 GUARDED PROSE BUDGETED GENERATION

Generated: 2026-06-09T23:43:08.663Z

## Scope

This report imports a browser-exported WebLLM custom-model run for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/webllm_round_03_latency300_v32_guarded_prose_budgeted_generation.json
- Generated answer JSONL: reports/webllm_round_03_latency300_v32_guarded_prose_budgeted_generation_answers.jsonl
- Variant: top3_gold_contract_source_rights
- Model id: Qwen3.5-0.8B-q4f16_1-MLC
- WebGPU status: available

## Runtime Summary

- Result rows: 300
- Completed rows: 300
- Error rows: 0
- Deterministic hybrid rows: 109
- Qwen model-generation rows: 191
- Qwen average TTFT: 2117.4 ms
- Qwen average total latency: 8499.0 ms
- Qwen average tokens/s: 12.39
- Qwen average prompt tokens estimate: 419.2
- Hybrid deterministic average total latency: 0.018 ms
- All-row average total latency: 5411.0 ms
- Metric validity issues: 0

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
| none | none | none | none | none |

## Status Counts

| Status | Count |
|---|---:|
| completed | 300 |

## Contract Gate

- Answers checked: 300
- Expected labels: 300
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
