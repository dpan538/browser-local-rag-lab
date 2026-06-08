# WEBLLM ROUND 02 200

Generated: 2026-06-08T06:34:52.989Z

## Scope

This report imports a browser-exported WebLLM custom-model run for
`Qwen3.5-0.8B-q4f16_1-MLC`. This is a research-only runtime measurement path.
It does not define or modify the archive product runtime, Assistant UI,
scraping, ingestion, or rights policy.

Model artifacts and browser cache are not committed. Generated answers are
experiment outputs only and are not archive evidence.

## Inputs And Outputs

- Imported browser JSON: reports/webllm_round_02_200.json
- Generated answer JSONL: reports/webllm_round_02_200_answers.jsonl
- Variant: top3_compressed_topology_source_rights
- Model id: Qwen3.5-0.8B-q4f16_1-MLC
- WebGPU status: available

## Runtime Summary

- Result rows: 200
- Completed rows: 200
- Error rows: 0
- Average TTFT: 1999.0 ms
- Average total latency: 6294.6 ms
- Average tokens/s: 15.87
- Average prompt tokens estimate: 530.1
- Metric validity issues: 0

## Metric Validity Gate

| Query | Row | Type | Key | Value |
|---|---:|---|---|---|
| none | none | none | none | none |

## Status Counts

| Status | Count |
|---|---:|
| completed | 200 |

## Contract Gate

- Answers checked: 200
- Expected labels: 200
- Fail findings: 61
- Warning findings: 146

| Severity | Query | Code | Field | Detail |
|---|---|---|---|---|
| warn | BQ01 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| warn | BQ04 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| warn | BQ14 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ14 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ14 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ25 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ26 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ058 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ058 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Sergey Filippov PSE Russia 2012.jpg / page 25675" |
| warn | BQ061 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ061 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Stamp commemorating the centenary of the birth of José Manuel Estrada.jpg / page 30" |
| warn | BQ062 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ062 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Temple of" |
| warn | BQ065 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ065 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ066 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ066 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ067 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ067 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Stamp 1968 UAE-RK MiNr0" |
| warn | BQ068 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ069 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ069 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / East India postage Queen Victoria stamp used in Zanzibar -" |
| warn | BQ070 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ070 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / East India postage Queen Victoria stamp used in Zanzibar-" |
| warn | BQ071 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ072 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ072 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ074 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ074 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Oud-generaal als straatmuzikant, NG-85" |
| warn | BQ076 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ076 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source /" |
| warn | BQ089 | G101_required_field_value_not_observed | rights | answer does not visibly include an evidence value for this required field |
| warn | BQ089 | G101_required_field_value_not_observed | image_state | answer does not visibly include an evidence value for this required field |
| warn | BQ089 | G101_required_field_value_not_observed | reuse_permission | answer does not visibly include an evidence value for this required field |
| warn | BQ089 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| fail | BQ089 | G006_source_rights_tag_missing | rights | missing tags=RIGHTS/rights |
| fail | BQ089 | G006_source_rights_tag_missing | reuse_permission | missing tags=REUSE/reuse_permission |
| fail | BQ089 | G006_source_rights_tag_missing | public_domain_status | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | BQ094 | G101_required_field_value_not_observed | reuse_permission | answer does not visibly include an evidence value for this required field |
| warn | BQ094 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| fail | BQ094 | G006_source_rights_tag_missing | reuse_permission | missing tags=REUSE/reuse_permission |
| fail | BQ094 | G006_source_rights_tag_missing | public_domain_status | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | BQ095 | G101_required_field_value_not_observed | rights | answer does not visibly include an evidence value for this required field |
| warn | BQ095 | G101_required_field_value_not_observed | image_state | answer does not visibly include an evidence value for this required field |
| warn | BQ095 | G101_required_field_value_not_observed | reuse_permission | answer does not visibly include an evidence value for this required field |
| warn | BQ095 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| fail | BQ095 | G006_source_rights_tag_missing | rights | missing tags=RIGHTS/rights |
| fail | BQ095 | G006_source_rights_tag_missing | reuse_permission | missing tags=REUSE/reuse_permission |
| fail | BQ095 | G006_source_rights_tag_missing | public_domain_status | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | BQ096 | G101_required_field_value_not_observed | reuse_permission | answer does not visibly include an evidence value for this required field |
| warn | BQ096 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| fail | BQ096 | G006_source_rights_tag_missing | reuse_permission | missing tags=REUSE/reuse_permission |
| fail | BQ096 | G006_source_rights_tag_missing | public_domain_status | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | BQ098 | G101_required_field_value_not_observed | rights | answer does not visibly include an evidence value for this required field |
| warn | BQ098 | G101_required_field_value_not_observed | reuse_permission | answer does not visibly include an evidence value for this required field |
| warn | BQ098 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| fail | BQ098 | G005_unverified_field_assertion | rights | asserted="IMG03: Gallica SRU metadata reports public-domain rights;" |
| fail | BQ098 | G007_source_rights_tag_mismatch | rights | asserted="IMG03: Gallica SRU metadata reports public-domain rights;" |
| fail | BQ098 | G006_source_rights_tag_missing | reuse_permission | missing tags=REUSE/reuse_permission |
| fail | BQ098 | G006_source_rights_tag_missing | public_domain_status | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | BQ099 | G101_required_field_value_not_observed | rights | answer does not visibly include an evidence value for this required field |
| fail | BQ099 | G005_unverified_field_assertion | rights | asserted="IMG03: Gallica SRU metadata reports public-domain rights; IIIF image is source-hosted by BnB." |
| fail | BQ099 | G007_source_rights_tag_mismatch | rights | asserted="IMG03: Gallica SRU metadata reports public-domain rights; IIIF image is source-hosted by BnB." |
| warn | BQ100 | G101_required_field_value_not_observed | public_domain_status | answer does not visibly include an evidence value for this required field |
| fail | BQ100 | G007_source_rights_tag_mismatch | public_domain_status | asserted="source_metadata_mentions_public_domain_but_global_public_domain_status_not_d" |
| warn | BQ103 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ103 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Sergey Filippov PSE Russia 2012.jpg / page 2" |
| warn | BQ104 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ104 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Diego Portales-D S No 20.JPG / page 701" |
| warn | BQ110 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ111 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ111 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Republic of Rio Grande. And Friend of the People. (Brownsville, Tex.), Vol. 1, No" |
| warn | BQ117 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ117 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / HYMNES et PAVILLONS DʼINDOCHINE 1941 Leaders flags anthems of" |
| warn | BQ128 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ128 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| warn | BQ129 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ129 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ129 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ129 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ129 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ129 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ130 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ130 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ130 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ130 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ130 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ130 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ131 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ131 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ131 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ131 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ131 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ131 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ132 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ132 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ132 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ132 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ132 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ132 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ133 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ133 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ133 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ133 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ133 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ133 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ134 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ134 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ134 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ134 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ134 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ134 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ135 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ135 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ135 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ135 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ135 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ135 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ136 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ136 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ136 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ136 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ136 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ136 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ137 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ137 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ137 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ137 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ137 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ137 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ138 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ138 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ138 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ138 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ138 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ138 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ139 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ139 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ139 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ139 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ139 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ139 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ140 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ140 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ140 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ140 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ140 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | BQ140 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | BQ141 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ141 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| warn | BQ142 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ142 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ142 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ143 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ143 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ143 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ144 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ144 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ144 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ144 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ144 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ144 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe" |
| warn | BQ145 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ145 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ145 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ145 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ145 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ145 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe" |
| warn | BQ146 | G101_required_field_value_not_observed | record_id | answer does not visibly include an evidence value for this required field |
| warn | BQ146 | G101_required_field_value_not_observed | title | answer does not visibly include an evidence value for this required field |
| warn | BQ146 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ146 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ146 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| fail | BQ146 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe" |
| warn | BQ161 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ161 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ161 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| warn | BQ162 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ162 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ163 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ163 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ163 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ163 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| warn | BQ164 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ164 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ164 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ165 | G101_required_field_value_not_observed | date_text | answer does not visibly include an evidence value for this required field |
| warn | BQ165 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ165 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ166 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ166 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| fail | BQ166 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / Putzmühle im Pöbeltal 002.JPG" |
| warn | BQ167 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ167 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ167 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| warn | BQ169 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| warn | BQ172 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ172 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| fail | BQ172 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source / The Town" |
| warn | BQ173 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ173 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| warn | BQ174 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ174 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |
| fail | BQ174 | G005_unverified_field_assertion | source | asserted="Wikimedia Commons file source" |
| warn | BQ176 | G101_required_field_value_not_observed | region | answer does not visibly include an evidence value for this required field |
| warn | BQ176 | G101_required_field_value_not_observed | source | answer does not visibly include an evidence value for this required field |
| warn | BQ176 | G101_required_field_value_not_observed | topology | answer does not visibly include an evidence value for this required field |

## Runtime Errors

| Query | Status | Error |
|---|---|---|
| none | none | none |

## Interpretation

- A paper-quality round requires all 30 seed queries to complete or an explicit
  failure-analysis table for device/runtime failures.
- Contract failures block generated-answer quality claims.
- Contract warnings can still be useful for prompt and evidence-packet tuning,
  but they should not be reported as faithful answers without review.
