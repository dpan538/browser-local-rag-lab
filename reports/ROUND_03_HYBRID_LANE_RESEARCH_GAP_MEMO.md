# Round 03 Hybrid Answer-Lane Research Gap Memo

Generated: 2026-06-08

This memo records the literature positioning for the next Round 03
performance-optimization track. It does not start a new Round 04. The
300-query expansion should be treated as the Round 03 scale baseline, while
the next work remains a Round 03 optimization and ablation phase.

## Question

The current lab has shown that a browser-local WebLLM/Qwen 0.8B-class runtime
can complete 300 controlled-condition RAG queries with zero runtime errors,
zero metric issues, zero contract failures, and zero contract warnings. The
remaining problem is not basic contract compliance; it is performance and
answer usability under a strict reliability contract.

The next research question is:

Can a browser-local 0.8B-class small language model deliver useful, trusted,
low-latency RAG answers by assigning different answer lanes to different
execution mechanisms: deterministic UI/rule logic for exact factual slots and
refusals, and small-model generation for explanatory or research guidance?

## Literature Scan

Search date: 2026-06-08. The scan prioritized primary sources, official
documentation, and papers.

### Browser-local LLM inference is now a recognized systems topic

WebLLM directly establishes high-performance in-browser LLM inference as a
research and engineering target. The WebLLM paper frames browsers as a broadly
accessible on-device deployment platform and reports a JavaScript framework
that uses WebGPU and WebAssembly for local LLM inference:
https://arxiv.org/abs/2412.15803

The WebLLM repository and MLC documentation further confirm that WebLLM is
designed for browser-side inference, WebGPU acceleration, OpenAI-compatible
APIs, JSON/structured generation, streaming, caching, and worker support:
https://github.com/mlc-ai/web-llm
https://llm.mlc.ai/docs/deploy/webllm.html

Recent WebGPU LLM systems work is also moving beyond demonstrations into
memory, portability, and dispatch-overhead analysis. LlamaWeb studies a WebGPU
backend for llama.cpp with memory and cross-device portability as central
constraints:
https://arxiv.org/abs/2605.20706

Maczan's WebGPU dispatch-overhead study is especially relevant to our latency
work because it focuses on batch-size-1 LLM inference across GPU vendors,
backends, and browsers, including Qwen2.5 0.5B and 1.5B models:
https://arxiv.org/abs/2604.02344

### Browser-local retrieval exists, but generation-policy design remains open

MeMemo is a close neighbor to this lab because it targets on-device retrieval
augmentation and browser-local RAG prototyping. It introduces an in-browser
dense retrieval toolkit and RAG Playground for locally testing retrieved
documents with browser LLMs:
https://zijie.wang/papers/mememo/
https://arxiv.org/abs/2407.01972

MeMemo supports the privacy and browser-local retrieval motivation, but it
does not appear to define answer-lane contracts for rights-aware archive
questions, deterministic refusal, source/rights exact copying, or latency
reporting that separates model generation from deterministic system output.

### RAG grounding is established, but browser-local contract lanes are less explored

The original RAG paper makes provenance and updatable knowledge central
motivations for retrieval-augmented generation:
https://arxiv.org/abs/2005.11401

That framing supports our evidence-packet and contract-compliance work.
However, the classic RAG formulation does not answer when a local small model
should not generate at all, or when a system should return exact evidence
fields deterministically instead of asking a model to paraphrase them.

### Hybrid neural-symbolic systems support the architectural direction

MRKL is a strong conceptual precedent for combining language models with
discrete modules and external tools:
https://arxiv.org/abs/2205.00445

NeMo Guardrails is also relevant because it separates programmable rails from
the underlying LLM and treats controllability as a runtime application concern:
https://arxiv.org/abs/2310.10501

SGLang is relevant for structured LLM applications and performance. It argues
that structured/multi-step LLM programs need both programming abstractions and
runtime optimizations:
https://arxiv.org/abs/2312.07104

These works justify hybrid system design. They do not, by themselves, cover
the exact browser-local archive-RAG problem: small-model WebGPU inference,
rights-aware evidence fields, answer-lane-specific latency accounting, and
contract-gated generation quality.

### Runtime comparison paths are real but should remain research-only

ONNX Runtime WebGPU and Transformers.js WebGPU are active browser runtime
paths. ONNX Runtime documents a WebGPU execution provider:
https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html

Transformers.js documents WebGPU model execution via a `device: "webgpu"`
option:
https://huggingface.co/docs/transformers.js/guides/webgpu

These provide valid research-only comparison targets. They should not be
presented as product-path decisions for the archive assistant.

## Gap Statement

The literature now supports each ingredient separately:

- in-browser WebGPU LLM inference;
- browser-local retrieval and RAG prototyping;
- RAG provenance and grounding;
- neuro-symbolic / guardrail-style system decomposition;
- structured-generation systems and runtime optimization.

The apparent gap is the combination:

A reproducible browser-local RAG lab for a private, rights-aware archive that
measures whether lane-aware evidence compression and deterministic answer
lanes can reduce TTFT, total latency, and long-tail failures while preserving
strict evidence contracts for a 0.8B-class local model.

This is not merely a product optimization question. It is a system-design
question about where generation should stop and where verified UI/runtime
logic should take over.

## Why Hybrid Lanes Matter

The Round 03 scale baseline shows that all lanes can be made contract-clean
under controlled evidence:

- 300/300 completed.
- 0 runtime errors.
- 0 metric issues.
- 0 contract failures.
- 0 contract warnings.
- P95 total latency: 11672.3 ms.
- Max total latency: 14291.6 ms.

But the intent-level distribution shows a sharp difference between lanes:

- `first_earliest_claim` and `no_evidence_refusal` are very fast because they
  are mechanically constrained.
- `more_context`, `region_period_recommendation`, `comparison`, and
  `current_object_explanation` dominate the latency tail.
- `source_rights_question` is contract-sensitive because exact rights/source
  fields should not be paraphrased or inferred by the model.

This suggests that latency and reliability should be optimized by answer lane,
not by a single prompt for all queries.

## Reporting Rule

Any lane that uses deterministic output or prefilled evidence values must be
reported as hybrid system latency, not pure Qwen generation latency.

This distinction is important:

- Pure model latency measures what the local small model generated.
- Hybrid system latency measures what the browser-local RAG assistant returned
  to the user after combining retrieval, deterministic fields, contract checks,
  and optional model generation.

Both are valid, but they answer different research questions.

## Example Lane Designs

### Example 1: Source/rights deterministic lane

User query:

```text
What are the source and rights for this record?
```

Evidence fields:

```text
record_id: SURF-EXAMPLE-R001
title: Example Poster
source: https://example.org/record/001
rights: In copyright
image_state: IMG03 metadata-only; image not downloaded
reuse_permission: No reuse permission inferred
public_domain_status: Not public domain
```

Hybrid answer:

```text
RIGHTS: In copyright
REUSE: No reuse permission inferred
PUBLIC_DOMAIN: Not public domain
SOURCE: https://example.org/record/001
IMAGE_STATE: IMG03 metadata-only; image not downloaded
```

Research interpretation:

This answer should not require free-form small-model generation. Asking the
model to restate these fields increases latency and creates avoidable risk:
the model may paraphrase "in copyright" as a permission statement, invent a
public-domain status, or omit the image-state caveat.

Metric bucket:

```text
hybrid_system_latency
```

Not:

```text
qwen_generation_latency
```

### Example 2: Hard refusal deterministic lane

User query:

```text
Was this the first poster of its kind?
```

Condition:

```text
label.refusal_expected = true
chronology_proof = absent
```

Hybrid answer:

```text
I cannot answer this question because the evidence is insufficient.
```

Research interpretation:

For refusal-expected labels, the correct behavior is not eloquent generation.
The correct behavior is stable deflection without unsupported title, date, or
first/earliest claims.

Metric bucket:

```text
hybrid_system_latency
```

If the model is asked to generate this exact sentence, that can be measured as
an additional pure-model baseline, but the product-like system should be
allowed to skip generation.

### Example 3: Research guidance lane remains generative

User query:

```text
Which records would help me compare regional public-information graphics?
```

Evidence packet:

```text
record_id, title, date_text, region, source, topology
```

Model role:

```text
Summarize useful relationships, compare records, and suggest next research
steps, while appending required evidence tags.
```

Research interpretation:

This lane benefits from the small model. The output is not a fixed field
lookup; it requires ranking, synthesis, and a research-oriented explanation.
The optimization should focus on evidence compression and length control, not
deterministic substitution.

Metric bucket:

```text
qwen_generation_latency
```

## Round 03 Next Step Sequence

The next phase should stay under Round 03 and proceed in this order.

1. Add a performance triage report for the existing 300-query run.
   - Group latency by intent.
   - Compute prompt-token versus TTFT correlation.
   - Compute output-token versus total-latency correlation.
   - Identify slow rows and repeated heavy evidence.

2. Define Round 03 optimization variants.
   - `r03_v0_baseline`: current `top3_gold_contract_source_rights` result.
   - `r03_v1_length_control`: same evidence, stricter answer length and tag
     placement.
   - `r03_v2_evidence_compress`: required-field-preserving evidence
     compression.
   - `r03_v3_hybrid_deterministic_lanes`: deterministic refusal and
     source/rights lanes, reported separately as hybrid latency.
   - `r03_v4_combined`: length control plus evidence compression plus hybrid
     deterministic lanes.

3. Run only 50-query pilots first.
   - Each pilot must keep contract fail = 0.
   - Each pilot must keep contract warn = 0 or produce explicitly reviewed
     warnings.
   - Compare TTFT, P95 latency, total latency, tokens/s, and slow-query ratio.

4. Expand only the best one or two variants to 300.
   - Do not run every variant at 300 unless the 50-query pilot shows a
     meaningful performance signal.

5. Add a quality sample.
   - Sample slow and fast cases across lanes.
   - Review faithfulness, usefulness, refusal correctness, and whether
     compression removes important research context.

## Decision

The hybrid-lane idea is worth pursuing, but it should be framed precisely:

This lab is not claiming that a 0.8B local model should generate every answer.
It is testing whether a browser-local RAG system can use a small model only
where generation adds value, while deterministic UI/runtime lanes handle exact
evidence fields and mandatory refusals. That framing is more defensible, more
useful for product design, and better aligned with the observed Round 03
latency distribution.
