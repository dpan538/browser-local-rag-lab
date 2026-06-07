# Deep Research Prompt: Archive-Origin Browser-Local RAG

## Title

Browser-Local Small-Model RAG for a Rights-Aware Archive: Evidence Packets,
Answer Lanes, and Faithfulness

## Context

We are building a reproducible research lab that starts from a rights-aware
modern graphic design archive, but the lab is independent from the production
archive product. The production archive is an index and research framework: it
stores source-linked metadata, text summaries, rights labels, image-state,
source URLs, and topology/folder context. It is not an image mirror, not a
general chatbot, and not a system where AI output becomes archive evidence.

The research lab should answer a paper-level question:

How can a browser-local 0.8B small model provide useful, faithful, low-latency
RAG over a large private/public archive dataset through high-quality retrieval,
compact evidence packets, and UI-aware answer lanes?

## Fixed Boundaries

- Core model object: `Qwen/Qwen3.5-0.8B`.
- Product archive constraints are background only; this lab is independent.
- Research-only runtime comparison may include Transformers.js, ONNX Runtime
  WebGPU, WebLLM/MLC, workers, service workers, browser cache, and direct
  WebGPU/ORT controls.
- Do not propose hosted inference as the normal path.
- Do not introduce Llama or unrelated models as archive product replacements.
- Do not download or mirror images.
- Do not treat model output as archive evidence.
- Do not infer or upgrade rights states from model output.
- Use fixture data only: metadata, source fields, compact text notes, rights
  labels, image-state, topology hints.
- Raw HTML, cookies, sessions, model weights, image files, and browser cache
  must not be part of the reproducible dataset.

## Current Lab Scaffold

- Small fixture extracted from archive public surfaces.
- Benchmark query set includes archive orientation, current object explanation,
  first/earliest claim, region-period recommendation, source/rights question,
  comparison, no-evidence refusal, casual archive help, method/process
  question, and more-context request.
- Initial benchmark is retrieval/evidence-packet only: top 1 vs top 3 vs top
  8, raw note vs compressed note, with/without topology hints, and
  with/without source/rights fields.
- Qwen generation is not yet measured.

## Research Tasks

1. Define the strongest paper framing for this archive-origin browser-local RAG
   problem.
2. Identify what is genuinely novel: evidence-packet compression, rights-aware
   RAG constraints, UI-aware answer lanes, refusal-before-generation,
   topology-aware archive retrieval, and browser-local latency/failure
   measurement.
3. Propose a rigorous benchmark design: query taxonomy, fixture schema,
   retrieval baselines, evidence packet variants, answer lane definitions,
   quality rubric, and latency metrics.
4. Propose the experiment matrix: retrieval only, Qwen fast answer, Qwen
   research answer, top-k ablation, source/rights field ablation,
   topology-hint ablation, no-evidence refusal, cold vs warm runtime, worker vs
   main thread, and runtime comparison as research-only.
5. Explain how to avoid the first Deep Research failure mode: do not assume
   production files are accessible, do not overfit to product Assistant code,
   do not treat archive product constraints as runtime conclusions, and focus
   on independent reproducible lab design.

## Output Format

1. Executive Summary
2. Problem Definition
3. What Makes This Research Independent From The Archive Product
4. Benchmark Fixture And Query Taxonomy
5. Retrieval And Evidence-Packet Design
6. Runtime Metrics To Capture
7. Quality Evaluation Rubric
8. Experiment Matrix
9. Paper Framing And Candidate Venues
10. Reproducibility Package Structure
11. Risks, Non-Goals, And Failure Modes
12. Next Experiment Plan

End with:

```text
RECOMMENDED_REPO_NAME:
RECOMMENDED_DESCRIPTION:
FIRST_RUNTIME_EXPERIMENT:
MOST_IMPORTANT_PAPER_CLAIM_TO_TEST:
```
