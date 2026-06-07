# Gold Label Adjudication Guide v1

This guide defines the executable adjudication protocol for
`fixtures/gold/*.jsonl`. It is a label-quality system, not a blind answer
preference test. The purpose is to decide whether each benchmark query has a
deterministic evidence/refusal contract before any Qwen generation or runtime
measurement is trusted.

Generated model text is never archive evidence. It is an experimental output
judged against the evidence packet.

## Review Unit

Each adjudication unit contains:

- one query from `fixtures/gold/queries.jsonl`;
- one label from `fixtures/gold/labels.jsonl`;
- zero or more evidence records from `fixtures/gold/records.jsonl`;
- the label's `required_fields`, `must_not_invent_fields`, `gold_lane`,
  `sufficient_context`, `refusal_expected`, and `gold_evidence_ids`.

The reviewer or script evaluates the contract among those fields. It does not
judge a generated answer.

## Automation Layers

The current implementation uses Node scripts rather than Python:

- Rule configuration: `scripts/audit_rules.mjs`.
- Structural and logical audit: `scripts/audit_gold_labels.mjs`.
- Retrieval sufficiency measurement: `scripts/evaluate_retrieval_sufficiency.mjs`.
- Fixture generation: `scripts/build_gold_fixture.mjs`.

The adjudication pipeline has three layers.

1. Structural validation:
   - query and label records must contain required keys with expected types;
   - intents and lanes must be known;
   - gold evidence ids must resolve to fixture records.

2. Logical contract audit:
   - intent and lane must form a legal pair;
   - `sufficient_context=false` requires `refusal_expected=true`;
   - required fields must exist in the label and in the cited evidence packet;
   - stable rules must be checked against evidence fields, not intent names
     alone.

3. Quality metrics and anomaly detection:
   - stable-by-rule rate;
   - fail and warning counts;
   - review-queue size;
   - evidence overuse anomalies;
   - retrieval sufficiency, field coverage, and negative-control degradation.

## State Model

Each label is classified into one of three states:

- `STABLE_BY_RULE`: the contract passes structural checks, logical checks, and
  the intent-specific stable rule.
- `FAIL`: the label has a hard contradiction or missing evidence/field needed
  for its own contract.
- `NEEDS_HUMAN_REVIEW`: no hard failure, but the rule table does not yet define
  a deterministic evidence/refusal contract for that case.

The target for this seed lab is `FAIL=0`. A zero review queue means the current
fixture is ready for retrieval and controlled generation experiments; it does
not mean the benchmark is final paper evidence.

## Intent And Lane Rules

Legal lanes are:

- `help`: orientation or navigation guidance.
- `fast_answer`: bounded object-level factual answer.
- `source_rights`: source, rights, image-state, and reuse caveat.
- `research_answer`: comparison, route, method, or broader context answer.
- `refusal_more_context`: unsupported claim, insufficient evidence, rights
  upgrade, or request that needs narrower context.

Current legal intent-lane pairs are encoded in `INTENT_LANE_MAP`:

| Intent | Legal lanes |
|---|---|
| `archive_orientation` | `help` |
| `casual_archive_help` | `help` |
| `current_object_explanation` | `fast_answer`, `refusal_more_context` |
| `source_rights_question` | `source_rights`, `refusal_more_context` |
| `comparison` | `research_answer`, `refusal_more_context` |
| `region_period_recommendation` | `research_answer`, `refusal_more_context` |
| `method_process_question` | `research_answer`, `refusal_more_context` |
| `more_context` | `research_answer`, `refusal_more_context` |
| `first_earliest_claim` | `research_answer`, `refusal_more_context` |
| `no_evidence_refusal` | `refusal_more_context` |

Illegal intent-lane pairs are hard failures.

## Evidence And Refusal Locks

These rules are non-negotiable:

- `sufficient_context=false` implies `refusal_expected=true`.
- A refusal label may still retrieve related records; refusal is a generation
  gate, not necessarily an empty-search requirement.
- `no_evidence_refusal` must use `refusal_more_context`.
- `first_earliest_claim` is a stable refusal unless a separate chronology-proof
  fixture is introduced.
- If a route, comparison, or context request lacks enough evidence to satisfy
  its required fields, it must become `refusal_more_context`.

## Required Fields

Required fields are answer slots that must be present in the evidence packet.
They are checked by `REQUIRED_FIELDS_BY_INTENT`.

| Intent | Required fields when answerable |
|---|---|
| `archive_orientation` | `topology` |
| `casual_archive_help` | `topology` |
| `current_object_explanation` | `record_id`, `title`, `date_text`, `region`, `source` |
| `source_rights_question` | `record_id`, `title`, `source`, `rights`, `image_state`, `reuse_permission`, `public_domain_status` |
| `comparison` | `record_id`, `title`, `source` |
| `region_period_recommendation` | `record_id`, `title`, `date_text`, `region`, `source` |
| `method_process_question` | `method_context` |
| `more_context` | `record_id`, `title`, `date_text`, `region`, `source`, `topology` |
| `first_earliest_claim` | none when refusal; chronology proof required if answerable |
| `no_evidence_refusal` | none |

Source/rights labels satisfy `reuse_permission` and `public_domain_status`
through conservative `rights_interpretation` fields derived from source rights
metadata and image-state. They must not be inferred by the model.

## Must-Not-Invent Fields

Every label protects fields where hallucination would break archive trust:

- `title`;
- `creator`;
- `date`;
- `source`;
- `rights`.

Intent-specific additions:

- `first_earliest_claim`: `first_or_earliest_claim`;
- `source_rights_question`: `reuse_permission`, `public_domain_status`.

Global must-not-invent fields are protection rules: if an answer mentions them,
it must be grounded. They are not automatically required output slots for every
intent. Intent-specific protected fields are stricter and are checked against
the required-field contract unless the label is an explicit refusal.

## Stable Rules

Stable-by-rule requires both a valid label contract and field-level evidence.
It is never assigned from the intent string alone.

| Intent | Stable condition |
|---|---|
| `archive_orientation` | topology/context evidence exists |
| `casual_archive_help` | topology/context evidence exists |
| `current_object_explanation` | active object evidence has object id, title, date, region, and source |
| `source_rights_question` | source, rights, image-state, and conservative rights interpretation are present |
| `comparison` | at least two named records are cited and each has title/source support |
| `region_period_recommendation` | multiple records match the requested region/period, or the label is a stable refusal because coverage is absent |
| `method_process_question` | the research-only method context fixture record is cited |
| `more_context` | active object plus related context records are cited, or the label is a stable refusal |
| `first_earliest_claim` | stable refusal unless chronology proof is explicitly added |
| `no_evidence_refusal` | stable refusal |

The current seed fixture includes `LAB-METHOD-CONTEXT-V0` as a research-only
method record. It is not archive object evidence.

## Severity Rules

Fail:

- unknown intent or lane;
- illegal intent-lane pair;
- `sufficient_context=false` without `refusal_expected=true`;
- missing gold evidence id;
- missing required field in label or evidence;
- comparison with fewer than two evidence records;
- answerable route with fewer than two route records.

Warning:

- query-text heuristic does not match the labeled intent;
- evidence id is unusually overused;
- non-typical but legal configuration that may deserve later inspection.

Needs human review:

- no hard failure, but no deterministic rule exists yet.

## Quality Metrics

The audit report should be read as a small quality dashboard:

- `stable_by_rule / label_count`: automatic pass rate.
- `fail_count`: hard label-contract defects.
- `warn_count`: non-blocking risk signals.
- `needs_human_review`: uncovered rule surface.
- `anomaly_count`: dataset-shape warnings.

The retrieval sufficiency report adds:

- sufficiency rate;
- evidence coverage rate;
- required-field coverage rate;
- refusal-gate correctness;
- empty-retrieval correctness for true no-evidence refusals;
- prompt-token estimate.

The expected negative controls are:

- removing topology should degrade route/context questions;
- removing source/rights should degrade source/rights questions;
- top-8 should be justified only if it improves sufficiency enough to offset
  prompt-token cost.

## Current Baseline

As of the current seed fixture:

- labels: 30;
- stable by rule: 30;
- needs human review: 0;
- fail findings: 0;
- warning findings: 0;
- anomaly: `SURF-GAX1970R001` is heavily reused in seed labels;
- best first candidate packet: top-3 compressed with topology and source/rights;
- current top-3 sufficiency: 0.933.

These numbers describe the label contract and retrieval packet behavior. They
do not validate generated Qwen answers.

## Required Commands

After changing fixture generation, labels, rules, or retrieval logic, run:

```bash
npm run gold:build
npm run audit:labels:strict
npm run gold:sufficiency
git diff --check
```

Also run the repository safety scan before commit. Keep the scan pattern outside
this document so the guide does not trigger the scanner by quoting sensitive
terms.

## Promotion Rule

A label set may be used for controlled generation experiments only when:

- strict audit exits successfully;
- `FAIL=0`;
- any remaining review queue is explicitly accepted or resolved;
- retrieval sufficiency has been regenerated after the latest label changes.

Generated model answers must then be evaluated separately for faithfulness,
non-invention, refusal correctness, and useful research guidance.
