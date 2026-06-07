# Method v0

This lab now follows a measurement-first method:

1. Build a seed gold fixture from safe archive-derived records.
2. Label each query for intent, lane, evidence sufficiency, refusal expectation,
   required fields, non-invention fields, and gold evidence ids.
3. Run retrieval-only evidence-packet ablations before any model generation.
4. Select the smallest packet that preserves answerability, source fields,
   rights fields, topology where needed, and refusal behavior.
5. Add Qwen generation only after retrieval sufficiency is understood.
6. Decompose browser runtime metrics into cache, load, tokenization, prefill,
   TTFT, decode, total latency, and WebGPU failure classes.

## Current Seed Findings

The current seed labels are marked `seed_auto_needs_human_review`, so they are
method scaffolding rather than final paper evidence.

The first retrieval-sufficiency run suggests:

- Top-3 compressed packets with topology and source/rights fields are the best
  first fast-lane candidate.
- Top-8 packets improve evidence coverage only slightly in this seed run while
  increasing estimated prompt tokens substantially.
- Removing topology reduces required-field satisfaction for route/context
  questions.
- Removing source/rights fields breaks the rights-aware RAG contract and should
  remain a negative control.

## Next Review Task

Human-review `fixtures/gold/labels.jsonl` before using any sufficiency number as
paper evidence. Priority labels to review first:

- first/earliest claims;
- source/rights questions;
- no-evidence refusals with active object context;
- method/process questions, which currently need method-context fixture records.
