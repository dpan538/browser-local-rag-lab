# Data Card

## Dataset Purpose

The fixture supports browser-local RAG research for rights-aware digital
archives. It is designed to test evidence-packet construction, answer-lane
selection, source/rights preservation, latency, and quality gates.

## Included Data

- metadata records
- compact text summaries
- source fields
- rights labels
- topology hints
- image-state labels
- benchmark queries and gold labels

## Excluded Data

- images
- raw HTML captures
- model weights or browser cache
- cookies, sessions, credentials, or secrets
- private archive data

## Main Splits

- seed fixture: `fixtures/gold/`
- Round 02 200-query expansion: `fixtures/expansion/round02_200/`
- Round 03 300-query expansion: `fixtures/expansion/round03_300/`
- robustness miniset: `fixtures/robustness/v41_miniset/`

## Label Contract

Labels contain:

- intent
- lane
- sufficiency/refusal state
- gold evidence IDs
- required fields
- must-not-invent fields

The label contract checks answerability and evidence-field support. It does
not by itself replace human semantic review.

## Rights And Use Boundary

Generated answers are experiment outputs only. Source archives remain
authoritative. No generated text should be treated as archive evidence.
