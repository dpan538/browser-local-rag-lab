# Round 02 200-Query Runtime Results

Generated: 2026-06-08

## Scope

This report summarizes the browser-local WebLLM/Qwen run for the 200-query
Round 02 expansion set. It is research-only runtime evidence. Generated answers
are experiment outputs and are not archive evidence.

## Browser Runtime

- Runner URL: `browser_lab/webllm_round.html`
- Round id: `webllm_round_02_200`
- Variant: `top3_compressed_topology_source_rights`
- Model: `Qwen3.5-0.8B-q4f16_1-MLC`
- Runtime: WebLLM/MLC custom WebGPU model
- WebGPU probe: available
- Cache state: `warm_from_previous`
- Browser model load: 18493 ms

## Pilot 50 Gate

- Result rows: 50
- Completed rows: 50
- Runtime error rows: 0
- Metric validity issues: 0
- Contract failures: 0
- Contract warnings: 7
- Gate warnings: 19

The pilot had no hard runtime or contract failures. Warnings were limited to
known field-visibility warnings and low relative token/s observations, so the
run proceeded to the full 200-query scope.

## Full 200 Runtime Summary

- Result rows: 200
- Completed rows: 200
- Runtime error rows: 0
- Metric validity issues: 0
- Average TTFT: 1999.0 ms
- Average total latency: 6294.6 ms
- Average tokens/s: 15.87
- Average prompt tokens estimate: 530.1

The runtime layer passed: no WebGPU/device failures, no token-budget failures,
and no browser generation errors occurred across 200 rows.

## Full 200 Contract Gate

- Contract failures: 61
- Contract warnings: 146
- Gate warnings: 160
- Ready for next step: no

Failure counts by code:

| Severity | Code | Count |
|---|---|---:|
| fail | `CONTRACT_G005_unverified_field_assertion` | 46 |
| fail | `CONTRACT_G006_source_rights_tag_missing` | 12 |
| fail | `CONTRACT_G007_source_rights_tag_mismatch` | 3 |
| warn | `CONTRACT_G101_required_field_value_not_observed` | 146 |
| warn | `P003_generation_speed_low` | 14 |

Unique queries with contract failures: 39.

## Interpretation

Round 02 at 200 queries is a successful runtime-scale test but not a clean
answer-quality pass. The main finding is methodological: the prompt strategy
that was sufficient for 30 seed queries does not fully survive the more diverse
200-query expansion.

Observed failure modes:

- Source values are too long and path-like for freeform model copying, causing
  `G005_unverified_field_assertion` on current-object, comparison,
  recommendation, and more-context lanes.
- Some `source_rights_question` answers omit or alter required fixed tags
  (`RIGHTS`, `REUSE`, `PUBLIC_DOMAIN`), causing `G006` and `G007`.
- Recommendation and more-context lanes often answer usefully but fail the
  mechanical field-visibility contract because required fields are not copied
  in exact visible form.

This supports a paper-relevant conclusion: browser-local 0.8B RAG can meet
latency and completion targets at 200-query scale, but faithfulness contracts
must be implemented as stricter structured-output lanes, not as natural-language
instructions alone.

## Produced Artifacts

- `reports/webllm_round_02_200_pilot50.json`
- `reports/webllm_round_02_200_pilot50_answers.jsonl`
- `reports/WEBLLM_ROUND_02_200_PILOT50.md`
- `reports/webllm_round_02_200_pilot50_gate.json`
- `reports/WEBLLM_ROUND_02_200_PILOT50_GATE.md`
- `reports/webllm_round_02_200.json`
- `reports/webllm_round_02_200_answers.jsonl`
- `reports/WEBLLM_ROUND_02_200.md`
- `reports/webllm_round_02_200_gate.json`
- `reports/WEBLLM_ROUND_02_200_GATE.md`
- `reports/quality_review_sheet_round_02_200.json`
- `reports/QUALITY_REVIEW_SHEET_ROUND_02_200.md`
- `reports/ANOMALY_DETECTION_ROUND_02.md`

## Next Step

Do not proceed to quality claims from this 200-query run. The next engineering
round should keep the same dataset and runtime, then change only the answer
lanes:

1. Make `source`, `rights`, `reuse_permission`, and `public_domain_status`
   deterministic copied fields outside model generation.
2. Require a first-line `EVIDENCE TAGS` block for all answerable non-refusal
   lanes before natural-language text.
3. Shorten source fields for generation with a `source_id` plus exact `source_url`
   tag, and validate against those tags instead of freeform prose.
4. Re-run only failed unique queries first, then rerun the full 200 if failures
   reach zero.
