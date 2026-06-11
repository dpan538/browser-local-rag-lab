# Source Attribution

Updated: 2026-06-11

This repository uses public metadata fixtures for research-only browser-local
RAG experiments. The fixture preserves source and rights fields as evidence
metadata; it does not download images, scrape private data, store raw HTML, or
copy collection media.

## Scope

The paper-facing Round 03 fixture is:

```text
fixtures/expansion/round03_300/records.jsonl
fixtures/expansion/round03_300/queries.jsonl
fixtures/expansion/round03_300/labels.jsonl
```

The records are compact evidence fixtures, not full archive records. Each
record preserves a `source` value when available so users and reviewers can
trace the authoritative collection or source-family context.

## Source Families

The Round 03 records include metadata derived from these public source
families:

| Source family | Approx. fixture records | Use in fixture |
|---|---:|---|
| Library of Congress public API / loc.gov records | 7 | Public collection metadata, source links, dates, and rights/source fields when present. |
| Gallica / Bibliotheque nationale de France API | 6 | Public bibliographic metadata and source links. |
| Art Institute of Chicago public API | 5 | Open public object metadata and source links. |
| Victoria and Albert Museum public collections API | 3 | Public object metadata and source links. |
| Wikimedia Commons file/source entries | multiple one-off source entries | Public source references and file-page provenance captured as metadata strings. |
| Cleveland Museum of Art Open Access API | 1 | Public object metadata and source link. |
| Cooper Hewitt Collection GraphQL/public collection data | 1 | Public object metadata and source link. |
| Smithsonian Open Access public metadata | 1 | Public object metadata and source link. |
| Project method-context records | 1 | Internal research fixture for method/process questions, marked separately from archive-object evidence. |

Counts are for the compact Round 03 evidence-record fixture, not for the
underlying public collections. Several records contain one-off source strings
or file-specific source labels, so source-family counts are approximate
documentation aids rather than a formal collection inventory.

## Rights And Source Handling

- `source` is treated as a citation/provenance field and should be copied or
  surfaced without being treated as generated evidence.
- `rights`, `reuse_permission`, `public_domain_status`, `image_state`, and
  topology fields are evidence-boundary metadata for the benchmark.
- The source/rights deterministic lane reports these fields from the fixture;
  it does not adjudicate legal reuse permissions.
- Users must verify authoritative source pages and local law before reusing any
  underlying collection item.

## Excluded Materials

The repository intentionally excludes:

- collection images or thumbnails;
- model weights and browser caches;
- raw HTML exports;
- cookies, sessions, secrets, or private archive data;
- full upstream collection dumps.

## Paper Wording

Use:

> The fixture uses compact public metadata records with preserved source and
> rights fields for controlled evidence-boundary experiments.

Do not write:

> The repository republishes collection media or provides legal rights
> determinations.
