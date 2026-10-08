# Predlošci rasporeda u bazi

## Postojeći obrazac

Read-only pregled invitation_templates potvrdio je document JSONB, document_version, is_active, sort_order, event_type i authenticated SELECT samo aktivnih predložaka. postgres/service_role su pouzdani administratorski write boundary. Poseban admin user helper/RPC nije pronađen. Taj obrazac primijenjen je na seating_templates; nije uvedeno novo članstvo/admin pravilo.

## Uređivanje

Za sada admin uređuje predloške u Supabaseu kao postgres. service_role ima prava za budući provjereni server admin alat; taj ključ nikada browseru. Obični authenticated korisnik, uključujući vlasnika projekta, nema template write prava. Budući admin UI mora zasebno dokazivati administratorsku ovlast na serveru prije korištenja service clienta; trenutno nije implementiran.

Predložak ima name/slug/description, document_version=1, is_active (default false), sort_order, optional event_type i timestamps. document sadrži samo width_cm, height_cm i tables. Svaki stol ima name, shape, capacity, x_cm, y_cm, width_cm, height_cm, rotation_deg. Nema project ID-a, gosta, RSVP izvora, dodjele ili spremljenog table ID-a. DB trigger validira i draft i aktivni predložak; neispravan JSON ne može se spremiti.

Dimenzije prostorije 100–100000 cm; najviše 200 stolova po predlošku; kapacitet stola 1–100; dimenzije stola 10–10000 cm; rotacija 0–359, integer brojevi. Round zahtijeva width=height. Stol mora stati unutar prostorije prema rotiranim granicama oko centra, kao seating RPC. Rotirani bounding box provjerava se SQL/TS helperom oko centra stola. Detekcija preklapanja nije dio validatora.

Primjeri su u [TEMPLATE_EXAMPLES.json](TEMPLATE_EXAMPLES.json). To su primjeri za ručni unos, ne seed migracija; katalog nakon instalacije počinje prazan. Prazan prostor se može dobiti i postojećim create plan RPC-em.

## Odabir korisnika

getSeatingTemplates čita aktivan katalog. createPlanFromTemplateAction poziva member-autorizirani create_seating_plan_from_template. RPC zaključava projekt i aktivni template, validira JSON pa u jednoj transakciji stvara novi plan i nove UUID-eve stolova. RSVP source, ako odabran, mora biti pozivnica istog projekta (FK). Plan počinje revision=1 i bez sudionika/dodjela. Browser šalje template ID, ne vlastiti JSON raspored za copy operaciju.

Ne postoji primjena predloška preko postojećeg plana. Promjene, deaktivacija i brisanje predloška ne mijenjaju stvorene planove. Plan nema obveznu vezu prema templateu; čuva vlastitu kopiju. Nepoznati/disabled template odbijen je; greška tijekom kopiranja rollbacka cijelu operaciju.

## Paket

Nova mapa definitions/seating_templates slijedi table/constraints/indexes/rls/grants/trigger/verify/function organizaciju. Numerirani 001 dodaje tablicu/constraints, 002 validator/trigger/copy RPC, 003 prava/index/RLS. Bundle je obnovljen. Nema seedanja, DB izvršavanja ni admin editora. PROJECT_GUESTS_ENABLED ostaje isti gate za aplikacijski prijelaz.

Koordinate i ulaz/podij/pozornica: [GEOMETRY_AND_SPACE.md](GEOMETRY_AND_SPACE.md).
