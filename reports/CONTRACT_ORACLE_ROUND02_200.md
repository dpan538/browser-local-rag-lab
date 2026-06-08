# Contract Oracle Round 02 200

Generated: 2026-06-08T07:00:26.946Z

This pre-model gate creates deterministic answers from the retrieved evidence
packet and sends them through the same generation contract validator. If this
fails, a WebLLM rerun cannot pass by prompt engineering alone.

## Summary

- Rows checked: 200
- Gold coverage failures: 49
- Contract failures: 27
- Contract warnings: 59
- Ready for WebLLM rerun: no

## Gold Coverage Failures

| Query | Intent | Missing gold evidence IDs |
|---|---|---|
| BQ01 | archive_orientation | SURF-ER1830R004, SURF-ER1830R015 |
| BQ04 | casual_archive_help | SURF-ER1830R015, SURF-CRG2026R0051 |
| BQ031 | archive_orientation | SURF-CRG2026R0050 |
| BQ032 | archive_orientation | SURF-GAX1970R002, SURF-CRG2026R0051 |
| BQ033 | archive_orientation | SURF-GA1970R001, SURF-CRG2026R0052 |
| BQ034 | archive_orientation | SURF-GAX1970R003, SURF-CRG2026R0071 |
| BQ035 | archive_orientation | SURF-GAX1970R004, SURF-COM1970R007 |
| BQ036 | archive_orientation | SURF-GAX1970R005, SURF-CRG2026R0235 |
| BQ037 | archive_orientation | SURF-CRG2026R0246 |
| BQ038 | archive_orientation | SURF-CRG2026R0050, SURF-CRG2026R0274 |
| BQ039 | archive_orientation | SURF-CRG2026R0051, SURF-CGS2026R0681 |
| BQ040 | archive_orientation | SURF-CRG2026R0052, SURF-CGS2026R0328 |
| BQ041 | archive_orientation | SURF-CRG2026R0071, SURF-CGS2026R0030 |
| BQ042 | archive_orientation | SURF-COM1970R007 |
| BQ043 | archive_orientation | SURF-CRG2026R0235, SURF-CGS2026R0904 |
| BQ128 | region_period_recommendation | SURF-CRG2026R0050 |
| BQ129 | region_period_recommendation | SURF-CRG2026R0050, SURF-CRG2026R0051 |
| BQ130 | region_period_recommendation | SURF-CRG2026R0051, SURF-CRG2026R0052 |
| BQ131 | region_period_recommendation | SURF-CRG2026R0052, SURF-CRG2026R0071 |
| BQ132 | region_period_recommendation | SURF-CRG2026R0071, SURF-CRG2026R0235 |
| BQ133 | region_period_recommendation | SURF-CRG2026R0235, SURF-CRG2026R0246 |
| BQ134 | region_period_recommendation | SURF-CRG2026R0246, SURF-CRG2026R0274 |
| BQ135 | region_period_recommendation | SURF-CRG2026R0274, SURF-CRG2026R0020 |
| BQ136 | region_period_recommendation | SURF-CRG2026R0020, SURF-CRG2026R0175 |
| BQ137 | region_period_recommendation | SURF-CRG2026R0175, SURF-CRG2026R0002 |
| BQ138 | region_period_recommendation | SURF-CRG2026R0002, SURF-CRG2026R0003 |
| BQ139 | region_period_recommendation | SURF-CRG2026R0003, SURF-CRG2026R0004 |
| BQ140 | region_period_recommendation | SURF-CRG2026R0004, SURF-CRG2026R0005 |
| BQ141 | region_period_recommendation | SURF-CRG2026R0005 |
| BQ143 | region_period_recommendation | SURF-GAX1970R003 |
| BQ144 | region_period_recommendation | SURF-GAX1970R003, SURF-GAX1970R004 |
| BQ145 | region_period_recommendation | SURF-GAX1970R004, SURF-GAX1970R005 |
| BQ146 | region_period_recommendation | SURF-GAX1970R005, SURF-ER1830R046 |
| BQ161 | more_context | SURF-ER1830R004 |
| BQ162 | more_context | SURF-COMPOUND-ARUNDEL-SOCIETY-CHROMOLITHOGRAPH-COPIES |
| BQ163 | more_context | SURF-ER1830R008 |
| BQ164 | more_context | SURF-ER1830R018 |
| BQ165 | more_context | SURF-CRG2026R0004 |
| BQ166 | more_context | SURF-CRG2026R0005 |
| BQ167 | more_context | SURF-CRG2026R0001 |
| BQ168 | more_context | SURF-GAX1970R002 |
| BQ169 | more_context | SURF-GA1970R001 |
| BQ170 | more_context | SURF-GAX1970R003 |
| BQ171 | more_context | SURF-GAX1970R004 |
| BQ172 | more_context | SURF-GAX1970R005 |
| BQ173 | more_context | SURF-CRG2026R0006 |
| BQ174 | more_context | SURF-CRG2026R0050 |
| BQ175 | more_context | SURF-CRG2026R0051 |
| BQ176 | more_context | SURF-CRG2026R0052 |

## Contract Failures

| Query | Code | Field | Detail |
|---|---|---|---|
| BQ129 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ129 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ130 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ130 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ131 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ131 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ132 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ132 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ133 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ133 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ134 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ134 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ135 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ135 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ136 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ136 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ137 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ137 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ138 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ138 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ139 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ139 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ140 | G005_unverified_field_assertion | source | asserted="Gallica / BnF APIs / https://gallica.bnf.fr/ark:/12148/bpt6k5456008h | Wikimedia Commons file source / Paganini par David d'Angers (Angers) (14911656518).jpg / page 37213183 / https://commons.wikimedia.org/wiki/File:Paganini_par_David_d%27Angers_(Angers)_(14911656518).jpg | V&A Collections API / https://collections.vam.ac.uk/item/O693551/" |
| BQ140 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | Paganini par David d'Angers (Angers) (14911656518).jpg | Trade card grouped records, 1830-1922" |
| BQ144 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe]" |
| BQ145 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe]" |
| BQ146 | G005_unverified_field_assertion | title | asserted="Monsieur, vous avez réclamé votre inscription... | La typographie : poëme / par M. L. Pelletier | Théâtre dirigé par M. Dorsay ci-devant Mad.e Saqui Boulevard du Temple en face le jardin turc tous les jours, excepté le Dimanche, Jane Gray Drame historique en 3 actes et 5 tableaux de M. Leblanc, musique de M. Bellon, décors de M. Rascalon mise en scène de M. Dupuis : [estampe]" |

## Warning Count

59 contract warnings were observed in oracle mode. Treat these
as pre-run issues unless intentionally adjudicated.
