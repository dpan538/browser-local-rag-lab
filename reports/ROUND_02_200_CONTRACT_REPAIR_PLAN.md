# Round 02 200 Contract Repair Plan

Generated: 2026-06-08

## Diagnosis

The first 200-query WebLLM run completed at runtime level, but the quality gate
correctly blocked it:

- Runtime rows: 200/200 completed
- Runtime errors: 0
- Contract failures: 61
- Contract warnings: 146

The initial hypothesis was that prompt templates did not generalize from the
30-query seed set. That was partly true, so the browser runner now uses a
single contract-aware prompt builder with mandatory intent-to-template mapping.

However, a stricter pre-model oracle check shows a second issue: some retrieved
packets do not align with the gold evidence contract. Prompt repair alone cannot
fix those rows.

## Implemented Repair

1. Added `scripts/prompt_builder.mjs`.
   - Hard refusal rows use the exact refusal phrase.
   - Source/rights rows use strict `RIGHTS`, `REUSE`, and `PUBLIC_DOMAIN`
     tags.
   - All answerable rows include an `EVIDENCE TAGS:` block.
   - Browser output now preserves `model_answer_text` and writes
     deterministic contract fields into `answer_text`.

2. Added prompt preflight tooling.
   - `npm run prompts:build:200`
   - `npm run prompts:audit:200`
   - `npm run round2:preflight:200`

3. Added `scripts/contract_oracle_check.mjs`.
   - This creates deterministic answers from the retrieved packet without
     loading WebLLM.
   - It then runs the same generation contract validator.
   - If this fails, a WebLLM rerun cannot pass by prompt engineering alone.

4. Added browser runner query filtering.
   - Add `queryIds=BQ129,BQ130` to the browser URL to run a targeted subset.
   - This supports fast repair smoke tests before a full 200 rerun.

## Current Gate Results

Prompt and token gates now pass:

- Prompt audit rows: 200
- Prompt audit failures: 0
- Token-budget failures: 0
- Max estimated prompt tokens: 1250
- Average estimated prompt tokens: 547.7

The oracle gate on the original top-3 retrieval packet currently blocks a
WebLLM rerun:

- Rows checked: 200
- Gold coverage failures: 49
- Contract failures: 27
- Contract warnings: 59
- Ready for WebLLM rerun: no

The label/evidence alignment audit clarifies the layer:

- Gold-evidence fail issues: 0
- Retrieval-packet fail issues: 50
- Primary code: `retrieval_missing_gold_evidence` (49)
- Secondary code: `required_field_missing_in_retrieval` (1)

Therefore the gold labels are internally field-complete; the original top-3
retrieval packet is the failing layer.

Failure concentration:

- `region_period_recommendation`: BQ129-BQ146 account for the hard contract
  failures.
- `archive_orientation` and `casual_archive_help`: topology coverage is not
  aligned with the current gold contract.
- `more_context`: multiple expansion rows retrieve generic context instead of
  the gold context records.

## Interpretation

The 200-query run is still useful as a negative result: it proves the gate can
catch prompt and retrieval drift at scale. The next step is not another full
WebLLM run. The next step is to repair retrieval/gold alignment or relabel
ambiguous orientation/help contracts, then require the oracle gate to pass.

## Controlled Contract Variant

A research-only retrieval variant was added:

- Variant: `top3_gold_contract_source_rights`
- Output: `reports/retrieval_sufficiency_200_contract.json`
- Rows with injected gold evidence: 49
- Total injected gold IDs: 76

This variant is not a product retrieval path. It is a controlled evidence
condition for testing generation behavior when the contract evidence is actually
present.

Controlled variant gates now pass:

- Prompt audit: 200 rows, 0 failures
- Token preflight: 0 failures, max estimated prompt tokens 1299
- Alignment audit: 0 issues
- Contract oracle: 0 failures, 0 warnings
- Ready for WebLLM rerun: yes

## Next Protocol

1. Keep the failed 200 runtime report as the baseline drift finding.
2. For retrieval research, repair `region_period_recommendation` retrieval for
   BQ128-BQ146.
3. Decide whether orientation/help rows require exact gold evidence IDs or only
   topology-class evidence.
4. Repair `more_context` gold/retrieval alignment for BQ161-BQ176.
5. Run:

```bash
npm run prompts:audit:200
npm run round2:preflight:200
npm run contract:oracle:200
npm run retrieval:contract:200
npm run audit:alignment:200:contract
npm run contract:oracle:200:contract
```

6. For generation research, use the controlled contract variant first.
7. Run a Codex in-app browser smoke test with `limit=1`.
8. Then run targeted `queryIds=` subsets if needed.
9. Only then run the full 200-query WebLLM controlled-condition round.

## Browser Runtime Note

The Codex in-app browser successfully loaded the controlled 200-query lab page
and probed WebGPU as available:

- Page: `webllm_round_02_200_contract_iab_smoke`
- Query count loaded: 200
- Record count loaded: 54
- WebGPU probe: `available`

Future long runs should prefer the in-app browser over the user's main Chrome
profile. This will still consume GPU/CPU, but it avoids occupying Chrome
windows, tabs, and profile-level cache state while the experiment runs.
