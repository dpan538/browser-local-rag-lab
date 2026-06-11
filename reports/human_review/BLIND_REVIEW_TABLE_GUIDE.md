# V3.3 Blind Review Table Guide

Use the spreadsheet files if the JSON fixtures feel too technical:

- Reviewer A: `v33_reviewer_a_blind_review.xlsx`
- Reviewer B: `v33_reviewer_b_blind_review.xlsx`

CSV backups are also provided:

- Reviewer A: `v33_reviewer_a_blind_review.csv`
- Reviewer B: `v33_reviewer_b_blind_review.csv`

Open the XLSX or CSV in Excel, Numbers, Google Sheets, or LibreOffice. Review
one row at a time. Please edit only these columns:

- `reviewer_decision`: `accept`, `reject`, or `needs_adjudication`
- `reviewer_faithfulness`: `faithful`, `minor_issue`, or `unfaithful`
- `reviewer_usability`: `usable`, `partial`, or `unusable`
- `reviewer_notes`: short free-text note when useful

Do not edit query, evidence, or answer columns. If a row is difficult to judge,
use `needs_adjudication` and explain why in `reviewer_notes`.
