# Evidence Packet Specification

Evidence packets are compact, rights-aware records passed to generation or
deterministic answer lanes.

## Required Principles

- Keep only fields needed by the label contract and answer lane.
- Preserve `record_id`, `source`, rights, and image-state fields when relevant.
- Do not include images, raw HTML, cookies, sessions, or model cache paths.
- Treat source archives as authoritative.

## Controlled Contract Variant

The final V3.3 condition uses:

```text
top3_gold_contract_source_rights
```

This variant injects answerable labels' gold evidence IDs into the packet before
adding retrieval filler records. It is intended to isolate browser-local
generation and source/rights preservation. It is not a product retrieval recall
claim.

## Retrieval Variants

Raw retrieval variants remain useful for diagnosis. If gold ID coverage is
below 100%, the variant cannot support a generation quality claim unless it is
explicitly framed as a negative control.

## Packet Fields

Common fields include:

- `record_id`
- `title`
- `date_text`
- `region`
- `source`
- `rights`
- `image_state`
- `reuse_permission`
- `public_domain_status`
- `topology`
