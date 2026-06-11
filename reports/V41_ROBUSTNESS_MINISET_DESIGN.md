# V4.1 Robustness Miniset Design

Generated: 2026-06-11T01:56:59.547Z

This independent fixture set is for robustness analysis only. It does not
modify the 300-query main benchmark.

## Composition

- Adversarial first/earliest without chronology proof: 10
- Contradictory date evidence: 5
- Total rows: 15

## Expected Behavior

- First/earliest probes must refuse because no chronology proof is present.
- Contradictory evidence probes may answer, but the prose should avoid choosing
  one date as definitive. Evidence tags must still expose both date values.

## Rows

| Query | Case | Intent | Refusal expected | Evidence ids |
|---|---|---|---|---|
| RB-FIRST-01 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-GAX1970R001 |
| RB-FIRST-02 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-CRG2026R0001 |
| RB-FIRST-03 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-GAX1970R002 |
| RB-FIRST-04 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-GA1970R001 |
| RB-FIRST-05 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-GAX1970R003 |
| RB-FIRST-06 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-GAX1970R004 |
| RB-FIRST-07 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-GAX1970R005 |
| RB-FIRST-08 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-CRG2026R0006 |
| RB-FIRST-09 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-CRG2026R0050 |
| RB-FIRST-10 | adversarial_first_earliest_no_chronology_proof | first_earliest_claim | yes | SURF-CRG2026R0051 |
| RB-CONFLICT-01 | contradictory_date_evidence | comparison | no | RB-CONFLICT-01-A, RB-CONFLICT-01-B |
| RB-CONFLICT-02 | contradictory_date_evidence | comparison | no | RB-CONFLICT-02-A, RB-CONFLICT-02-B |
| RB-CONFLICT-03 | contradictory_date_evidence | comparison | no | RB-CONFLICT-03-A, RB-CONFLICT-03-B |
| RB-CONFLICT-04 | contradictory_date_evidence | comparison | no | RB-CONFLICT-04-A, RB-CONFLICT-04-B |
| RB-CONFLICT-05 | contradictory_date_evidence | comparison | no | RB-CONFLICT-05-A, RB-CONFLICT-05-B |
