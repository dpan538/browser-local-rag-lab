# Round 03 Performance Optimization Plan

Generated: 2026-06-08

This plan continues the Round 03 mainline. It does not open Round 04. The
300-query run is the Round 03 scale baseline; the next step is a controlled
performance optimization track that must preserve contract compliance.

## Baseline Finding

The Round 03 300-query WebLLM/Qwen run is reliability-clean:

- 300/300 completed.
- 0 runtime errors.
- 0 metric issues.
- 0 contract failures.
- 0 contract warnings.
- 30 non-blocking `P003_generation_speed_low` observations.

The bottleneck is latency and answer usability. The latency triage report
shows:

- `prompt_tokens_est -> ttft_ms`: Pearson `0.976`, Spearman `0.969`.
- `prompt_tokens_est -> total_latency_ms`: Pearson `0.950`, Spearman `0.952`.
- `output_tokens -> total_latency_ms`: Pearson `0.664`, Spearman `0.470`.
- 53 rows are above 10000 ms total latency.
- 30 rows are below 8.51 tokens/s.

The heaviest latency tail is lane-specific:

- `more_context`: P95 total `13002.2 ms`.
- `region_period_recommendation`: P95 total `12359.6 ms`.
- `current_object_explanation`: P95 total `11159.5 ms`.
- `comparison`: P95 total `10534.6 ms`.

The highest-confidence optimization target is therefore prompt/evidence shape,
not model replacement.

## Fixed Pilot Set

Future Round 03 optimization pilots should use the fixed stratified pilot set:

```text
fixtures/optimization/round03_latency_pilot50/queries.jsonl
fixtures/optimization/round03_latency_pilot50/labels.jsonl
fixtures/optimization/round03_latency_pilot50/records.jsonl
fixtures/optimization/round03_latency_pilot50/retrieval_sufficiency.json
```

Selection report:

```text
reports/ROUND_03_LATENCY_PILOT50_SELECTION.md
```

Bucket composition:

- 26 latency-tail rows.
- 8 low-decode-speed rows.
- 6 source/rights hybrid-lane candidates.
- 5 refusal hybrid-lane candidates.
- 5 fast controls.

This pilot is intentionally not the first 50 queries. It is a stress set for
performance optimization while still preserving controls.

## Variant Definitions

### `r03_v0_baseline`

Current Round 03 baseline:

```text
top3_gold_contract_source_rights
```

Purpose:

- Reference point for all optimization claims.
- Already measured at 300 rows.

Metric bucket:

```text
qwen_generation_latency
```

except where the current pipeline already postprocesses contract fields after
generation.

### `r03_v1_length_control`

Same evidence packet as baseline, but prompts enforce stricter response shape:

- Put `EVIDENCE TAGS` before prose for answerable lanes.
- Add lane-specific answer length constraints.
- Keep source/rights and hard-refusal behavior unchanged from baseline.
- Do not remove evidence fields.

Hypothesis:

- Reduces `output_tokens`.
- Improves total latency with minimal TTFT change.
- May improve answer usability by making field grounding visible first.

Risk:

- Too much shortening may reduce useful research guidance in comparison and
  route recommendation lanes.

Success criteria:

- Contract fail = 0.
- Contract warn = 0 or explicitly reviewed.
- Average total latency improves over pilot baseline.
- No decline in manual usefulness review for research lanes.

### `r03_v2_evidence_compress`

Required-field-preserving compression for context-heavy lanes:

- Keep every `required_field`.
- Keep exact source/rights/image-state fields where required.
- Compress `compact_note`, topology, and repeated source text.
- For `more_context`, keep active object fields plus short related-record
  skeletons.
- For `region_period_recommendation`, keep route fields and suppress unrelated
  long note spillover.
- For `comparison`, keep the two comparison records plus exact evidence tags.

Hypothesis:

- Reduces prompt tokens.
- Reduces TTFT because prompt-token correlation is very strong.
- Preserves contract compliance because required fields remain intact.

Risk:

- Compression may remove useful semantic context for quality review even if
  contract validation passes.

Success criteria:

- Contract fail = 0.
- Contract warn = 0 or explicitly reviewed.
- TTFT and P95 total latency improve over pilot baseline.
- Human review confirms no important research context was removed.

### `r03_v3_hybrid_deterministic_lanes`

Deterministic/browser-runtime output for lanes where generation adds risk
without adding much value:

- `refusal_expected = true`: return the exact refusal phrase without model
  generation.
- `source_rights_question`: return exact source/rights/reuse/public-domain/
  image-state fields without model generation.

These rows must be reported as:

```text
hybrid_system_latency
```

not:

```text
qwen_generation_latency
```

Hypothesis:

- Large latency reduction for source/rights rows.
- Near-zero reliability risk because exact evidence fields are copied.
- Clarifies that small models should not freely paraphrase rights status.

Risk:

- If reported incorrectly, this can overstate Qwen generation speed.
- Must be separated from pure model-generation results in all tables.

Success criteria:

- Contract fail = 0.
- Contract warn = 0.
- Report separates hybrid-system rows from Qwen-generated rows.
- Source/rights answers preserve exact field values and caveats.

### `r03_v4_combined`

Combined system:

- `r03_v1_length_control`
- `r03_v2_evidence_compress`
- `r03_v3_hybrid_deterministic_lanes`

Hypothesis:

- Best candidate for product-like browser-local RAG behavior.
- Should reduce TTFT, P95 latency, and slow-query ratio while preserving
  reliability.

Risk:

- Harder to attribute gains to a single mechanism.

Use:

- Run only after individual 50-query pilots show no contract regression.

## Pilot Gate

Each 50-query pilot must pass:

- Completed rows = 50/50.
- Runtime errors = 0.
- Metric issues = 0.
- Contract failures = 0.
- Contract warnings = 0, unless explicitly reviewed and downgraded.
- Prompt audit = pass.
- Safety scan = pass.

Performance targets for a pilot to qualify for 300-row expansion:

- P95 total latency lower than baseline pilot.
- Average TTFT lower than baseline pilot for compression variants.
- Average output tokens lower than baseline pilot for length-control variants.
- Low-speed row count lower than baseline pilot.

## Baseline Pilot URL

When running the pilot in the in-app browser, use the fixed fixture:

```text
http://127.0.0.1:4178/browser_lab/webllm_round.html?round=webllm_round_03_latency_pilot50_baseline&start=1&limit=50&queries=../fixtures/optimization/round03_latency_pilot50/queries.jsonl&labels=../fixtures/optimization/round03_latency_pilot50/labels.jsonl&records=../fixtures/optimization/round03_latency_pilot50/records.jsonl&retrieval=../fixtures/optimization/round03_latency_pilot50/retrieval_sufficiency.json&variant=top3_gold_contract_source_rights&skipCompleted=true
```

Variant pilots should use the same query/label/record/retrieval fixture and
only change the prompt/runtime variant.

## Immediate Next Implementation

1. Add prompt/runtime support for `r03_v1_length_control`.
2. Add prompt/runtime support for `r03_v2_evidence_compress`.
3. Add prompt/runtime support for `r03_v3_hybrid_deterministic_lanes`, making
   sure deterministic rows are marked as `hybrid_system_latency`.
4. Add prompt audit checks for each variant.
5. Run the fixed 50-query pilot for `r03_v1` and `r03_v2` before attempting
   any 300-row rerun.
