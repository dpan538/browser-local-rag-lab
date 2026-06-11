# Final Artifact Index

Updated: 2026-06-11

This index separates paper-facing V3.3 artifacts from historical diagnostics,
pilot runs, and exploratory scaffolds.

## Final Controlled Condition

- condition id: `v3.3_contract_top3_300_delivered`
- browser launcher: `browser_lab/webllm_v33.html`
- main report: `reports/WEBLLM_ROUND_03_LATENCY300_V33_POSTPROCESSED_PROSE.md`
- manifest: `experiments/v3.3_contract_top3_300/manifest.json`
- delivered answers: `reports/webllm_round_03_latency300_v33_postprocessed_prose_answers.jsonl`
- browser export: `reports/webllm_round_03_latency300_v33_postprocessed_prose.json`

## Paper-Facing Evidence And Contract Reports

- `reports/GOLD_LABEL_AUDIT_300.md`
- `reports/RETRIEVAL_SUFFICIENCY_300_CONTRACT.md`
- `reports/PROMPT_AUDIT_ROUND03_300_V33.md`
- `reports/CONTRACT_ORACLE_ROUND03_300_CONTRACT.md`
- `reports/RAW_VS_DELIVERED_V33.md`
- `reports/STATISTICAL_EVIDENCE_V42.md`
- `reports/V42_EVIDENCE_CLOSURE_ANALYSIS.md`

## Automated Quality Screens

- `reports/QUALITY_FAITHFULNESS_V33_300.md`
- `reports/QUALITY_USABILITY_V33_300.md`
- `reports/HALLUCINATION_V33_300.md`
- `reports/MISREADING_V33_300.md`
- `reports/GUARDRAIL_COMPLIANCE_V33_300.md`
- `reports/FACTS_COVERAGE_V33_300.md`
- `reports/READABILITY_V33_300.md`

These screens are fast gates. They do not replace human semantic review.

## Human Review Artifacts

The paper-facing human-review artifact is the V3.3 80-row flag-first fixture:

- `reports/review_fixture_v33_300_stratified.json`
- `reports/QUALITY_REVIEW_PROTOCOL_V33.md`
- `reports/QUALITY_REVIEW_SUMMARY_V33_300.md`

The summary is pending until reviewer fields are filled. The older V4.2 50-row
fixture is exploratory and should not be mixed into final semantic-quality
claims:

- `reports/V42_HUMAN_REVIEW_RUBRIC.md`
- `reports/v42_human_review_fixture.json`

## Cross-Model And Robustness Probes

- `reports/V41_FINAL_CROSS_MODEL_RECORD.md`
- `reports/V41_300_CROSS_MODEL_SUMMARY.md`
- `reports/V41_05_1B_MODEL_COMPARISON.md`
- `reports/V42_ROBUSTNESS_EVAL.md`
- `reports/V42_ROBUSTNESS_SMOLLM2_360M.md`

Use these as supporting probes. They should not be described as a comprehensive
cross-model or adversarial benchmark.

## Paper-Hardening Docs

- `EXPERIMENT_STATUS.md`
- `CLAIMS_AND_NON_CLAIMS.md`
- `REPRODUCIBILITY.md`
- `DATA_CARD.md`
- `SOURCE_ATTRIBUTION.md`
- `MODEL_RUNTIME_CARD.md`
- `EVIDENCE_PACKET_SPEC.md`
- `ANSWER_LANE_SPEC.md`
- `CITATION.cff`

## Historical Or Diagnostic Artifacts

Round 01, Round 02, v0 fixture reports, pilot50 reports, and draft `.docx`
files remain useful for internal history and failure-mode analysis, but they
are not the final paper-facing condition unless explicitly cited from the
failure-mode section.
