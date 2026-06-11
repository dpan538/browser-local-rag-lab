# Main Results: 300-Query V3.3 Gate And Latency Decomposition

## Scope

The principal Round 03 result is the full 300-query V3.3 run using `r03_v33_postprocessed_prose` with `top3_gold_contract_source_rights` evidence packets and Qwen3.5-0.8B-q4f16_1-MLC in the browser-side WebLLM runtime.

Primary source report: `reports/WEBLLM_ROUND_03_LATENCY300_V33_POSTPROCESSED_PROSE.md`.

## Gate Result

| Metric | Value |
|---|---:|
| Result rows | 300 |
| Completed rows | 300 |
| Error rows | 0 |
| Deterministic hybrid rows | 109 |
| Qwen model-generation rows | 191 |
| Contract fail findings | 0 |
| Contract warning findings | 0 |
| Metric validity issues | 0 |

The 300-query gate therefore supports a quality claim for the generated answer artifacts under the current contract: every row completed, no runtime rows failed, and the contract checker found no fail or warning findings.

## Latency Result

| Metric | Value |
|---|---:|
| All-row average total latency | 1585.8 ms |
| Hybrid deterministic average total latency | 0.015 ms |
| Qwen average TTFT | 1105.8 ms |
| Qwen average total latency | 2490.8 ms |
| Qwen average prompt tokens estimate | 344.7 |
| Qwen average tokens/s | 19.77 |
| Qwen P95 total latency | 4190.3 ms |
| Qwen slow rows over 10 seconds | 0 |

The most important reporting distinction is that deterministic rows and model-generation rows are separated. The 109 deterministic rows measure the system layer. The 191 Qwen rows measure browser-side model generation. The all-row average is useful for product-level end-to-end latency, but the Qwen-only average is the correct number for model generation comparisons.

## Latency Decomposition

For V3.3 Qwen rows, the average total latency of 2490.8 ms decomposes approximately into:

| Component | Approximate value |
|---|---:|
| Prompt encoding / TTFT | 1105.8 ms |
| Prose generation after first token | 1385.0 ms |
| Prose polisher + evidence tag injection | <5 ms |

The postprocessing overhead is intentionally negligible. This supports the central system claim: the reliability layer does not need to slow the model down. The expensive work remains browser-side prompt/model computation, while deterministic quality enforcement is effectively free.

## Stage-Level Improvement

The experiment sequence shows a large latency reduction while preserving or improving contract reliability:

| Stage | Sample | Average total latency |
|---|---:|---:|
| Round 01 raw prompt/pseudo-RAG | 30 seed, 28 completed | 16554.9 ms |
| Round 02 gold-only controlled rerun | 200 | 6221.4 ms |
| V3 hybrid deterministic pilot | 50 | Qwen-only 10247.5 ms; all-row 7378.2 ms |
| V3.1 evidence prune + tag injection | 300 | Qwen-only 3312.1 ms; all-row 2108.7 ms |
| V3.3 postprocessed prose | 300 | Qwen-only 2490.8 ms; all-row 1585.8 ms |

These stages are not all the same sample size, so the table should be interpreted as a staged engineering trajectory rather than a strictly paired statistical comparison. The paired Round 03 comparison between V3.1, V3.2, and V3.3 is the stronger evidence for the final optimization.

## Figures

- `essay/latency_breakdown_cascade.png` shows the staged latency reduction and the V3.3 component decomposition.
- `essay/failure_mode_layer_matrix.png` shows which metric collapses when each decoupling layer is removed.

## Paper Takeaway

The final architecture achieves three properties at once:

1. Contract reliability: 300/300 completed with 0 fail and 0 warning findings.
2. Low model-generation latency: Qwen-only average total latency 2.49 seconds with P95 4.19 seconds.
3. Negligible system overhead: deterministic lane formatting, prose polishing, and tag injection add less than a few milliseconds.

This supports the paper's main claim that browser-side SLM RAG becomes practical when deterministic archive-policy work is removed from the model and handled by a model-agnostic reliability layer.

## Cross-Model Validation

V4.1 tests the architecture rather than raw model speed. The deterministic
lanes, prose polisher, and evidence-tag injection layers were kept fixed while
the prose model/runtime changed.

| Model / runtime | Scope | Contract fail / warn | Quality gates | Model-row average total latency | Interpretation |
|---|---:|---:|---|---:|---|
| Qwen3.5-0.8B / WebLLM | 300 | 0 / 0 | pass | 2490.8 ms | Fastest complete browser-local result. |
| SmolLM2-135M / Node Transformers.js | pilot50 | 0 / 0 | failed hallucination/entity gate | 2200.3 ms | Negative prose-capacity control: contract survives weak prose. |
| SmolLM2-360M / Node Transformers.js | 300 | 0 / 0 | pass | 4161.9 ms | Full non-Qwen-family reliability validation. |
| Llama-3.2-1B / Node Transformers.js | pilot50 | 0 / 0 | pass | 9513.5 ms | Non-Qwen 1B reliability check, but too slow for promotion. |

The TTFT protocol is not identical across these rows. Qwen/WebLLM reports a
true streaming browser TTFT. The Node Transformers.js runner does not expose
true streaming TTFT, so `ttft_ms` is conservatively set equal to total
generation latency. Cross-model comparison should therefore emphasize contract
compliance, quality gates, and model-row total latency rather than raw TTFT.

The SmolLM2-135M failure is especially useful: it passed the field contract
with zero violations but failed the hallucination/entity gate because its prose
leaked prompt and HTML artifacts. This demonstrates that deterministic lanes
and evidence-tag injection isolate the evidence contract from prose quality,
while still revealing that user-facing prose remains model-capacity dependent.

## V4.2 Evidence Closure

V4.2 adds paper-facing statistical and robustness evidence without changing the
system.

| Evidence item | Result |
|---|---:|
| Paired V3.2 vs V3.3 model rows | 191 |
| Mean model-row latency reduction | 6008.1 ms |
| Mean reduction 95% bootstrap CI | 5403.8 - 6602.6 ms |
| Mean relative reduction | 61.05% |
| Mean relative reduction 95% bootstrap CI | 57.07% - 64.56% |
| V3.3 contract failure Wilson 95% upper bound | 1.26% |
| Robustness miniset rows | 15 |
| Robustness-specific failed rows | 0 |
| Human review fixture | 50 stratified rows |

The robustness miniset contains 10 adversarial first/earliest queries without
chronology proof and 5 contradictory-date evidence probes. The unsupported
chronology probes were routed to deterministic refusal; contradictory-date
probes exposed both date values and did not choose one date as definitive.

The 50-row human-review fixture is a confirmatory review artifact, not a model
tuning input. It gives reviewers query, intent, evidence values, final answer,
and editable faithfulness/usability fields so automated contract gates can be
backed by semantic human review.
