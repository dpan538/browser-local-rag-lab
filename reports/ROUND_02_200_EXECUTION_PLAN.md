# Round 02 200-Query Execution Plan

Generated: 2026-06-08

This plan executes the 200-query expansion in two steps: a 50-query pilot gate
followed by the full 200-query browser-local WebLLM run. Both steps use the same
`webllm_round_02_200` browser checkpoint, so a successful pilot does not need to
be rerun during the full round.

## Pilot 50

Open:

`http://127.0.0.1:4178/browser_lab/webllm_round.html?round=webllm_round_02_200&start=1&limit=50&queries=../fixtures/expansion/round02_200/queries.jsonl&labels=../fixtures/expansion/round02_200/labels.jsonl&records=../fixtures/expansion/round02_200/records.jsonl&retrieval=../reports/retrieval_sufficiency_200.json&variant=top3_compressed_topology_source_rights`

Run:

1. Probe WebGPU.
2. Load WebLLM.
3. Run scope.
4. Download results.
5. Import the browser JSON with pilot output paths:

```bash
npm run webllm:import -- /path/to/downloaded-webllm-export.json \
  --json-out reports/webllm_round_02_200_pilot50.json \
  --answers-out reports/webllm_round_02_200_pilot50_answers.jsonl \
  --md-out reports/WEBLLM_ROUND_02_200_PILOT50.md
```

6. Gate the pilot:

```bash
npm run webllm:gate:pilot50
```

Continue to the full 200 only if `ready_for_next_step=true`.

## Full 200

Open:

`http://127.0.0.1:4178/browser_lab/webllm_round.html?round=webllm_round_02_200&start=1&limit=200&queries=../fixtures/expansion/round02_200/queries.jsonl&labels=../fixtures/expansion/round02_200/labels.jsonl&records=../fixtures/expansion/round02_200/records.jsonl&retrieval=../reports/retrieval_sufficiency_200.json&variant=top3_compressed_topology_source_rights`

Run:

1. Keep the same browser profile and checkpoint.
2. Run all or run scope with `start=1`, `limit=200`.
3. The runner skips already completed pilot rows by default.
4. Download results when `result_count=200`.
5. Import normally:

```bash
npm run webllm:import -- /path/to/downloaded-webllm-export.json --strict
```

6. Gate the full run:

```bash
npm run webllm:gate:200
```

## Stop Conditions

- Runtime error rows are blockers.
- Metric schema issues are blockers except explicitly marked cache ambiguity.
- Contract failures are blockers.
- Gate warnings block automatic progression and should be reviewed before the
  run is used for paper-quality claims.
