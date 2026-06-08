# Compliance Certificate Round 03 Gold-Only 200

Generated: 2026-06-08T11:20:47.843Z

Status: PASS

This certificate summarizes the contract-compliance state for the Round 02
200-query gold-only WebLLM run. It is a research artifact, not an archive
evidence statement. Generated answers remain experimental outputs.

## Scope

- Model: Qwen3.5-0.8B-q4f16_1-MLC
- Packet variant: gold_only_contract_source_rights
- Rows: 200

## Compliance Summary

| Metric | Value |
|---|---:|
| Completed rows | 200 |
| Runtime errors | 0 |
| Contract failures | 0 |
| Contract warnings | 0 |
| Gate failures | 0 |
| Gate warnings | 8 |
| Anomaly failures | 0 |
| Anomaly warnings | 8 |
| Ready for next step | yes |

## Runtime Summary

| Metric | Value |
|---|---:|
| Avg prompt tokens | 458.8 |
| Avg TTFT ms | 1810.2 |
| Avg total latency ms | 6221.4 |
| Avg tokens/s | 16.71 |

## Slowest Gold-Only Rows

| Query | Intent | Total ms | Tokens/s | Contract |
|---|---|---:|---:|---|
| BQ176 | more_context | 12022.7 | 12.04 | pass |
| BQ167 | more_context | 11527.2 | 7.66 | pass |
| BQ174 | more_context | 11476.4 | 8.39 | pass |
| BQ26 | more_context | 11410.2 | 9.59 | pass |
| BQ173 | more_context | 11399 | 10.75 | pass |
| BQ25 | more_context | 11374.7 | 11.94 | pass |
| BQ166 | more_context | 11366 | 8.74 | pass |
| BQ169 | more_context | 10933.8 | 7.38 | pass |
| BQ110 | comparison | 10901 | 10.53 | pass |
| BQ175 | more_context | 10837.5 | 8.36 | pass |
| BQ172 | more_context | 10476.8 | 11.99 | pass |
| BQ131 | region_period_recommendation | 10331.9 | 10.88 | pass |
| BQ076 | current_object_explanation | 10088.2 | 12.15 | pass |
| BQ12 | comparison | 10020.6 | 12.48 | pass |
| BQ130 | region_period_recommendation | 9926.9 | 13.85 | pass |
| BQ072 | current_object_explanation | 9923.6 | 11.74 | pass |
| BQ104 | comparison | 9847.7 | 11.74 | pass |
| BQ103 | comparison | 9805.5 | 10.5 | pass |
| BQ16 | region_period_recommendation | 9786 | 12.13 | pass |
| BQ168 | more_context | 9782.9 | 12.8 | pass |

## Paper-Ready Claim

Under a gold-evidence controlled packet, Qwen3.5-0.8B in WebLLM completed
200/200 generation rows with no runtime errors, no generation-contract failures,
and no generation-contract warnings. This supports a contract-compliance claim;
it does not by itself prove semantic research quality without human review.
