# Next Experiment Plan: Round 02 Packet Ablation

Generated: 2026-06-08

This plan starts the next controlled WebLLM experiment after the full-200
`top3_gold_contract_source_rights` run. It remains a research-only browser-local
runtime comparison. It does not represent archive product retrieval, Assistant
runtime behavior, scraping, ingestion, or rights policy.

## Starting Point

The existing full-200 controlled run is the middle condition:

- Variant: `top3_gold_contract_source_rights`
- Rows: 200
- Runtime errors: 0
- Metric issues: 0
- Generation-contract failures: 0
- Generation-contract warnings: 0
- Blocking gate findings: 0
- Performance observations: 25
- Average TTFT: 2284.9 ms
- Average total latency: 7082.4 ms
- Average tokens/s: 16.35
- Average prompt tokens: 560.9

Performance stratification shows that prompt length is strongly associated with
runtime:

- `prompt_tokens_est` vs TTFT: Pearson r = 0.93
- `prompt_tokens_est` vs total latency: Pearson r = 0.8952
- `prompt_tokens_est` vs tokens/s: Pearson r = -0.6945

The slowest observations are concentrated in `comparison`,
`region_period_recommendation`, and `more_context`; next comparisons must be
paired by query and stratified by intent.

## Candidate Conditions

| Condition | Variant | Role | Avg prompt tokens | Max prompt tokens | Prompt audit | Oracle contract | Token budget |
|---|---|---|---:|---:|---:|---:|---:|
| Gold only | `gold_only_contract_source_rights` | Minimal controlled evidence packet | 458.82 | 1223 | 0 fail | 0 fail / 0 warn | 0 fail |
| Top 3 | `top3_gold_contract_source_rights` | Existing middle condition | 560.9 | 1299 | 0 fail | 0 fail / 0 warn | 0 fail |
| Top 8 | `top8_gold_contract_source_rights` | Larger context condition | 954.84 | 2901 | 0 fail | 0 fail / 0 warn | 0 fail |

These conditions are valid controlled-generation conditions because each has
100% gold evidence coverage in oracle mode. They are not product retrieval
claims because gold evidence is injected where deterministic retrieval misses
the label contract.

## Run Order

1. Run `gold_only_contract_source_rights` pilot50 in the Codex in-app browser.
2. If pilot50 has 0 runtime errors, 0 metric issues, and 0 contract fail/warn,
   run full200 for `gold_only_contract_source_rights`.
3. Run `top8_gold_contract_source_rights` pilot50 in the Codex in-app browser.
4. If pilot50 passes, run full200 for `top8_gold_contract_source_rights`.
5. Compare gold-only, top3, and top8 using paired per-query deltas.

## Primary Metrics

- Runtime completion rate.
- Metric schema validity.
- Generation-contract fail/warn counts.
- TTFT.
- Total latency.
- Tokens/s.
- Output tokens.
- Prompt tokens.
- P003 low-speed observation count.

## Analysis Rules

- Do not compare only global averages; report paired deltas by query.
- Always stratify by intent.
- Treat any contract failure as a blocker.
- Treat P003 as a performance observation unless accompanied by runtime,
  metric, or contract failure.
- Report whether a larger packet improves answer quality only after a human
  review fixture exists; mechanical contract pass alone is not a semantic
  quality win.

## Expected Hypotheses

- Gold-only should be fastest on average because it removes filler context.
- Top8 should be slower than top3 because average prompt tokens rise from
  560.9 to 954.84.
- If top8 does not improve contract or human-reviewed quality, it is unlikely
  to justify the latency cost for this 0.8B browser-local setting.
- More-context and region-period lanes should remain the main latency stress
  tests, so they should be reported separately in the paper framing.

## Commands Already Passed

```bash
npm run performance:round2:200:contract
npm run retrieval:contract:200
npm run retrieval:contract:200:gold-only
npm run retrieval:contract:200:top8
npm run contract:oracle:200:contract
npm run contract:oracle:200:gold-only
npm run contract:oracle:200:top8
node scripts/rebuild_prompts_for_contract.mjs --retrieval reports/retrieval_sufficiency_200_contract_gold_only.json --variant gold_only_contract_source_rights --out reports/round02_200_contract_gold_only_prompts_fixed.json
node scripts/rebuild_prompts_for_contract.mjs --retrieval reports/retrieval_sufficiency_200_contract_top8.json --variant top8_gold_contract_source_rights --out reports/round02_200_contract_top8_prompts_fixed.json
node scripts/audit_prompts.mjs --retrieval reports/retrieval_sufficiency_200_contract_gold_only.json --variant gold_only_contract_source_rights --json-out reports/prompt_audit_round02_200_contract_gold_only.json --md-out reports/PROMPT_AUDIT_ROUND02_200_CONTRACT_GOLD_ONLY.md --strict
node scripts/audit_prompts.mjs --retrieval reports/retrieval_sufficiency_200_contract_top8.json --variant top8_gold_contract_source_rights --json-out reports/prompt_audit_round02_200_contract_top8.json --md-out reports/PROMPT_AUDIT_ROUND02_200_CONTRACT_TOP8.md --strict
node scripts/preflight_round02.mjs --queries fixtures/expansion/round02_200/queries.jsonl --labels fixtures/expansion/round02_200/labels.jsonl --records fixtures/expansion/round02_200/records.jsonl --retrieval reports/retrieval_sufficiency_200_contract_gold_only.json --variant gold_only_contract_source_rights --json-out reports/round02_200_contract_gold_only_preflight.json --md-out reports/ROUND_02_200_CONTRACT_GOLD_ONLY_DESIGN.md --round-id round02_200_contract_gold_only
node scripts/preflight_round02.mjs --queries fixtures/expansion/round02_200/queries.jsonl --labels fixtures/expansion/round02_200/labels.jsonl --records fixtures/expansion/round02_200/records.jsonl --retrieval reports/retrieval_sufficiency_200_contract_top8.json --variant top8_gold_contract_source_rights --json-out reports/round02_200_contract_top8_preflight.json --md-out reports/ROUND_02_200_CONTRACT_TOP8_DESIGN.md --round-id round02_200_contract_top8
```
