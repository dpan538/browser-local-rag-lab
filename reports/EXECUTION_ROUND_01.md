# Execution Round 01

Generated: 2026-06-07T05:06:19.571Z

## Scope

This is the first controlled execution round for the research lab. It uses the
approved `top3_compressed_topology_source_rights` packet and a deterministic contract-probe answer
producer. It does not run Qwen, WebGPU, WebLLM, ONNX Runtime WebGPU, model
downloads, or browser cache writes.

The purpose is to verify the complete answer-artifact and post-generation
contract path before replacing the producer with browser-local Qwen generation.

## Summary

- Answers produced: 30
- Producer: deterministic_contract_probe_no_qwen
- Contract fail findings: 0
- Contract warning findings: 0
- Qwen generation run: no
- WebGPU runtime run: no

## By Intent

| Intent | Answers | Refusal expected |
|---|---:|---:|
| archive_orientation | 3 | 0 |
| casual_archive_help | 2 | 0 |
| comparison | 2 | 0 |
| current_object_explanation | 3 | 0 |
| first_earliest_claim | 3 | 3 |
| method_process_question | 2 | 0 |
| more_context | 2 | 0 |
| no_evidence_refusal | 3 | 3 |
| region_period_recommendation | 5 | 3 |
| source_rights_question | 5 | 0 |

## Contract Findings

| Severity | Query | Code | Field | Detail |
|---|---|---|---|---|
| none | none | none | none | none |

## Interpretation

- Fail findings would block a Qwen execution round.
- Warning findings identify packet/answer alignment issues that should be
  reviewed before claiming generated-answer quality.
- The next round can replace the deterministic producer with Qwen while keeping
  the same answer JSONL contract and validation scripts.
