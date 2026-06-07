# Research Repository Boundary

This folder is prepared as a standalone package for:

```text
dpan538/browser-local-rag-lab
```

It is not intended to be pushed as part of the archive product repository.

## Relationship To The Archive Project

- The archive project provided the initial rights-aware fixture and research
  scenario.
- This package studies browser-local small-model RAG as an independent research
  problem.
- Archive product Assistant code, UI, scraping, ingestion, runtime, and rights
  policy are out of scope here.

## Allowed In This Repository

- Safe fixture records with metadata, compact text notes, source links, rights
  labels, topology hints, and image-state.
- Benchmark queries and reports.
- Static browser lab code.
- Runtime comparison notes clearly labeled research-only.
- Measurement outputs such as JSON and CSV benchmark reports.

## Not Allowed In This Repository

- Raw HTML captures.
- Cookies, sessions, browser cache, or credentials.
- Model weights or local model cache.
- Downloaded image files.
- Private archive data.
- Product Assistant code copied as the research runtime path.

## Research-Only Runtime Position

The primary model object is `Qwen/Qwen3.5-0.8B`. Runtime comparisons involving
Transformers.js, ONNX Runtime WebGPU, or WebLLM/MLC are experiments only. They
do not imply any product runtime decision for the archive project.
