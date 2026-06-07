# Round 02 200-Query Expansion Plan

Generated: 2026-06-07

## Position

Round 02 remains the current repair-and-scale round. The next test expands the
benchmark target from 30 to 200 queries, but the expansion is gated. The project
must not dilute a contract-passing 30-query seed with weak labels that have not
received the same evidence, refusal, rights, and review treatment.

This is still research-only infrastructure. It does not modify the archive
product runtime, Assistant UI, scraping, ingestion, evidence policy, or rights
policy.

## Stage 1: Close The 30-Query Baseline

Round 02 is a valid repair result because it produced:

- 30/30 completed WebLLM rows;
- 0 runtime errors;
- 0 generation-contract failures;
- 8 generation-contract warnings;
- large prompt and latency reductions relative to Round 01.

It is not yet a fully reviewed benchmark fixture. The 30 seed labels still carry
seed review states, and the generated answers need a human review fixture before
paper-quality answer claims.

Required closure steps:

1. Run the review sheet:

   ```bash
   npm run round2:review-sheet
   ```

2. Review high-priority rows first. The review sheet automatically marks rows
   with visible required fields as `reviewed_candidate` and rows with implicit
   or missing fields as `needs_field_visibility_review`.
3. Build the editable review fixture:

   ```bash
   npm run review:fixture
   ```

4. Resolve or adjudicate the 8 remaining field-visibility warnings by editing
   only `reviewer_decision` and `reviewer_notes` in
   `reports/review_fixture_round_02.jsonl`.
5. Validate and export reviewed answers:

   ```bash
   npm run review:apply
   ```

6. Mark reviewed labels/answers explicitly rather than inferring review from
   `FAIL=0`.

Exit condition: 30 reviewed answers, no automatic hard failures, and all
remaining soft warnings either corrected or explicitly adjudicated.

For label review-state closure, first run a dry run:

```bash
npm run labels:promote
```

By default this proposes `stable_rule_reviewed`, not `human_reviewed`. Use
`--execute` only after accepting the deterministic audit as sufficient for label
contract review. If a human has actually reviewed the labels, the target state
can be made explicit:

```bash
npm run labels:promote -- --state human_reviewed --execute
```

## Stage 2: Expand In Audited Batches

The target is 200 total queries, so the current fixture needs 170 additional
queries. They should be added in batches of up to 50:

- Batch A: 31-80
- Batch B: 81-130
- Batch C: 131-180
- Batch D: 181-200

Each batch must include:

- query JSONL rows;
- label JSONL rows;
- gold evidence ids;
- sufficient/refusal labels;
- required fields;
- must-not-invent fields;
- explicit review state.

Do not add generated answers as evidence. Generated answers remain experiment
outputs only.

If a batch requires new evidence records, validate the proposed records before
merging them into the gold fixture:

```bash
npm run records:validate-new -- fixtures/expansion/new_records.jsonl --strict
```

This checks record-id collisions, baseline source/rights/image-state fields,
placeholder values, and method-context schema consistency.

## Query Mix Guidance

New queries should be generated from the existing fixture records or from
review-safe additional records. The batch should avoid mechanical paraphrase
inflation.

Recommended target mix for 200:

| Intent | Target count | Purpose |
|---|---:|---|
| archive_orientation | 16 | Orientation and structure help |
| casual_archive_help | 16 | Low-friction user assistance |
| current_object_explanation | 28 | Fast object explanation |
| source_rights_question | 24 | Rights/source lane pressure |
| comparison | 28 | Multi-record synthesis |
| region_period_recommendation | 24 | Research guidance |
| method_process_question | 16 | Method and evidence-policy explanation |
| more_context | 18 | Ambiguous/context-seeking behavior |
| first_earliest_claim | 15 | Chronology refusal and proof handling |
| no_evidence_refusal | 15 | No-evidence refusal behavior |

These are planning targets, not hard quotas. The scale readiness gate will warn
if a single intent exceeds 40% of the current label set.

## Label Scaffolding

Use the label suggestion helper to draft, not approve, new labels:

```bash
npm run labels:suggest -- \
  --query-id BQ31 \
  --query-text "Compare the typography records around 1830 and 1835." \
  --intent comparison \
  --evidence SURF-GAX1970R002,SURF-GAX1970R003
```

The output contains a query row, label row, and diagnostics. A human reviewer
must inspect the suggested intent, lane, evidence ids, required fields, and
refusal state before the row is appended to the benchmark.

## Batch Gate

After each batch:

```bash
npm run audit:full
npm run round2:scale-readiness
```

The full audit now also runs:

```bash
npm run audit:anomalies
```

The anomaly scan adds runtime behavior, evidence-label alignment, review-state,
evidence-value, and intent-distribution checks on top of the deterministic label
audit.

If an earlier audit report is archived, compare it with:

```bash
npm run audit:regression -- reports/baseline_audit.json reports/new_audit.json
```

Batch acceptance requires:

- gold-label audit fail count = 0;
- review queue = 0 for rows promoted into the benchmark;
- retrieval sufficiency remains explainable by packet variant;
- no evidence id is overused beyond the configured threshold without review;
- no existing reviewed row regresses;
- Qwen/WebLLM generation contract has no hard failures for the batch.

To keep batches balanced by intent, first split proposed new queries:

```bash
npm run queries:split-batches -- fixtures/expansion/new_queries.jsonl --batch-size 50
```

The splitter uses the current gold label intent distribution as the baseline
and writes a batch plan under `reports/`.

## Current Decision

Run the scale readiness gate after generating the Round 02 review sheet:

```bash
npm run round2:review-sheet
npm run round2:scale-readiness
```

The expected current decision is "not ready" because the 30-query baseline still
requires human review closure. That is a useful guardrail, not a failure of the
runtime experiment.

The readiness gate now has three states:

- `ready`: no hard blockers and no soft blockers;
- `conditional`: no hard blockers, but evidence diversity or distribution
  issues require a written plan before scaling;
- `blocked`: review, audit, runtime, or contract closure is incomplete.
