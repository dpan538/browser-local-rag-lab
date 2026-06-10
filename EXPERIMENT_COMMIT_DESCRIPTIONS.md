# Experiment Commit Descriptions

Generated on 2026-06-10.

This file is a corrective reviewer-facing log for recent experiment commits that were pushed with short subjects only. It does not rewrite already-pushed Git history. Instead, it records the purpose, main changes, validation evidence, and reviewer-facing significance for each commit so collaborators can audit the experiment sequence without relying on chat history.

Going forward, experiment commits must include a descriptive commit body with:

1. Purpose of the change.
2. Main implementation or data changes.
3. Validation results, including sample size and fail/warn counts when relevant.
4. Known limitations or the next decision enabled by the commit.

Runtime result commits should state the variant, query count, completion count, contract fail/warn counts, important latency metrics, and whether quality gates passed. Cache-bust and infrastructure commits should state the stale-cache or runner issue they protect against.

## Recent Commit Descriptions

### `9113537` - research: prepare v4.1 cross-model validation

Purpose: Prepare the V4.1 cross-model validation and robustness work without changing the V3.3 benchmark results.

Main changes: Added a universal packet exporter for model-independent evaluation, generated pilot50 and 300-query universal packet files, created a V4.1 robustness mini-set, and added a failure-mode report that organizes the evidence for why each system layer is necessary.

Validation: Generated `reports/v41_universal_packets_pilot50.json` and `reports/v41_universal_packets_300.json`, verified the prompts do not contain Qwen-specific wording, generated `fixtures/robustness/v41_miniset/*`, and produced `reports/retrieval_sufficiency_v41_robustness.json`.

Reviewer note: This commit establishes the scaffolding for cross-model and robustness validation before introducing another runtime or model dependency.

### `f7b4663` - research: run v3.3 latency300 postprocessed prose

Purpose: Record the full 300-query V3.3 run after the pilot passed.

Main changes: Added the raw WebLLM export, answers JSONL, import report, gate report, performance stratification, contract validation, and quality reports for `r03_v33_postprocessed_prose`. Improved the guardrail compliance logic to avoid false positives for evidence-quoted absolute terms and ordinal phrases such as listed-first language.

Validation: 300/300 rows completed, runtime errors 0, stream cutoffs 0, contract fail/warn 0/0. The run contained 109 deterministic rows and 191 Qwen generation rows. All-row average total latency was about 1.59 seconds, Qwen-only average total latency was about 2.49 seconds, Qwen P95 was about 4.19 seconds, and slow rows over 10 seconds were 0. Quality gates passed for faithfulness, usability, hallucination, misreading, guardrail compliance, facts coverage, and readability.

Reviewer note: This is the main evidence commit for the V3.3 claim that postprocessed prose can keep V3.1-like speed while recovering V3.2-like caution.

### `810a77c` - research: run v3.3 pilot50 postprocessed prose

Purpose: Gate V3.3 on a 50-query pilot before allowing a full 300-query run.

Main changes: Added the pilot50 WebLLM export, answers, import report, gate, performance report, and quality reports for `r03_v33_postprocessed_prose`.

Validation: 50/50 rows completed with contract fail/warn 0/0. The pilot contained 14 deterministic rows and 36 Qwen generation rows. Qwen average total latency was about 3.08 seconds, Qwen P95 was about 6.06 seconds, and slow rows over 10 seconds were 0. Strict quality gates passed.

Reviewer note: This pilot justified proceeding to the full 300-query V3.3 run.

### `a94c617` - research: add v3.3 readability fallback

Purpose: Fix V3.3 finalizer edge cases where a generated body passed contract validation but failed readability due to too-short text or long single-sentence prose.

Main changes: Added a fallback body for too-short model generations, added a readability fallback body after polishing, and bumped browser module cache versions so the in-app browser would load the updated finalizer.

Validation: Offline replay showed usability passing with `too_short_count=0` and readability passing with `flagged_count=0`.

Reviewer note: This makes V3.3 less dependent on the model naturally producing well-shaped prose while preserving the model-independent postprocessing design.

### `0e616d6` - research: bust v3.3 html module cache

Purpose: Force the in-app browser to load the latest V3.3 runner module after stale JavaScript was retained by the browser/Electron module cache.

Main changes: Bumped the HTML module query version.

Validation: Preparatory cache invalidation for the next run.

Reviewer note: Infrastructure-only commit. It exists to protect experimental correctness, not to change the research method.

### `96e1d2f` - research: bust v3.3 finalizer cache

Purpose: Force the browser runner to import the updated prompt builder and answer finalizer.

Main changes: Bumped the prompt builder module import query.

Validation: Preparatory cache invalidation for the next run.

Reviewer note: Infrastructure-only commit needed because stale cached modules had previously hidden finalizer changes.

### `0b71f12` - research: enforce v3.3 final readability split

Purpose: Strengthen postprocessing so long sentences are split after polishing and before evidence tag injection.

Main changes: Added final sentence splitting and finalizer enforcement in the V3.3 path.

Validation: Addressed pilot readability failures involving long single-sentence answers.

Reviewer note: Moves readability control from prompt compliance into deterministic postprocessing, which is central to the V3.3 design.

### `042dca3` - research: bust v3.3 browser module cache

Purpose: Ensure the browser reloads updated V3.3 finalizer and prose-polishing code.

Main changes: Bumped browser module cache versions.

Validation: Preparatory cache invalidation for the next run.

Reviewer note: Infrastructure-only commit to prevent stale browser modules from contaminating the experiment.

### `9be096a` - research: split long v3.3 polished prose

Purpose: Improve the readability of polished V3.3 answers without reintroducing prompt-heavy guardrails.

Main changes: Added deterministic sentence splitting for common long-clause forms created by the prose polisher.

Validation: Reduced long-sentence readability flags in V3.3 pilot replays.

Reviewer note: Supports the central V3.3 claim: quality control should be handled by a fast, inspectable postprocessor rather than by complex negative prompting.

### `3533351` - research: add webllm stream stall cutoff

Purpose: Prevent the WebLLM runner from hanging indefinitely when stream output stalls.

Main changes: Added first-token timeout handling, token-stall timeout handling, and run metadata fields for stream chunk counts and cutoff reasons.

Validation: Subsequent V3.3 pilot and full runs reported stream cutoffs as 0, confirming the final runs did not depend on timeout recovery.

Reviewer note: This makes long-running browser experiments safer and makes runtime failures auditable instead of silent.

### `e514e29` - research: prepare v3.3 postprocessed prose

Purpose: Implement the V3.3 architecture: simple prompt, post-generation prose polishing, deterministic source/refusal lanes, and deterministic evidence tag injection.

Main changes: Added `polish_prose.mjs`, V3.3 prompt generation and prompt auditing, deterministic response support for the V3.3 runner, and generated/audited V3.3 prompt files.

Validation: Prompt audit for the 300-query V3.3 prompt set reported 0 failures.

Reviewer note: Introduces the model-agnostic post-generation guardrail direction that later became the strongest Round 03 result.

### `e7d8674` - research: run v3.2 guarded prose round

Purpose: Execute the V3.2 prompt-guardrail experiment.

Main changes: Added V3.2 pilot/full exports, answers, gates, performance reports, and quality reports.

Validation: Quality improved and guardrail compliance passed, but latency regressed significantly. Qwen average total latency was about 8.5 seconds, Qwen P95 was about 15.3 seconds, and slow rows over 10 seconds rose to 63.

Reviewer note: This is an important negative result showing that prompt-heavy guardrails improve caution but are too expensive for the browser-side SLM setting.

### `e44454d` - research: prepare v3.2 guarded prose experiment

Purpose: Add the prompt-guardrail variant and quality gate scripts needed before running V3.2.

Main changes: Added guardrail compliance checks, facts coverage checks, readability checks, V3.2 prompt generation, V3.2 prompt auditing, and V3.2 prompt files.

Validation: V3.2 prompt audit passed before the run.

Reviewer note: Provides the controlled setup for comparing prompt-based quality control with the later postprocessing-based V3.3 approach.

### `08afe11` - research: add deeper answer quality gates

Purpose: Extend evaluation beyond contract validation into error modes such as hallucination, misreading, overconfidence, and low semantic coverage.

Main changes: Added hallucination detection, misreading/overconfidence detection, a semantic accuracy scorer, and related quality reports.

Validation: Applied to the V3.1 safe-body 300 outputs and used as the basis for later V3.2 and V3.3 quality comparisons.

Reviewer note: This commit created the quality dimensions that made it possible to evaluate whether speed optimizations damaged answer trustworthiness.

### `2988c16` - research: record v3.1 300-query safe-body run

Purpose: Record the V3.1 full 300-query run and safe-body variant.

Main changes: Added V3.1 300 exports, answers, gate reports, quality reports, and performance triage artifacts.

Validation: Produced the fast baseline for Round 03 and exposed residual overconfidence risk that V3.2 and V3.3 later targeted.

Reviewer note: This is the baseline for the V3.2 and V3.3 comparisons.

### `be7ce3f` - research: gate v3.1 before 300-query run

Purpose: Run V3.1 pilot and quality gates before allowing the 300-query run.

Main changes: Added prompt audit outputs, pilot quality reports, and cacheable-query analysis.

Validation: Pilot gates passed sufficiently to justify the full 300-query run.

Reviewer note: This is the checkpoint that made the later 300-query V3.1 run methodologically defensible.

### `3dec7f2` - research: add round 03 latency optimization pilots

Purpose: Add the initial Round 03 pilot variants for latency optimization.

Main changes: Added pilot exports, gate reports, triage reports, deterministic responder support, and runner import/export improvements for baseline, length-control, evidence-compression, deterministic-lane, and V3.1-style explorations.

Validation: The pilot comparisons identified deterministic lanes and evidence tag injection as high-value directions.

Reviewer note: This is the exploration phase that led to the stronger V3.1 and V3.3 designs.

### `f9c8f58` - research: add round 03 latency triage and pilot set

Purpose: Create the pilot selection and latency triage foundation for Round 03.

Main changes: Added the `round03_latency_pilot50` fixture, latency-analysis scripts, and pilot-set construction reports.

Validation: Selected a controlled 50-query pilot from the 300-query set and generated slow-row triage used to target optimization work.

Reviewer note: This commit is the basis for the controlled pilot experiments that followed.
