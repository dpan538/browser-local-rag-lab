# JoD Submission Readiness Checklist

Status: planning notes only, not submission prose.

## Official Constraints To Respect

Verified on 2026-06-11 from the official Emerald Journal of Documentation page:

- Article files should be submitted in Microsoft Word format.
- Article length is 4000-10000 words, including abstract, references, tables,
  figures, and appendices.
- The structured abstract requires Purpose, Design/methodology/approach,
  Findings, and Originality.
- The journal uses double-anonymous peer review.
- Large language models cannot be credited with authorship.
- Generative AI may not be used to create or draft new manuscript material;
  transparent, responsible use for copy-editing or clarity improvement of
  author-originated text is the safe boundary.

Source: https://www.emeraldgrouppublishing.com/journal/jd

## Before Submission

Required:

- Complete V3.3 human semantic review using
  `reports/review_fixture_v33_300_stratified.json`.
- Summarize reviewer decisions, faithfulness, usability, and adjudication.
- Separate raw model output from delivered answer results in every table.
- Use `v3.3_contract_top3_300_delivered` as the final condition name.
- Keep retrieval claims separate from controlled generation claims.
- Prepare an anonymized artifact package for double-anonymous review.
- Remove or mask author-identifying paths, GitHub handles, and commit metadata
  from reviewer-facing materials.
- Write an AI-use disclosure that says which tools were used for planning,
  code assistance, copy-editing, or clarity checks, and that final manuscript
  prose is author-drafted.

Recommended:

- Add a human-review summary table to `essay/main_results.md`.
- Add a limitations table that explicitly lists gold-injected evidence,
  single-device latency, and automated quality screens.
- Create a reviewer-facing artifact README that avoids author identity.
- Export only safe fixture/report subsets for review.

## Anonymized Artifact Plan

Create a review package that includes:

- safe fixtures;
- scripts needed for non-WebGPU checks;
- paper-facing reports;
- specs and claims/non-claims docs;
- no Git remotes;
- no user paths;
- no GitHub account names;
- no model cache, browser cache, image files, cookies, sessions, or secrets.

Do not include:

- public repository URL during anonymous review;
- commit history if it reveals identity;
- screenshots with local usernames or browser profile details;
- unpublished manuscript drafts containing author-identifying acknowledgements.

## AI-Use Boundary

Use AI tools for:

- planning;
- checklist generation;
- code assistance;
- consistency checks;
- copy-editing or language clarity on author-originated text.

Do not use AI tools for:

- generating final manuscript prose for submission;
- creating new claims not grounded in repository evidence;
- fabricating related work;
- replacing human semantic review.

Keep a transparent internal log of AI assistance for later disclosure.
