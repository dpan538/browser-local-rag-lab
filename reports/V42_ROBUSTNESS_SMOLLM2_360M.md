# V42 ROBUSTNESS SMOLLM2 360M

Generated: 2026-06-11T01:58:30.703Z

## Scope

This report imports a transformers_js_node_smollm2_360m run for
`HuggingFaceTB/SmolLM2-360M-Instruct`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/v42_robustness_smollm2_360m.json
- Generated answer JSONL: reports/v42_robustness_smollm2_360m_answers.jsonl
- Variant: top3_gold_contract_source_rights
- Runtime: transformers_js_node_smollm2_360m
- Model id: HuggingFaceTB/SmolLM2-360M-Instruct
- WebGPU status: not_applicable

## Runtime Summary

- Result rows: 15
- Completed rows: 15
- Error rows: 0
- Deterministic hybrid rows: 10
- SmolLM2-360M model-generation rows: 5
- SmolLM2-360M average TTFT: 2998.3 ms
- SmolLM2-360M average total latency: 2998.3 ms
- SmolLM2-360M average tokens/s: 13.81
- SmolLM2-360M average prompt tokens estimate: 330.4
- Hybrid deterministic average total latency: 0.000 ms
- All-row average total latency: 999.4 ms
- Metric validity issues: 0

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
| none | none | none | none | none |

## Status Counts

| Status | Count |
|---|---:|
| completed | 15 |

## Contract Gate

- Answers checked: 15
- Expected labels: 15
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
