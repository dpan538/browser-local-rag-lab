# V41 LLAMA32 1B PILOT50

Generated: 2026-06-10T08:23:00.323Z

## Scope

This report imports a transformers_js_node_llama32_1b run for
`onnx-community/Llama-3.2-1B-Instruct-ONNX`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/v41_llama32_1b_pilot50.json
- Generated answer JSONL: reports/v41_llama32_1b_pilot50_answers.jsonl
- Variant: top3_gold_contract_source_rights
- Runtime: transformers_js_node_llama32_1b
- Model id: onnx-community/Llama-3.2-1B-Instruct-ONNX
- WebGPU status: not_applicable

## Runtime Summary

- Result rows: 50
- Completed rows: 50
- Error rows: 0
- Deterministic hybrid rows: 14
- Llama-3.2-1B model-generation rows: 36
- Llama-3.2-1B average TTFT: 9513.5 ms
- Llama-3.2-1B average total latency: 9513.5 ms
- Llama-3.2-1B average tokens/s: 4.35
- Llama-3.2-1B average prompt tokens estimate: 362.2
- Hybrid deterministic average total latency: 0.000 ms
- All-row average total latency: 6849.7 ms
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
