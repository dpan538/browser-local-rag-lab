# Journal of Documentation Positioning Notes

Status: planning notes only, not submission prose.

Verified against the official Journal of Documentation page on 2026-06-11:

- Journal page and author guidelines: https://www.emeraldgrouppublishing.com/journal/jd
- Relevant constraints observed: article length 4000-10000 words, structured
  abstract with Purpose, Design/methodology/approach, Findings, and
  Originality, double-anonymous peer review, and explicit AI-use policy.

## Positioning Decision

Journal of Documentation is a stronger first target than a purely digital
library engineering venue for the current state of this repository.

The paper should not be framed as:

```text
Browser-local RAG benchmark for Qwen 0.8B
```

It should be framed as:

```text
A documentation framework for evidence-bounded AI assistance in rights-aware
digital archives
```

The technical evaluation remains important, but it should serve the
documentation argument:

1. Generated prose is not archive evidence.
2. Source, rights, metadata, topology, and image-state fields are documentary
   evidence boundaries.
3. Evidence packets translate archive records into bounded generation context.
4. Answer lanes encode different documentary obligations.
5. Deterministic refusal and source/rights lanes protect archival authority.

## Recommended Working Title

Preferred:

```text
Generated Prose Is Not Archive Evidence: A Contract-First Framework for
Small-Model Assistance in Digital Archives
```

Alternates:

```text
Evidence Packets as Documentation Boundaries for Browser-Local AI Assistance
in Rights-Aware Archives
```

```text
Documenting Evidence Boundaries in AI-Mediated Archive Assistance: A
Browser-Local Small-Model RAG Study
```

## Article Type

Recommended:

```text
Article
Category: Research paper
```

Reason: the contribution is a framework construction and evaluation, not only
a technical product/process description.

## Core Claim

Paper-safe claim:

```text
This paper proposes and evaluates an evidence-packet and answer-lane framework
for browser-local small-model assistance in rights-aware archival search. The
framework preserves the distinction between archival evidence and generated
prose by treating metadata, source links, rights labels, image state, and
topology as bounded documentary evidence, while constraining delivered answers
through contract validation, deterministic refusal/source-rights lanes, and
postprocessed prose.
```

## What To Avoid

Do not claim:

- end-to-end archive retrieval recall;
- product-ready RAG;
- raw Qwen semantic fidelity without postprocessing;
- generated prose as archival evidence;
- rights adjudication;
- hardware-general latency.

Use the language already fixed in:

- `CLAIMS_AND_NON_CLAIMS.md`
- `EXPERIMENT_STATUS.md`
- `REPRODUCIBILITY.md`

## Why This Fits JoD

The strongest contribution is not that a small model ran locally. The strongest
contribution is a documentary boundary framework:

- evidence packet as a documentary boundary object;
- answer lane as an information-practice rule;
- deterministic source/rights reporting as an archival authority safeguard;
- refusal as a record-knowledge boundary, not merely a safety style;
- delivered-answer validation as a method for keeping generated representation
  separate from evidence.

This is closer to documents, recorded knowledge, provenance, metadata, and
information practice than to a pure RAG systems benchmark.
