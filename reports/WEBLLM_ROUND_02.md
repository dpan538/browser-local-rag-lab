# WEBLLM ROUND 02

Generated: 2026-06-07T06:44:32.982Z

## Scope

This report imports a browser-exported WebLLM custom-model run for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/webllm_round_02.json
- Generated answer JSONL: reports/webllm_round_02_answers.jsonl
- Variant: top3_compressed_topology_source_rights
- Model id: Qwen3.5-0.8B-q4f16_1-MLC
- WebGPU status: available

## Runtime Summary

- Result rows: 30
- Completed rows: 30
- Error rows: 0
- Average TTFT: 1885.8 ms
- Average total latency: 5992.6 ms
- Average tokens/s: 16.19
- Average prompt tokens estimate: 431.8
- Metric validity issues: 0

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
| none | none | none | none | none |

## Status Counts

| Status | Count |
|---|---:|
| completed | 30 |

## Contract Gate

- Answers checked: 30
- Expected labels: 30
- Fail findings: 0
- Warning findings: 8

| Severity | Query | Code | Field | Detail |
|---|---|---|---|---|
| warn | BQ05 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ05 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ05 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ14 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ14 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ14 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ25 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ26 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |

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
