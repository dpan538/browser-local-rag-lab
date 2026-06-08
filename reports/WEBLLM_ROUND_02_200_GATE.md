# WebLLM Round Gate

Generated: 2026-06-08T06:35:01.549Z

This gate decides whether a browser-exported WebLLM run is clean enough to
continue. For a 50-query pilot, `ready_for_next_step=true` means it is safe to
start the 200-query run. For a 200-query run, it means the runtime export passed
the mechanical gates and can move to review packaging.

## Summary

- Expected rows: 200
- Result rows: 200
- Completed rows: 200
- Error rows: 0
- Metric issues: 0
- Contract failures: 61
- Contract warnings: 146
- Gate warnings: 160
- Ready for next step: no

## Findings

| Severity | Code | Query | Detail |
|---|---|---|---|
| warn | CONTRACT_G101_required_field_value_not_observed | BQ01 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ04 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ14 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ14 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ14 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ25 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ26 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ058 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ058 | asserted="Wikimedia Commons file source / Sergey Filippov PSE Russia 2012.jpg / page 25675" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ061 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ061 | asserted="Wikimedia Commons file source / Stamp commemorating the centenary of the birth of José Manuel Estrada.jpg / page 30" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ062 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ062 | asserted="Wikimedia Commons file source / Temple of" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ065 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ065 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ066 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ066 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ067 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ067 | asserted="Wikimedia Commons file source / Stamp 1968 UAE-RK MiNr0" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ068 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ069 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ069 | asserted="Wikimedia Commons file source / East India postage Queen Victoria stamp used in Zanzibar -" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ070 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ070 | asserted="Wikimedia Commons file source / East India postage Queen Victoria stamp used in Zanzibar-" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ071 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ072 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ072 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ074 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ074 | asserted="Wikimedia Commons file source / Oud-generaal als straatmuzikant, NG-85" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ076 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ076 | asserted="Wikimedia Commons file source /" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ089 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ089 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ089 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ089 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ089 | missing tags=RIGHTS/rights |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ089 | missing tags=REUSE/reuse_permission |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ089 | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ094 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ094 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ094 | missing tags=REUSE/reuse_permission |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ094 | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ095 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ095 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ095 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ095 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ095 | missing tags=RIGHTS/rights |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ095 | missing tags=REUSE/reuse_permission |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ095 | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ096 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ096 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ096 | missing tags=REUSE/reuse_permission |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ096 | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ098 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ098 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ098 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ098 | asserted="IMG03: Gallica SRU metadata reports public-domain rights;" |
| fail | CONTRACT_G007_source_rights_tag_mismatch | BQ098 | asserted="IMG03: Gallica SRU metadata reports public-domain rights;" |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ098 | missing tags=REUSE/reuse_permission |
| fail | CONTRACT_G006_source_rights_tag_missing | BQ098 | missing tags=PUBLIC_DOMAIN/public_domain_status |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ099 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ099 | asserted="IMG03: Gallica SRU metadata reports public-domain rights; IIIF image is source-hosted by BnB." |
| fail | CONTRACT_G007_source_rights_tag_mismatch | BQ099 | asserted="IMG03: Gallica SRU metadata reports public-domain rights; IIIF image is source-hosted by BnB." |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ100 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G007_source_rights_tag_mismatch | BQ100 | asserted="source_metadata_mentions_public_domain_but_global_public_domain_status_not_d" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ103 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ103 | asserted="Wikimedia Commons file source / Sergey Filippov PSE Russia 2012.jpg / page 2" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ104 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ104 | asserted="Wikimedia Commons file source / Diego Portales-D S No 20.JPG / page 701" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ110 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ111 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ111 | asserted="Wikimedia Commons file source / Republic of Rio Grande. And Friend of the People. (Brownsville, Tex.), Vol. 1, No" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ117 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ117 | asserted="Wikimedia Commons file source / HYMNES et PAVILLONS DʼINDOCHINE 1941 Leaders flags anthems of" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ128 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ128 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ129 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ129 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ129 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ129 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ129 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ129 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ130 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ130 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ130 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ130 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ130 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ130 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ131 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ131 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ131 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ131 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ131 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ131 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ132 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ132 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ132 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ132 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ132 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ132 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ133 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ133 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ133 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ133 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ133 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ133 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ134 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ134 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ134 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ134 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ134 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ134 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ135 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ135 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ135 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ135 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ135 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ135 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ136 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ136 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ136 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ136 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ136 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ136 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ137 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ137 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ137 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ137 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ137 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ137 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ138 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ138 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ138 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ138 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ138 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ138 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ139 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ139 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ139 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ139 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ139 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ139 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ140 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ140 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ140 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ140 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ140 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| fail | CONTRACT_G005_unverified_field_assertion | BQ140 | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ141 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ141 | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ142 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ142 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ142 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ143 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ143 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ143 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ144 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ144 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ144 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ144 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ144 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ144 | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ145 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ145 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ145 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ145 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ145 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ145 | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ146 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ146 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ146 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ146 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ146 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ146 | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ161 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ161 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ161 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ162 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ162 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ163 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ163 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ163 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ163 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ164 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ164 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ164 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ165 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ165 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ165 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ166 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ166 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ166 | asserted="Wikimedia Commons file source / Putzmühle im Pöbeltal 002.JPG" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ167 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ167 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ167 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ169 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ172 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ172 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ172 | asserted="Wikimedia Commons file source / The Town" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ173 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ173 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ174 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ174 | answer does not visibly include an evidence value for this required field |
| fail | CONTRACT_G005_unverified_field_assertion | BQ174 | asserted="Wikimedia Commons file source" |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ176 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ176 | answer does not visibly include an evidence value for this required field |
| warn | CONTRACT_G101_required_field_value_not_observed | BQ176 | answer does not visibly include an evidence value for this required field |
| warn | P003_generation_speed_low | BQ12 | tokens_per_second=6.94; avg=15.87 |
| warn | P003_generation_speed_low | BQ13 | tokens_per_second=6.94; avg=15.87 |
| warn | P003_generation_speed_low | BQ066 | tokens_per_second=7.84; avg=15.87 |
| warn | P003_generation_speed_low | BQ088 | tokens_per_second=7.73; avg=15.87 |
| warn | P003_generation_speed_low | BQ089 | tokens_per_second=4.09; avg=15.87 |
| warn | P003_generation_speed_low | BQ096 | tokens_per_second=6.77; avg=15.87 |
| warn | P003_generation_speed_low | BQ110 | tokens_per_second=6.62; avg=15.87 |
| warn | P003_generation_speed_low | BQ112 | tokens_per_second=6.12; avg=15.87 |
| warn | P003_generation_speed_low | BQ127 | tokens_per_second=6.30; avg=15.87 |
| warn | P003_generation_speed_low | BQ162 | tokens_per_second=7.17; avg=15.87 |
| warn | P003_generation_speed_low | BQ163 | tokens_per_second=6.96; avg=15.87 |
| warn | P003_generation_speed_low | BQ165 | tokens_per_second=7.66; avg=15.87 |
| warn | P003_generation_speed_low | BQ167 | tokens_per_second=6.68; avg=15.87 |
| warn | P003_generation_speed_low | BQ174 | tokens_per_second=7.39; avg=15.87 |
