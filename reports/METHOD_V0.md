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

The current seed labels are method scaffolding rather than final paper evidence.
They should be promoted only after protocol review, not through preference-style
blind testing.

The first retrieval-sufficiency run suggests:

- Top-3 compressed packets with topology and source/rights fields are the best
  first fast-lane candidate.
- Top-8 packets improve evidence coverage only slightly in this seed run while
  increasing estimated prompt tokens substantially.
- Removing topology reduces required-field satisfaction for route/context
  questions.
- Removing source/rights fields breaks the rights-aware RAG contract and should
  remain a negative control.

## Adjudication Protocol v0

The lab now separates label review from answer preference. A label can be
stable by rule when the archive record itself makes the expected behavior
deterministic. Labels that require synthesis, chronology, recommendation, or
method-context evidence enter a method-review queue.

The first label audit reports:

- 30 total benchmark labels.
- 16 stable by rule.
- 14 requiring method review.
- 0 fail findings.
- 2 warnings, both on method/process questions that currently have insufficient
  evidence without an explicit refusal lane.

Stable-by-rule labels cover orientation, current-object explanation,
source/rights questions, no-evidence refusals, and casual archive help. Review
queue labels cover first/earliest claims, comparisons, region-period
recommendations, method/process questions, and more-context requests.

This means the next evaluation step is not personal blind judging. It is a
protocol pass over the review queue:

1. Decide whether the fixture contains enough evidence for the query.
2. If yes, write the minimal required evidence ids and non-invention fields.
3. If no, mark `expected_refusal` or add a small method-context fixture record.
4. Re-run retrieval sufficiency before measuring Qwen generation.

## Next Review Task

Protocol-review `fixtures/gold/labels.jsonl` before using any sufficiency number
as paper evidence. Priority labels to review first:

- first/earliest claims;
- comparison and region-period recommendation questions;
- method/process questions, which currently need method-context fixture records
  or explicit refusal expectations;
- more-context questions that depend on active-object state.
