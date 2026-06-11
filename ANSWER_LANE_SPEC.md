# Answer Lane Specification

Answer lanes separate deterministic field reporting from prose generation.

## Lanes

| Lane | Handler | Purpose |
|---|---|---|
| `refusal_more_context` | deterministic | Refuse when evidence is insufficient. |
| `source_rights` | deterministic | Report source/rights fields exactly from evidence. |
| `help` | model plus postprocess | Provide archive orientation or casual help. |
| `fast_answer` | model plus postprocess | Explain a current object with evidence tags. |
| `research_answer` | model plus postprocess | Compare, recommend, or contextualize records. |

## Deterministic Lanes

Refusal and source/rights answers are not delegated to the small model in the
final system. This is intentional: these lanes carry high factual and rights
risk and have low linguistic variability.

## Model Prose Lanes

For non-deterministic lanes, the model writes concise prose. The system then
applies prose polishing and deterministic evidence-tag injection.

## Delivered Answer Boundary

A delivered answer may contain:

- deterministic answer text;
- model prose;
- prose-polisher edits;
- injected evidence tags.

Therefore, delivered-answer metrics must not be described as raw model metrics.
