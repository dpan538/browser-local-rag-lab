# Method v0

This lab now follows a measurement-first method:

1. Build a seed gold fixture from safe archive-derived records.
2. Label each query for intent, lane, evidence sufficiency, refusal expectation,
   required fields, non-invention fields, and gold evidence ids.
3. Scan cited evidence health and method-context boundaries before trusting the
   label set.
4. Run retrieval-only evidence-packet ablations before any model generation.
5. Select the smallest packet that preserves answerability, source fields,
   rights fields, topology where needed, and refusal behavior.
6. Add Qwen generation only after retrieval sufficiency is understood.
7. Validate generated answers against the same label contract before any
   qualitative reading.
8. Decompose browser runtime metrics into cache, load, tokenization, prefill,
   TTFT, decode, total latency, and WebGPU failure classes.

## Current Seed Findings

The current seed labels are method scaffolding rather than final paper evidence.
They should be promoted only after protocol review, not through preference-style
blind testing.

The first retrieval-sufficiency run suggests:

- Top-3 compressed packets with topology and source/rights fields are the best
  first fast-lane candidate: current sufficiency is 0.933 with an estimated
  844 prompt tokens.
- Top-8 packets do not improve sufficiency over top-3 in this run while
  increasing estimated prompt tokens substantially.
- Removing topology reduces required-field satisfaction for route/context
  questions.
- Removing source/rights fields breaks the rights-aware RAG contract and should
  remain a negative control.

## Adjudication Protocol v0

The lab separates label review from answer preference. A label can be stable by
rule when the fixture makes the expected behavior deterministic: answerable
queries must have field-level evidence; unsupported first/earliest and missing
route requests become explicit refusal labels.

The first label audit reports:

- 30 total benchmark labels.
- 30 stable by rule after field-level evidence checks.
- 0 requiring method review.
- 0 fail findings after label-contract repair.
- 0 warning findings in the current run.
- 1 anomaly warning: `SURF-GAX1970R001` is intentionally but heavily reused in
  the seed labels.
- 0 rule-config fail findings.
- 100% empty-retrieval integrity for true no-evidence refusal rows.

Stable-by-rule labels cover orientation, current-object explanation,
source/rights questions, no-evidence refusals, casual archive help,
comparisons, method-process questions, active-object context requests, and
region-period routes. Unsupported first/earliest claims and unavailable
region-period routes are stable refusal cases. The source/rights lane includes
explicit conservative `rights_interpretation` slots for reuse and public-domain
claims.

This means the next evaluation step is not personal blind judging. The label
contract is ready for controlled generation and runtime experiments:

1. Keep strict label audit as a preflight gate.
2. Run evidence health and method-context scans before every generation
   benchmark.
3. Run retrieval sufficiency before every generation benchmark.
4. Generate Qwen fast/research answers only from packets that pass the contract.
5. Validate generated answers with `validate_generation_contract.mjs`.
6. Judge generated answers against faithfulness, non-invention, refusal
   correctness, and useful research guidance.

## Post-Generation Contract

Generated answers are evaluated after, not during, label adjudication. The
generation contract checks whether an answerable label was refused, whether a
refusal label leaked protected field values, and whether explicit protected
field assertions can be matched to cited evidence. This is an automated screen;
expert reading still decides whether the answer is useful research guidance.

## Regression Guard

Rule changes should be compared against the previous audit JSON. A label that
moves from `STABLE_BY_RULE` to `NEEDS_HUMAN_REVIEW` or `FAIL` is a regression
unless the change was intentional and documented. Label changes can also be
exported as CSV so evidence-id additions/removals and refusal flips are visible
in review.

## Next Review Task

No label-contract repair is currently pending. The next repair task is to add
new fixture coverage only if the paper needs unsupported cases to become
answerable, such as Japan/1960s or twentieth-century Russia/Soviet routes.
