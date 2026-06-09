# Round 03 300 Latency Triage

Generated: 2026-06-09T14:31:55.135Z

This is a post-run analysis of the existing Round 03 300-query
`top3_gold_contract_source_rights` WebLLM/Qwen run. It does not rerun the
model, change prompts, alter labels, or modify evidence. Generated answers
remain experimental outputs and are not archive evidence.

## Summary

| Metric | Value |
|---|---:|
| Rows | 300 |
| Qwen model-generation rows | 191 |
| Deterministic hybrid rows | 109 |
| Contract failures | null |
| Contract warnings | null |
| Gate blocking findings | null |
| Gate performance observations | null |
| Avg TTFT ms | 791.6 |
| P95 TTFT ms | 1481.4 |
| Avg total latency ms | 2108.7 |
| P50 total latency ms | 2069.9 |
| P95 total latency ms | 7090 |
| Max total latency ms | 8778.5 |
| Avg tokens/s | 8.37 |
| Qwen avg TTFT ms | 1243.3 |
| Qwen P95 TTFT ms | 1516.4 |
| Qwen avg total latency ms | 3312.1 |
| Qwen P95 total latency ms | 8021.4 |
| Qwen avg tokens/s | 13.15 |
| Hybrid avg total latency ms | 0 |
| Slow rows > 10000 ms | 0 |
| Low-speed rows < 6.58 tokens/s | 13 |

## Correlations

| Pair | Pearson r | Spearman rho |
|---|---:|---:|
| prompt_tokens_est -> ttft_ms | 0.874 | 0.841 |
| prompt_tokens_est -> total_latency_ms | 0.154 | 0.178 |
| output_tokens -> total_latency_ms | 0.936 | 0.775 |
| evidence_chars -> prompt_tokens_est | 0.438 | 0.572 |
| candidate_count -> total_latency_ms | 0.12 | -0.051 |

## Intent-Level Runtime

| Intent | N | Avg total ms | P95 total ms | Max total ms | Avg TTFT ms | Avg tokens/s | Slow rows | Low-speed rows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| region_period_recommendation | 34 | 3954.4 | 8088.8 | 8319.4 | 1118.5 | 13.14 | 0 | 0 |
| archive_orientation | 22 | 3011 | 7987.7 | 8361.5 | 1396.7 | 19.22 | 0 | 0 |
| casual_archive_help | 22 | 3205.5 | 7972.7 | 8206 | 1234.7 | 15.12 | 0 | 0 |
| more_context | 24 | 3870 | 7893.3 | 8778.5 | 1496.8 | 11.25 | 0 | 0 |
| comparison | 38 | 3649.8 | 5735.8 | 8251.1 | 1204 | 7.69 | 0 | 13 |
| current_object_explanation | 32 | 2371.7 | 4068.3 | 6120.4 | 1106.3 | 11.8 | 0 | 0 |
| method_process_question | 22 | 2451.2 | 3373.2 | 3545.2 | 1112.4 | 16.77 | 0 | 0 |
| source_rights_question | 36 | 0 | 0.1 | 0.2 | 0 | 0 | 0 | 0 |
| first_earliest_claim | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| no_evidence_refusal | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Slow Query Triage

Rows above 10000 ms:

| Query | Intent | Total ms | TTFT ms | tokens/s | Prompt tokens | Output tokens | Evidence chars | Main signal | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Repeated Evidence In Slow Rows

| Evidence ID | Slow rows | All rows | Avg total ms | Avg evidence chars |
| --- | --- | --- | --- | --- |

## Hybrid-Lane Upper-Bound Savings

This estimate is intentionally conservative in interpretation. It is not a
measured optimized runtime. It is an upper-bound estimate of model-generation
latency currently spent on lanes that could be returned by deterministic
browser/runtime logic.

| Candidate lane group | Rows | Current total ms | Current avg ms | Reporting bucket |
|---|---:|---:|---:|---|
| Refusal expected | 73 | 0 | 0 | hybrid_system_latency |
| Source/rights | 36 | 1.5 | 0 | hybrid_system_latency |
| Combined deterministic candidates | 109 | 1.5 | 0 | hybrid_system_latency |

## Interpretation

- Round 03 is contract-clean at scale; the next bottleneck is latency and
  answer usability, not basic reliability.
- Prompt size has a visible relationship with TTFT, but the latency tail is
  lane-dependent. The heaviest tail is concentrated in `more_context`,
  `region_period_recommendation`, `comparison`, and
  `current_object_explanation`.
- Output length contributes to total latency, but low tokens/s rows show that
  generation speed also varies by lane and evidence shape, not just token
  count.
- Deterministic refusal and source/rights lanes are not a claim about Qwen
  generation capability. They should be measured separately as hybrid system
  latency because the system can return exact evidence fields or mandatory
  refusals without asking the model to paraphrase.

## Next Round 03 Optimization Order

1. Build `r03_v1_length_control`: same evidence, stricter answer length and
   evidence-tag placement.
2. Build `r03_v2_evidence_compress`: required-field-preserving evidence
   compression for context-heavy lanes.
3. Build `r03_v3_hybrid_deterministic_lanes`: deterministic refusal and
   source/rights output, reported as hybrid system latency.
4. Run 50-query pilots only. Expand to 300 only if contract fail remains 0
   and latency improves meaningfully.
