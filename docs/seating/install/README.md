# Redoslijed promjena — još ništa ne izvršavati

Paket je izvršen na izoliranom lokalnom PostgreSQL-u; rezultati i granice su u ../CHECKS.md. Produkcijska baza nije mijenjana. Prvo proći izolirane scenarije iz ../README.md. Ne pokretati definitions.

| Korak | Što mijenja |
| --- | --- |
| 000_preflight_read_only.sql | Metadata/count provjera; ako project_guests već postoji, stati i pregledati ga. SQL Editor spremljena mapa nije dokaz postojeće DB tablice. |
| 001_tables_constraints_backfill.sql | Nove tablice; invitation_guests.project_guest_id i tri constrainta; rsvp_response_guests composite UNIQUE; backfill jedan postojeći gost → jedna osoba. Grupe i recipienti ostaju. |
| 002_functions_triggers.sql | Person/link/seating RPC-i; izmijenjeni postojeći create/update/delete guest; izvedene name kopije i generic/plan guardovi. get_public_rsvp tijelo ostaje isto. |
| 003_indexes_rls_grants.sql | Novi indexes/member SELECT RLS; write RPC ACL; private helperi nisu client API. |
| 004_verify_commit.sql | Backfill provjere i jedini COMMIT. |
| 005_verify_read_only.sql | Nakon instalacije: prava, FK i counts bez osobnih podataka. |

Za buduće izvršavanje u Supabase SQL Editoru koristi samo INSTALL_ALL_REVIEW.sql: sadrži točno 001–004 u jednoj transakciji. Nemoj izvršavati i bundle i pojedinačne datoteke. Različita pokretanja SQL Editora ne jamče istu DB vezu; zbog toga 001–004 nisu četiri neovisna poziva. Na grešci odustani/ROLLBACK i istraži; ne nastavljaj preskakanjem koraka. CREATE bez IF NOT EXISTS namjerno zaustavlja ponovno izvršavanje.

Prije cutovera backup i zaustavljanje guest/RSVP upisa. PROJECT_GUESTS_ENABLED ostaje unset/false do instalacije i provjera. SQL je instaliran i database.types.ts regeneriran; privremeni schema ugovor je uklonjen. Provjeri TS/lint/build, deployaj pa postavi PROJECT_GUESTS_ENABLED=true na odgovarajućem environmentu i redeployaj. Postojeći create/update guest RPC signatures/output ostaju kompatibilni; stare aplikacije rade preko DB name snapshot triggera i insert triggera. Nema potrebe dirati storage cleanup cron.

Rollback prije COMMIT-a je transakcijski. Nakon COMMIT-a ne dropati project_guests naslijepo; arhivirane/povezane osobe i nova mjesta možda već postoje. Za app rollback može se isključiti flag, uz zadržavanje kompatibilnih SQL funkcija. Nova podatkovna povratna migracija traži zaseban pregled.

SQL001 ima i guard hashova četiri pregledana postojeća guest/public RSVP RPC-a. Ako se u međuvremenu promijene, instalacija staje radi novog pregleda; ne uklanjati guard da bi prošlo. Hashovi su samo SQL definicije, ne podaci ili tokeni.

Predlošci su uključeni u isti 001–003 redoslijed: seating_templates tablica/constraints, JSON validator i copy RPC, RLS/index/grants. Katalog ostaje prazan; admin primjere unosi ručno. Invitation templates tablica/prava nisu mijenjani.
