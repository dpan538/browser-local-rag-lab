# JoD Article Outline

Status: planning notes only, not submission prose. The formal manuscript should
be author-drafted and use these notes as structure.

Target framing:

```text
Generated prose is an archive-facing interface, not archive evidence.
```

## 1. Introduction

Purpose:

- Introduce AI-mediated archive assistance as a documentation problem.
- State the risk that generated prose may be misread as archival evidence.
- Explain why rights-aware archive search makes source, rights, image-state,
  provenance, and metadata boundaries central.
- Introduce browser-local small models as a useful but constrained setting.

Contribution:

- evidence-packet framework;
- answer-lane framework;
- delivered-answer contract validation;
- controlled browser-local evaluation.

## 2. Theoretical And Professional Context

Position the work around:

- documents and recorded knowledge;
- archival evidence versus generated representation;
- metadata, provenance, source authority, and rights statements;
- AI assistance as documentation practice, not evidence production.

Avoid making RAG the theoretical center. RAG is the implementation setting.

## 3. Research Setting And Fixture

Describe:

- rights-aware archive fixture;
- included fields: `record_id`, `title`, `creator`, `date_text`, `region`,
  `source`, `rights`, `topology`, `image_state`;
- excluded materials: raw HTML, cookies, sessions, images, browser cache,
  model weights;
- query intent taxonomy;
- why generated outputs are experimental and not archive evidence.

Link to:

- `DATA_CARD.md`
- `EVIDENCE_PACKET_SPEC.md`
- `ANSWER_LANE_SPEC.md`

## 4. Evidence-Packet And Answer-Lane Framework

Define evidence packet as a bounded documentary representation of selected
archive fields.

Define answer lanes:

- orientation/help;
- current-object explanation;
- source/rights reporting;
- comparison;
- more-context/research navigation;
- refusal.

Argue that deterministic refusal/source-rights lanes are documentation
safeguards, not shortcuts. These lanes protect fields where free generation is
inappropriate.

## 5. Implementation And Evaluation

Present browser-local Qwen/WebLLM as the evaluation environment.

Include:

- V3.1, V3.2, V3.3 evolution;
- controlled `top3_gold_contract_source_rights` packet condition;
- 300-row final run;
- raw model text versus delivered answer;
- deterministic rows versus Qwen model-generation rows;
- latency, contract, quality-screen, and review-fixture evidence.

State the retrieval boundary clearly:

```text
We do not claim full end-to-end retrieval recall in the final generation
condition. We use controlled gold-evidence packets to isolate generation,
source/rights preservation, and delivered-answer behavior.
```

## 6. Findings

Suggested subsections:

1. Contract compliance under controlled evidence packets.
2. Latency improvement from prompt guardrails to postprocessed prose.
3. Source/rights preservation through deterministic lanes.
4. Failure-mode evidence showing why each layer is needed.
5. Automated quality screens and human-review fixture status.

Use:

- `reports/WEBLLM_ROUND_03_LATENCY300_V33_POSTPROCESSED_PROSE.md`
- `reports/RAW_VS_DELIVERED_V33.md`
- `reports/STATISTICAL_EVIDENCE_V42.md`
- `reports/V41_FINAL_CROSS_MODEL_RECORD.md`
- `reports/QUALITY_REVIEW_PROTOCOL_V33.md`

## 7. Discussion

Key points:

- generated prose as documentary interface;
- evidence packet as boundary object;
- answer lane as a local documentary rule;
- why source/rights and refusal should be system-controlled;
- why controlled gold-evidence evaluation is legitimate for generation
  isolation;
- what remains unsolved for retrieval and user-facing archive systems.

## 8. Limitations And Future Work

Must include:

- gold-injected controlled condition;
- single browser/device for final WebLLM latency;
- automated quality screens are not semantic truth;
- human review pending until the fixture is filled;
- need archive-scale retrieval and user study;
- need anonymized artifact for review.

## 9. Conclusion

Close on the documentation contribution:

```text
The framework keeps archival evidence and generated representation distinct
while making small-model assistance usable under browser-local constraints.
```

## Structured Abstract Scaffold

Do not paste this as final prose. It is a planning scaffold.

- Purpose: examine evidence boundaries in AI-mediated archival assistance.
- Design/methodology/approach: build a rights-aware fixture, evidence packets,
  answer lanes, contract validation, and controlled browser-local evaluation.
- Findings: report V3.3 delivered-answer contract results, latency reduction,
  quality-screen outcomes, and human-review fixture status.
- Originality: evidence packets and answer lanes as documentation boundaries
  for small-model archival assistance.
