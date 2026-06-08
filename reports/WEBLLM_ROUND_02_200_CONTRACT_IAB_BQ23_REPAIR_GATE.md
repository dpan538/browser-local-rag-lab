# WebLLM Round Gate

Generated: 2026-06-08T07:27:35.712Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 1
- Result rows: 1
- Completed rows: 1
- Error rows: 0
- Metric issues: 0
- Contract failures: 0
- Contract warnings: 0
- Gate warnings: 0
- Ready for next step: yes

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| none | none | none | none |
