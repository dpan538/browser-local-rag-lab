# Next Experiment Plan v0

## Global Rule: Provenance First

Every JSON report produced after this point should carry a root-level
`_provenance` block with:

- experiment step;
- generated timestamp;
- git commit;
- input fixture/report paths;
- packet variant;
- model/runtime identity;
- browser/device notes when available.

This prevents paper claims from becoming detached from the exact run that
produced them.

## Priority 1: Fill Real Qwen Metrics

Run the existing benchmark queries in the browser lab with the approved Qwen
runtime path enabled only for the experiment. Record cold load, warm load,
tokenization time, TTFT, total generation time, output tokens, tokens/s, and
WebGPU errors.

Success condition: at least one complete cold run and one complete warm run for
top-3 compressed packets without device failure.

Metric gate: imported WebLLM rows must include non-negative values for load,
TTFT, total latency, output tokens, tokens/s, and explicit WebGPU error state.
Missing metrics are import failures, not paper caveats.

Current implementation path:

```bash
npm run serve
```

Open `http://127.0.0.1:4177/browser_lab/webllm_round.html`, run the browser
experiment, download the exported JSON, then import it with:

```bash
npm run webllm:import -- path/to/webllm_round_01_export.json --strict
```

The import must write `WEBLLM_ROUND_01.md` and pass the generation contract
before the generated answers can be used for quality claims.

## Priority 2: Top-K And Field Ablation

Compare top 1, top 3, and top 8 packets under Assistant and Research lanes.
Keep source/rights fields in the main candidate variants. Treat no-source/rights
packets as negative controls.

Success condition: identify the smallest packet that preserves source/rights
clarity and useful guidance for each query lane.

Statistical gate: do not claim one packet is better than another from aggregate
sufficiency alone. Compare per-query pass/fail pairs with a paired test such as
McNemar or bootstrap confidence intervals. If the difference is not stable,
report it as equivalent within this seed fixture.

## Priority 3: Refusal And Chronology Review

Manually score no-evidence and first/earliest queries. These are the highest
risk categories because plausible generated text can become unsupported
historical authority.

Success condition: no model-invoked answer for no-evidence queries; no
unsupported first/earliest claims in generated answers.

Review gate: generate a structured review contract before reading answers. Each
row should show query text, expected refusal state, evidence ids, evidence
titles/dates, must-not-invent fields, and checklist items for hallucinated
title/date/source/rights and unsupported first/earliest claims.

## Priority 4: Worker And Cache Experiment

Measure main-thread vs worker execution and cold vs warm browser cache. This is
product-safe if it only instruments and isolates runtime behavior.

Success condition: reduced UI long tasks or improved perceived latency without
changing model identity or evidence policy.

Cache gate: cold runs must record an explicit cache-clearing or fresh-profile
state. Warm runs must record the prior successful load they depend on. If cache
state is ambiguous, report the result as observational rather than controlled.

## Priority 5: Research-Only Runtime Comparison

Compare Transformers.js, direct ONNX Runtime WebGPU, and WebLLM/MLC only as
research controls. The report must explicitly state that these comparisons do
not authorize a product runtime switch.

Success condition: a table of load/TTFT/tokens/s/failure tradeoffs with
migration cost and product-rule impact listed separately.

Equivalence gate: runtimes may be compared for speed only after their outputs
pass the same generation contract on the same query set. If two runtimes differ
in refusal behavior, source/rights grounding, or protected-field invention,
their latency numbers are not functionally equivalent.

## Priority 6: Quality Review Pack

Create reviewed answer fixtures:

- query;
- retrieved evidence packet;
- generated answer;
- preferred answer;
- failure label;
- latency metrics;
- reviewer notes.

Success condition: at least 30 scored answers, with separate Assistant and
Research thresholds.

Adjudication gate: hard failures are automatic. A refusal-expected label that
receives a non-refusal answer fails without discussion. Any answer asserting a
must-not-invent value not found in evidence fails without discussion. Remaining
soft disagreements can use majority vote, but must be marked `adjudicated`
rather than `natural`.

## Immediate Next Step

Run the first browser-local Qwen/WebLLM measurement round:

1. Start the static server with `npm run serve`.
2. Open `browser_lab/webllm_round.html`.
3. Probe WebGPU.
4. Load the research-only WebLLM custom Qwen model.
5. Run the 30-query top-3 compressed packet set.
6. Download the browser export.
7. Import with `npm run webllm:import -- <export.json> --strict`.
8. Read `reports/WEBLLM_ROUND_01.md` before making any quality claim.
