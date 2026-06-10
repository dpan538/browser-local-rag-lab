# WebLLM Round Gate

Generated: 2026-06-09T23:08:22.696Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 50
- Result rows: 50
- Completed rows: 50
- Deterministic hybrid rows: 14
- Qwen model-generation rows: 36
- Error rows: 0
- Metric issues: 0
- Contract failures: 0
- Contract warnings: 0
- Gate warnings: 0
- Blocking findings: 0
- Performance observations: 0
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| none | none | none | none |
