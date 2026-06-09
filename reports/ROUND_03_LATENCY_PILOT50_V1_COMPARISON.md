# Round 03 Latency Pilot50 V1 Comparison

Generated: 2026-06-09

This memo compares the fixed Round 03 latency pilot50 baseline against
`r03_v1_length_control`. It is still Round 03. It is not Round 04, and it does
not change archive product runtime behavior.

## Inputs

Baseline:

- `reports/webllm_round_03_latency_pilot50_baseline.json`
- `reports/webllm_round_03_latency_pilot50_baseline_gate.json`
- `reports/round03_latency_pilot50_baseline_triage.json`

Valid V1 run:

- `reports/webllm_round_03_latency_pilot50_v1_length_control_fresh.json`
- `reports/webllm_round_03_latency_pilot50_v1_length_control_fresh_gate.json`
- `reports/round03_latency_pilot50_v1_length_control_fresh_triage.json`

Note: an earlier V1 attempt was cache-confounded because the browser reused the
old `prompt_builder.mjs` ESM module. That run should be ignored for
optimization conclusions. The fresh V1 run used `webllm_round.js?v=16` and
`prompt_builder.mjs?v=2`; BQ166 prompt preview dropped from about 1282 estimated
tokens to about 917 estimated tokens before execution.

## Contract Gate

| Run | Completed | Runtime errors | Contract fails | Contract warnings | Blocking findings | Ready |
|---|---:|---:|---:|---:|---:|---|
| baseline | 50 | 0 | 0 | 0 | 0 | yes |
| V1 length control fresh | 50 | 0 | 0 | 0 | 0 | yes |

## Runtime Comparison

| Metric | Baseline | V1 fresh | Delta | Delta % |
|---|---:|---:|---:|---:|
| Avg TTFT ms | 3242.2 | 2823.3 | -418.9 | -12.9% |
| P95 TTFT ms | 5264.8 | 6227.5 | +962.7 | +18.3% |
| Avg total ms | 9526.0 | 6649.8 | -2876.2 | -30.2% |
| P50 total ms | 10837.8 | 7002.2 | -3835.6 | -35.4% |
| P95 total ms | 13500.0 | 15987.7 | +2487.7 | +18.4% |
| Max total ms | 14490.5 | 17315.6 | +2825.1 | +19.5% |
| Avg tokens/s | 11.51 | 11.78 | +0.27 | +2.3% |
| Avg prompt tokens | 771.1 | 596.6 | -174.5 | -22.6% |
| Avg output tokens | 59.5 | 33.0 | -26.5 | -44.5% |
| Slow rows > 10000 ms | 31 | 5 | -26 | -83.9% |
| Low-speed rows | 8 | 9 | +1 | +12.5% |

## Intent-Level Effect

| Intent | N | Baseline avg total ms | V1 avg total ms | Delta | Slow rows |
|---|---:|---:|---:|---:|---|
| region_period_recommendation | 12 | 11830.5 | 9371.8 | -2458.7 | 12 -> 3 |
| more_context | 12 | 12495.4 | 8827.1 | -3668.3 | 12 -> 2 |
| source_rights_question | 10 | 7835.0 | 7221.6 | -613.4 | 1 -> 0 |
| comparison | 4 | 11322.3 | 4727.8 | -6594.5 | 4 -> 0 |
| current_object_explanation | 2 | 11113.6 | 4750.0 | -6363.6 | 2 -> 0 |
| archive_orientation | 3 | 7425.5 | 2077.4 | -5348.1 | 0 -> 0 |
| method_process_question | 2 | 6239.5 | 1737.6 | -4501.9 | 0 -> 0 |
| first_earliest_claim | 3 | 750.9 | 753.9 | +3.0 | 0 -> 0 |
| no_evidence_refusal | 2 | 758.2 | 753.9 | -4.3 | 0 -> 0 |

## Interpretation

V1 passes the reliability gate and substantially improves average and median
latency by reducing both prompt size and generated answer length. The largest
average gains appear in comparison, current-object, archive-orientation,
method-process, and more-context rows.

However, V1 does not cleanly solve the tail. P95 and max total latency are worse
than baseline, and P95 TTFT is also worse. Because V1 was run after several
continuous browser-local model passes, thermal or scheduling effects may
contribute to the tail. The V1 result should therefore be treated as a promising
pilot, not yet as a final optimization claim.

## Decision

- Keep `r03_v1_length_control` as a valid Round 03 pilot candidate.
- Do not expand V1 to 300 yet.
- Run `r03_v2_evidence_compress` next, because prompt-token reduction remains
  the most plausible TTFT lever.
- Later run an interleaved or cooled repeat of baseline and V1 before making a
  paper-level latency claim.
