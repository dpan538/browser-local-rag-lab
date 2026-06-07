# WebLLM Round 01

Generated: 2026-06-07T06:08:25.664Z

## Scope

This report imports a browser-exported WebLLM custom-model run for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/webllm_round_01.json
- Generated answer JSONL: reports/webllm_round_01_answers.jsonl
- Variant: top3_compressed_topology_source_rights
- Model id: Qwen3.5-0.8B-q4f16_1-MLC
- WebGPU status: available

## Runtime Summary

- Result rows: 30
- Completed rows: 28
- Error rows: 2
- Average TTFT: 9914.9 ms
- Average total latency: 16554.9 ms
- Average tokens/s: 10.68
- Average prompt tokens estimate: 1764.2
- Metric validity issues: 0

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
| none | none | none | none | none |

## Status Counts

| Status | Count |
|---|---:|
| completed | 28 |
| error | 2 |

## Contract Gate

- Answers checked: 30
- Expected labels: 30
- Fail findings: 9
- Warning findings: 43

| Severity | Query | Code | Field | Detail |
|---|---|---|---|---|
| warn | BQ06 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ06 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ06 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ06 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ08 | G101_required_field_value_not_observed | rights | answer does not visibly include an evidence value for this required field |
| fail | BQ08 | G005_unverified_field_assertion | rights | asserted="** The metadata reports public-domain rights; the IIIF image is source-hosted by BnF." |
| fail | BQ09 | G002_refusal_missing | refusal | label expects refusal or request for narrower context |
| fail | BQ11 | G002_refusal_missing | refusal | label expects refusal or request for narrower context |
| fail | BQ15 | G002_refusal_missing | refusal | label expects refusal or request for narrower context |
| warn | BQ16 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ16 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ16 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ16 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ17 | G002_refusal_missing | refusal | label expects refusal or request for narrower context |
| fail | BQ18 | G002_refusal_missing | refusal | label expects refusal or request for narrower context |
| warn | BQ19 | G101_required_field_value_not_observed | reuse_permission | answer does not visibly include an evidence value for this required field |
| warn | BQ19 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| warn | BQ20 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ20 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ20 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ20 | G101_required_field_value_not_observed | rights | answer does not visibly include an evidence value for this required field |
| warn | BQ20 | G101_required_field_value_not_observed | image_state | answer does not visibly include an evidence value for this required field |
| warn | BQ20 | G101_required_field_value_not_observed | reuse_permission | answer does not visibly include an evidence value for this required field |
| warn | BQ20 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| warn | BQ21 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ21 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ21 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ21 | G101_required_field_value_not_observed | rights | answer does not visibly include an evidence value for this required field |
| warn | BQ21 | G101_required_field_value_not_observed | image_state | answer does not visibly include an evidence value for this required field |
| warn | BQ22 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ22 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ22 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ22 | G101_required_field_value_not_observed | rights | answer does not visibly include an evidence value for this required field |
| warn | BQ22 | G101_required_field_value_not_observed | image_state | answer does not visibly include an evidence value for this required field |
| warn | BQ22 | G101_required_field_value_not_observed | reuse_permission | answer does not visibly include an evidence value for this required field |
| warn | BQ22 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| warn | BQ24 | G101_required_field_value_not_observed | method_context | answer does not visibly include an evidence value for this required field |
| warn | BQ25 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ25 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ25 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ25 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ25 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ25 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| warn | BQ26 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ26 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ26 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ26 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ26 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ26 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| fail | BQ27 | G002_refusal_missing | refusal | label expects refusal or request for narrower context |
| fail | BQ28 | G002_refusal_missing | refusal | label expects refusal or request for narrower context |
| fail | BQ29 | G002_refusal_missing | refusal | label expects refusal or request for narrower context |

## Runtime Errors

| Query | Status | Error |
|---|---|---|
| BQ11 | error | Prompt tokens exceed context window size: number of prompt tokens: 4283; context window size: 4096 Consider shortening the prompt, or increase `context_window_size`, or using sliding window via `sliding_window_size`. |
| BQ22 | error | Prompt tokens exceed context window size: number of prompt tokens: 4505; context window size: 4096 Consider shortening the prompt, or increase `context_window_size`, or using sliding window via `sliding_window_size`. |

## Interpretation

- A paper-quality round requires all 30 seed queries to complete or an explicit
  failure-analysis table for device/runtime failures.
- Contract failures block generated-answer quality claims.
- Contract warnings can still be useful for prompt and evidence-packet tuning,
  but they should not be reported as faithful answers without review.
