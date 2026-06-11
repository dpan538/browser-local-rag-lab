# Browser Local RAG Lab

This is an independent research-only repository package for browser-local
small-model RAG. It starts from a rights-aware archive fixture, but it is not
the archive product and should be pushed to the separate research repository:

```text
dpan538/browser-local-rag-lab
```

It does not change archive Assistant runtime, UI, scraping, ingestion, rights
policy, or image handling.

## Citation Identity

Use `Dai Pan` for English citation metadata (`family-names: Pan`,
`given-names: Dai`). The author's Chinese name is 潘岱.

## Research Question

How can a contract-first, rights-aware, browser-local small-model RAG system
use evidence packets, deterministic answer lanes, and postprocessed prose to
produce low-latency delivered answers without letting generated text overwrite
source, rights, or refusal boundaries?

## Boundaries

- Product model identity remains `Qwen/Qwen3.5-0.8B`.
- Product runtime artifact remains `onnx-community/Qwen3.5-0.8B-ONNX`.
- Runtime comparisons with Transformers.js, ONNX Runtime WebGPU, and
  WebLLM/MLC are research-only and do not represent a product path.
- No Llama or alternate model is written into product Assistant logic.
- No images are downloaded.
- No model weights, browser caches, raw HTML, cookies, sessions, or secrets are
  committed.
- Fixtures use only archive metadata, compact text summaries, source fields,
  rights labels, topology hints, and image-state.
- AI output is experiment output only. It is not archive evidence.

## Data Sources

The fixture generator reads:

```bash
fixtures/archive_fixture_v0.json
```

The included fixture was exported from the archive project's public surface
payload and is already safe for this research package. To regenerate it from the
archive repo, run `scripts/build_fixture.mjs` from the archive checkout or pass
an explicit source payload path.

The package includes:

```bash
fixtures/archive_fixture_v0.json
fixtures/benchmark_queries_v0.json
```

The fixture intentionally excludes image URLs for model use, raw HTML, cookies,
sessions, browser cache paths, and model files.

## Current Final Condition

The current paper-hardening condition is:

```text
v3.3_contract_top3_300_delivered
```

It uses:

- retrieval condition: `top3_gold_contract_source_rights`
- runtime: WebLLM custom browser runtime
- model: `Qwen3.5-0.8B-q4f16_1-MLC`
- rows: 300 total, 109 deterministic hybrid rows, 191 Qwen model-generation
  rows
- answer system: deterministic refusal lane, deterministic source/rights lane,
  V3.3 postprocessed prose, and deterministic evidence-tag injection

This is a controlled contract/gold-evidence generation condition. It does not
claim end-to-end product retrieval recall. See:

```text
EXPERIMENT_STATUS.md
CLAIMS_AND_NON_CLAIMS.md
REPRODUCIBILITY.md
reports/FINAL_ARTIFACT_INDEX.md
```

Journal of Documentation positioning notes are tracked separately as planning
materials, not submission prose:

```text
essay/jod_positioning.md
essay/jod_article_outline.md
essay/jod_submission_readiness.md
```

## Run Checks

From the repository root:

```bash
npm run gold:build
npm run evidence:health:strict
npm run evidence:value:strict
npm run method:context:strict
npm run labels:consistency:strict
npm run gold:sufficiency
npm run retrieval:coverage
npm run audit:labels
npm run audit:labels:strict
npm run audit:quality
npm run audit:full
npm run benchmark
npm run analyze
```

After a generation run writes answers as JSONL, validate them against the gold
label contract:

```bash
npm run generation:contract -- path/to/answers.jsonl --strict
npm run generation:contract:v2 -- path/to/answers.jsonl --strict
```

When changing rules or labels, optional guardrails are available:

```bash
npm run audit:regression -- reports/baseline_audit.json reports/gold_label_audit_v0.json
npm run labels:change-log -- old_labels.jsonl fixtures/gold/labels.jsonl
npm run scaffold:intent -- --intent=new_intent --lanes=research_answer,refusal_more_context --required=record_id,title,source
```

For a local browser view:

```bash
npm run serve
```

Then open:

```text
http://127.0.0.1:4177/browser_lab/index.html
```

The browser lab is a static research UI. It performs local retrieval and
evidence-packet construction from the fixture.

For a browser-local WebLLM/Qwen runtime round, open:

```text
http://127.0.0.1:4177/browser_lab/webllm_round.html
```

For the current paper-facing V3.3 controlled condition, use the dedicated
launcher:

```text
http://127.0.0.1:4177/browser_lab/webllm_v33.html
```

It opens the exact V3.3 URL:

```text
http://127.0.0.1:4177/browser_lab/webllm_round.html?round=webllm_round_03_latency300_v33_postprocessed_prose&start=1&limit=300&queries=../fixtures/expansion/round03_300/queries.jsonl&labels=../fixtures/expansion/round03_300/labels.jsonl&records=../fixtures/expansion/round03_300/records.jsonl&retrieval=../reports/retrieval_sufficiency_300_contract.json&variant=top3_gold_contract_source_rights&promptVariant=r03_v33_postprocessed_prose
```

Then:

1. Click `Probe WebGPU`.
2. Click `Load WebLLM`.
3. Run the selected query or the configured query range.
4. Click `Download results`.
5. Import the browser-exported JSON:

```bash
npm run webllm:import -- path/to/webllm_round_01_export.json --strict
```

The WebLLM page uses a research-only custom MLC/WebLLM model configuration for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is not a product runtime path. The browser may
download and cache model artifacts locally during the run; those artifacts are
not committed and are outside the fixture package.

## Paper-Hardening Commands

The current non-WebGPU paper-hardening checks are:

```bash
npm run audit:labels:300
npm run retrieval:contract:300
npm run prompts:audit:300:v33
npm run contract:oracle:300
npm run quality:v33:300
npm run v42:stats
npm run paper:manifest:v33
npm run paper:raw-vs-delivered:v33
npm run paper:review-fixture:v33
npm run paper:review-summary:v33
```

Or rebuild the paper-facing artifacts together:

```bash
npm run paper:reproduce
```

## Metrics

The benchmark schema records:

- query id and query type;
- answer lane;
- candidate count;
- retrieval time;
- prompt bytes;
- estimated prompt tokens;
- source/rights preservation;
- no-evidence refusal correctness;
- exact gold evidence id coverage;
- generation status;
- model load status, cache state, WebGPU status, TTFT, total latency, output
  tokens, tokens/s, deterministic lane markers, and postprocess actions when
  the browser/WebLLM runner exposes them.

The final V3.3 condition currently fills the paper-facing runtime metrics:

- 300 total rows, 300 completed rows, 0 runtime errors;
- 109 deterministic hybrid rows and 191 Qwen model-generation rows;
- Qwen model-row average TTFT, average total latency, and tokens/s;
- all-row latency with deterministic rows included separately;
- generation-contract fail/warn counts;
- automated quality-screen outputs.

Some fields remain measurement-protocol caveats rather than independent
instrumentation. Prompt tokens are estimated, tokenization timing is not always
separately exposed by the browser runner, and Node Transformers.js cross-model
TTFT values are not directly comparable to WebLLM streaming TTFT.

## Gold Fixtures And Labels

The first methodology artifact is a seed gold fixture:

```text
fixtures/gold/records.jsonl
fixtures/gold/queries.jsonl
fixtures/gold/labels.jsonl
fixtures/schemas/
```

The original v0 fixture remains available as scaffolding. The paper-facing
condition uses the Round 03 300-query expansion:

```text
fixtures/expansion/round03_300/records.jsonl
fixtures/expansion/round03_300/queries.jsonl
fixtures/expansion/round03_300/labels.jsonl
```

The 300-label audit is stable by rule under the current contract checks. Human
semantic review is not complete; the V3.3 review fixture is a review input, not
a completed human evaluation.

## Current Conclusion

The strongest current result is a delivered-answer system result: under the
controlled `top3_gold_contract_source_rights` packet condition, V3.3 completed
300/300 rows with zero generation-contract failures and zero warnings. The
paired V4.2 statistical report estimates a 61.05% model-row latency reduction
from V3.2 guarded prompts to V3.3 postprocessed prose.

This supports a contract-first architecture claim, not a raw-model or
end-to-end retrieval claim.

## Limitations

- The final generation condition injects gold evidence IDs when needed to
  isolate generation and source/rights preservation. It is not product
  retrieval recall.
- Delivered-answer metrics include deterministic lanes, evidence-tag injection,
  and postprocessing. They must not be described as raw Qwen metrics.
- Prompt tokens are estimated by browser-side heuristics, not by a separately
  audited tokenizer.
- Automated quality screens are fast gates, not a substitute for human semantic
  review.
- Latency measurements are tied to the recorded browser/WebGPU setup unless
  replicated on additional hardware.
