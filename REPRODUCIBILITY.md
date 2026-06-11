# Reproducibility

This repository supports reproducible non-WebGPU checks and records the browser
runtime state for WebLLM runs. It does not commit model weights or browser
caches.

## Environment

The final V3.3 browser run was exported from the Codex in-app browser with:

- runtime: WebLLM/MLC custom browser runtime
- model: `Qwen3.5-0.8B-q4f16_1-MLC`
- prompt variant: `r03_v33_postprocessed_prose`
- retrieval condition: `top3_gold_contract_source_rights`
- cache state: `warm_from_previous`
- WebGPU status: available

The canonical manifest is:

```bash
experiments/v3.3_contract_top3_300/manifest.json
```

Regenerate it with:

```bash
npm run paper:manifest:v33
```

## Non-WebGPU Reproduction

These commands do not require browser model inference:

```bash
npm run audit:labels:300
npm run retrieval:contract:300
npm run prompts:audit:300:v33
npm run contract:oracle:300
npm run quality:v33:300
npm run v42:stats
npm run paper:raw-vs-delivered:v33
npm run paper:review-fixture:v33
```

To rebuild the paper-hardening artifacts in one pass:

```bash
npm run paper:reproduce
```

## Browser/WebGPU Reproduction

Browser-local WebLLM runs must be executed manually because model artifacts and
browser caches are not committed. Start the static lab:

```bash
npm run serve
```

Then open:

```text
http://127.0.0.1:4177/browser_lab/webllm_round.html
```

Use the V3.3 paths and settings recorded in the manifest. After download,
import the browser export with:

```bash
npm run webllm:import -- path/to/browser_export.json --strict
```

## Measurement Caveats

- Qwen/WebLLM reports streaming browser TTFT.
- Node Transformers.js V4.1 reports use total latency as a conservative TTFT
  placeholder because the runner does not expose true streaming TTFT.
- Cross-runtime comparisons should emphasize contract and quality-gate results;
  raw TTFT values are runtime-instrumentation dependent.
