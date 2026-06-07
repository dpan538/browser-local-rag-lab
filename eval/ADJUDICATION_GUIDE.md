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
- Cited evidence health scan: `scripts/evidence_health_check.mjs`.
- Method-context boundary scan: `scripts/validate_method_context.mjs`.
- Retrieval sufficiency measurement: `scripts/evaluate_retrieval_sufficiency.mjs`.
- Quality dashboard: `scripts/quality_metrics.mjs`.
- Post-generation contract validation:
  `scripts/validate_generation_contract.mjs`.
- Audit regression comparison: `scripts/regression_test.mjs`.
- Label change CSV: `scripts/label_change_log.mjs`.
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
   - cited evidence health findings;
   - method-context boundary findings;
   - retrieval sufficiency, field coverage, and negative-control degradation.

Generated answers add a fourth layer:

4. Post-generation contract validation:
   - answerable labels must not produce refusals;
   - refusal labels must refuse or request narrower context;
   - protected field assertions must be supported by cited evidence;
   - required fields that are not visibly grounded become review warnings.

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
- `first_earliest_claim` is a stable refusal unless the cited evidence includes
  an explicit chronology proof and `first_or_earliest_claim`.
- If a route, comparison, or context request lacks enough evidence to satisfy
  its required fields, it must become `refusal_more_context`.
- If an answerable label has intent-specific `must_not_invent_fields`, those
  fields must exist in the cited gold evidence. Otherwise the label must refuse
  or the fixture must be repaired.
- `no_evidence_refusal` queries are expected to have empty retrieval in every
  packet variant. This is reported as `empty_retrieval_integrity` in quality
  metrics.

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
| `first_earliest_claim` | none when refusal; `record_id`, `title`, `date_text`, `source`, `first_or_earliest_claim` when answerable |
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

The stable-rule field set must cover every answerable required field for that
intent. `scripts/audit_gold_labels.mjs --strict` runs a rule-config scan and
fails if `STABLE_RULE_REQUIRED_FIELDS` leaves a gap against
`REQUIRED_FIELDS_BY_INTENT`.

| Intent | Stable condition |
|---|---|
| `archive_orientation` | topology/context evidence exists |
| `casual_archive_help` | topology/context evidence exists |
| `current_object_explanation` | answerable: active object evidence has object id, title, date, region, and source; refusal: those fields are not jointly available |
| `source_rights_question` | answerable: object id, title, source, rights, image-state, reuse permission, and public-domain status are present; refusal: source/rights/image-state support is missing or cannot be conservatively interpreted |
| `comparison` | answerable: at least two named records are cited and each has object id, title, and source support; refusal: fewer than two complete records are available |
| `region_period_recommendation` | answerable: multiple records match the requested region/period and each has object id, title, date, region, and source; refusal: coverage is absent |
| `method_process_question` | the research-only method context fixture record is cited |
| `more_context` | active object plus related context records are cited, or the label is a stable refusal |
| `first_earliest_claim` | refusal: no chronology proof; answerable: chronology proof and `first_or_earliest_claim` are explicitly present |
| `no_evidence_refusal` | stable refusal |

The current seed fixture includes `LAB-METHOD-CONTEXT-V0` as a research-only
method record. It is not archive object evidence.

Method records may carry `record_id`, `title`, `source`, and `rights` so the
same packet code can cite them, but they must remain explicitly typed as
`object_type=method_context`, `topology.publication_role=method_context`,
`rights.state=research_fixture`, and `image_state.code=IMG00`. A method record
used by a non-method label is a hard failure.

## Severity Rules

Fail:

- unknown intent or lane;
- illegal intent-lane pair;
- `sufficient_context=false` without `refusal_expected=true`;
- missing gold evidence id;
- missing required field in label or evidence;
- comparison with fewer than two evidence records;
- answerable route with fewer than two route records.
- answerable first/earliest claim without chronology proof;
- rule config gap between required fields and stable-rule fields;
- evidence overuse above the fail threshold.
- method context used as archive object evidence;
- cited evidence missing source, rights, image-state, title, or text/method
  context;
- generated answer asserts a protected field value not found in evidence.

Warning:

- query-text heuristic does not match the labeled intent;
- evidence id is unusually overused;
- comparison evidence is not lightly named by the query text;
- route evidence appears outside the requested region or period;
- cited evidence has unknown creator, unresolved region, or rights-review
  state;
- generated answer does not visibly include an evidence value for a required
  field;
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
- `anomaly_fail_count`: dataset-shape defects that block strict mode.
- `rule_config_fail_count`: rule-table inconsistencies that block strict mode.
- `empty_retrieval_integrity`: percentage of no-evidence refusal retrieval
  rows that returned no records.

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
- anomaly: `SURF-GAX1970R001` is reused in 9/30 labels and remains a warning at
  the 30% threshold;
- anomaly fail findings: 0;
- rule config fail findings: 0;
- empty retrieval integrity: 100%;
- best first candidate packet: top-3 compressed with topology and source/rights;
- current top-3 sufficiency: 0.933.

These numbers describe the label contract and retrieval packet behavior. They
do not validate generated Qwen answers.

## Required Commands

After changing fixture generation, labels, rules, or retrieval logic, run:

```bash
npm run gold:build
npm run evidence:health:strict
npm run method:context:strict
npm run audit:labels:strict
npm run gold:sufficiency
npm run audit:quality
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

Use the full local gate when changing labels, rules, or retrieval logic:

```bash
npm run audit:full
```

After Qwen answers are generated into a JSONL file with `query_id` and
`answer_text` or `generated_text`, run:

```bash
npm run generation:contract -- path/to/answers.jsonl --strict
```

When changing rule tables, compare the previous audit JSON with the new audit
JSON:

```bash
npm run audit:regression -- reports/baseline_audit.json reports/gold_label_audit_v0.json
```

## New Query Or Rule Evolution

New query types should enter as explicit review cases before they become stable
rules.

1. Add the query and provisional label with conservative refusal if evidence is
   incomplete.
2. Run `npm run audit:full`.
3. If the label becomes `NEEDS_HUMAN_REVIEW`, decide whether the case is a true
   exception or a repeatable pattern.
4. For repeatable patterns, update `INTENT_LANE_MAP`,
   `REQUIRED_FIELDS_BY_INTENT`, `STABLE_RULE_REQUIRED_FIELDS`, and any
   intent-specific evidence checks together.
5. Re-run the full gate until strict audit has no fail findings and no
   rule-config failures.
