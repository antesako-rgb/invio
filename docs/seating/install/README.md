# Instalacija i nadogradnje seating modela

Osnovni paket 001–004 korisnik je već instalirao i regenerirao DB tipove. Izolirane provjere i njihove granice zapisane su u [CHECKS.md](../CHECKS.md). Korisnik je instalirao i nadogradnju 006; agent je 2026-10-11 read-only provjerom live baze potvrdio sve njezine stupce, constraints, triggere, funkcijske hashove, RLS i ACL. Ne ponavljati 006 na toj bazi. Definitions su definicije za spremanje/pregled; ne izvršavati ih kao migraciju.

| Korak | Što mijenja |
| --- | --- |
| 000_preflight_read_only.sql | Metadata/count provjera; ako project_guests već postoji, stati i pregledati ga. SQL Editor spremljena mapa nije dokaz postojeće DB tablice. |
| 001_tables_constraints_backfill.sql | Nove tablice; invitation_guests.project_guest_id i tri constrainta; rsvp_response_guests composite UNIQUE; backfill jedan postojeći gost → jedna osoba. Grupe i recipienti ostaju. |
| 002_functions_triggers.sql | Person/link/seating RPC-i; izmijenjeni postojeći create/update/delete guest; izvedene name kopije i generic/plan guardovi. get_public_rsvp tijelo ostaje isto. |
| 003_indexes_rls_grants.sql | Novi indexes/member SELECT RLS; write RPC ACL; private helperi nisu client API. |
| 004_verify_commit.sql | Backfill provjere i jedini COMMIT. |
| 005_verify_read_only.sql | Nakon instalacije: prava, FK i counts bez osobnih podataka. |

Samo za prvu instalaciju na bazu koja još nema ovaj model koristi INSTALL_ALL_REVIEW.sql: sadrži točno 001–004 u jednoj transakciji. Nemoj izvršavati i bundle i pojedinačne datoteke. Različita pokretanja SQL Editora ne jamče istu DB vezu; zbog toga 001–004 nisu četiri neovisna poziva. Na grešci odustani/ROLLBACK i istraži; ne nastavljaj preskakanjem koraka. CREATE bez IF NOT EXISTS namjerno zaustavlja ponovno izvršavanje.

Prva instalacija traži backup i zaustavljanje guest/RSVP upisa; flag se uključuje tek nakon SQL provjera i regeneracije tipova. Taj je korak korisnik već izvršio, uključujući hosted flag. Privremeni schema ugovor je uklonjen. Nadogradnja 006 ne mijenja flag ili environment. Postojeći create/update guest RPC signatures/output ostaju kompatibilni; stare aplikacije rade preko DB name snapshot triggera i insert triggera. Nema potrebe dirati storage cleanup cron.

Rollback prije COMMIT-a je transakcijski. Nakon COMMIT-a ne dropati project_guests naslijepo; arhivirane/povezane osobe i nova mjesta možda već postoje. Za app rollback može se isključiti flag, uz zadržavanje kompatibilnih SQL funkcija. Nova podatkovna povratna migracija traži zaseban pregled.

SQL001 ima i guard hashova četiri pregledana postojeća guest/public RSVP RPC-a. Ako se u međuvremenu promijene, instalacija staje radi novog pregleda; ne uklanjati guard da bi prošlo. Hashovi su samo SQL definicije, ne podaci ili tokeni.

Predlošci su uključeni u isti 001–003 redoslijed: seating_templates tablica/constraints, JSON validator i copy RPC, RLS/index/grants. Katalog ostaje prazan; admin primjere unosi ručno. Invitation templates tablica/prava nisu mijenjani.


## 006 — konkretne stolice na već instaliranom modelu

Paket je provjeren na izoliranom PGlite 0.5.8 / PostgreSQL 18.3: 40 scenarija prolazi, uključujući bazu sa svim tablicama i nula podataka. To nije live izvršavanje ni test dviju istodobnih DB veza. Detalji su u [CHECKS.md](../CHECKS.md), model i budući UI u [SEAT_ASSIGNMENTS_REVIEW.md](../SEAT_ASSIGNMENTS_REVIEW.md).

**Prazna baza s postojećim tablicama je podržana.** Ako nema tablica/funkcija iz osnovnog modela, 006 se ne može izvršiti: prvo treba osnovna aplikacijska schema i prva instalacija 001–004. Ako je osnovni paket već instaliran, ne ponavljati ga ni kada su tablice prazne.

| Redoslijed | Datoteka | Namjena |
| --- | --- | --- |
| 1 | [006_preflight_read_only.sql](006_preflight_read_only.sql) | Read-only pregled postojećih funkcija/hashova, RLS/ACL, constraints, triggera i broja dodjela. |
| 2 | [006_seat_assignments_upgrade.sql](006_seat_assignments_upgrade.sql) | Jedina izvršiva nadogradnja: cijela datoteka u jednoj transakciji, s vlastitim preflightom, provjerama i COMMIT-om. |
| 3 | [006_verify_read_only.sql](006_verify_read_only.sql) | Read-only pregled instalirane nadogradnje i integriteta podataka. |

Prvo pregledati SQL, napraviti backup i zaustaviti seating upise; nadogradnja kratkotrajno ekskluzivno zaključava i projects/project_guests pa planirati pauzu povezanih upisa. Izvršavati kao postgres. Prvi korak treba dati ready_* = true za sve retke, točno pet pregledanih tablica s RLS-om i jednom member SELECT politikom te tables_over_capacity = 0. Ne smije biti postojećeg seat_number stupca, novih 006 funkcija ili user triggera na seating_assignments/seating_tables. Pregledati i tri postojeća assignment PK/FK-a te constraint kapaciteta 1–100. Nadogradnja sama ponavlja stroge provjere pod zaključavanjem; hashovi uspoređuju whitespace-normalizirani pg_proc.prosrc uz owner/language/security/search_path/ACL. Ako baseline odstupa, stati radi pregleda; ne uklanjati guardove.

Korak 2 kopirati **cijeli** u jedan SQL Editor poziv. Nema zasebnih 006 dijelova koji se nastavljaju na drugoj vezi. Na grešci ROLLBACK i istražiti; CREATE/ADD bez IF NOT EXISTS namjerno odbija ponavljanje. Jedini COMMIT dolazi nakon provjere očuvanja svih postojećih dodjela i revizija, stupca, constraints, triggera i funkcijskih prava. Transakcijski NOTIFY osvježava PostgREST schema/RPC cache nakon COMMIT-a.

Nadogradnja dodaje nullable seating_assignments.seat_number, CHECK 1–100 i UNIQUE(plan_id,table_id,seat_number). Postojeći retci ostaju na istim stolovima uz NULL, bez automatskog odabira stolice. Nema novih tablica, promjene imena, recipienta ili RSVP-a. Novi assign_seating_guest_to_seat koristi isti p_revision i vraća bigint novu reviziju; konkretno zauzeto mjesto odbija bez promjene stare dodjele. NULL mjesto zadržava/odabire stol bez stolice, NULL stol + NULL mjesto uklanja dodjelu. Arhivirana osoba smije osloboditi postojeću stolicu ili dodjelu, ali ne dobiti/premjestiti mjesto.

Postojeći assign_seating_guest čuva potpis/output: isti stol zadržava seat_number, drugi ga čisti, NULL stol briše dodjelu. Upisi koriste eksplicitni popis stupaca. manage_seating_table zadržava postojeće tijelo/potpis; novi BEFORE UPDATE guard odbija kapacitet ispod popunjenosti, uklanjanje zauzetog broja i promjenu oblika uz konkretne dodjele. Novi assignment guard štiti kapacitet/broj i kod trusted direktnog DML-a. Browser i dalje nema izravna prava upisa; private helperi nisu API. Upisi aplikacije koriste zaključavanje projekta pa plana. Trusted ručni upisi moraju se izvoditi uz zaustavljene aplikacijske upise ili isti redoslijed zaključavanja; trigger nije zamjena za RPC/reviziju.

Završni verify očekuje seat_column_valid, seat_constraints_present_and_validated, seat_triggers_enabled, function_matches_review i acl_matches_review = true. Pročitati i prikazane definicije constraints/triggera. Za javne assignment RPC-e member_execute = true, za private funkcije false; anon_execute i service_execute = false. RLS = true; jedina politika svake prikazane tablice: authenticated SELECT s private.is_project_member(project_id). member_select = true, member_write i anon_access = false. invalid_* i tables_over_capacity = 0. Odmah nakon nadogradnje assignments_after mora odgovarati assignments_before, concrete_chairs = 0 i table_only_assignments = assignments_after. Ako su podaci prazni, sva tri broja su 0. Nakon stvarnih upisa mjesta concrete_chairs više ne mora biti 0.

Tek nakon uspješnog koraka 3 regenerirati database.types.ts iz instalirane baze. Ne dopisivati ručno generirane tipove niti vraćati privremeni contract. Frontend konkretnih mjesta i imena iznad stolica slijedi zasebno; sadašnji editor ostaje kompatibilan i dodjeljuje goste stolovima. Nakon UI nadogradnje provjeriti TS/lint/build i ručne mobilne tokove.

Rollback prije COMMIT-a je transakcijski. Nakon COMMIT-a zadržati additive model i kompatibilni RPC kod vraćanja aplikacije. Ne dropati seat_number/funkcije radi app rollbacka jer mogu sadržavati stvarne dodjele; povratna podatkovna migracija traži zaseban pregled.

### Preostala provjera s dvije veze na stagingu

Na izoliranoj/staging bazi koristiti dvije stvarno odvojene veze, iste member ovlasti i isti početni p_revision. Prva transakcija dodjeljuje slobodnu stolicu i zadržava transakciju otvorenom; druga pokušava dodijeliti drugog gosta toj stolici. Nakon COMMIT-a prve druga mora dobiti 40001, bez promjene svoje stare dodjele. Ponovni pokušaj s aktualnom revizijom mora dobiti 23505 Seat occupied. Provjeriti i istodobno smanjenje kapaciteta/assignment te očuvanje brojeva/revizija. Ovaj scenarij nije izvršen u runtimeu s jednom vezom; ne testirati upisima na live podatke kroz read-only verify.


## 007 — skupna i automatska dodjela na instaliranom 006

Dodaje samo assign_seating_guests RPC. Nema novih tablica ili migracije gostiju/dodjela, uključujući praznu bazu korisnika. Redoslijed: [007_preflight_read_only.sql](007_preflight_read_only.sql), zatim cijeli [007_bulk_seating_upgrade.sql](007_bulk_seating_upgrade.sql), potom [007_verify_read_only.sql](007_verify_read_only.sql) i regeneracija tipova. Ne ponavljati 006. Potpis, prava, atomska pravila, UX i granice provjera: [BULK_SEATING.md](../BULK_SEATING.md). 007 nije izvršen na live bazi od strane agenta.


## 008 — atomsko ručno spremanje grupe

Korisnik je 2026-10-11 potvrdio instalaciju, dostavio verify s rpc_008_verified=true/member_execute=true i regenerirao DB tipove. Frontend je povezan s generiranim potpisima 007/008. Na toj bazi ne ponavljati instalaciju; upute ispod vrijede za drugu bazu bez 008.

Samo nova SQL funkcija assign_seating_guests_to_seats i njezin authenticated EXECUTE grant; nema promjene tablica ni migracije/backfilla gostiju ili dodjela. Na instaliranom 007 redom: [008_preflight_read_only.sql](008_preflight_read_only.sql), cijeli [008_manual_bulk_upgrade.sql](008_manual_bulk_upgrade.sql), [008_verify_read_only.sql](008_verify_read_only.sql), regeneracija tipova. Ne ponavljati 006/007. 008 nije izvršen na live bazi od strane agenta. Detalji i aktualni UX: [BULK_SEATING.md](../BULK_SEATING.md).

## Završni RSVP model na korisnikovim praznim tablicama

**Aktualna dodatna postava:** javni gosti, ručni status i grupe imaju [ATTENDANCE_AND_GROUPS.md](../ATTENDANCE_AND_GROUPS.md). Na korisnikovom već provjerenom RSVP modelu koristi se samo `PREFLIGHT_EMPTY_ATTENDANCE_MODEL.sql` → cijeli `APPLY_EMPTY_ATTENDANCE_MODEL.sql` → `VERIFY_ATTENDANCE_MODEL_READ_ONLY.sql` → regeneracija tipova. Nema numerirane migracije/backfilla. Postava zahtijeva prazne projektne goste i seating podatke i ništa ne briše. Nakon toga stari RSVP verify nije aktualni verify jer provjerava ranije tijelo sync RPC-a.

Korisnik je 2026-10-11 potvrdio da je obrisao podatke, ali zadržao tablice/funkcije. Nema zasebnog guest backfilla ili numerirane migracije za taj slučaj. Pripremljene su canonical definitions i jedna prazna-model postava: [PREFLIGHT_EMPTY_RSVP_MODEL.sql](PREFLIGHT_EMPTY_RSVP_MODEL.sql) → cijeli [APPLY_EMPTY_RSVP_MODEL.sql](APPLY_EMPTY_RSVP_MODEL.sql) → [VERIFY_RSVP_MODEL_READ_ONLY.sql](VERIFY_RSVP_MODEL_READ_ONLY.sql), zatim regeneracija DB tipova. Ne ponavljati 001–008 i ne izvršavati originalni INSTALL_ALL_REVIEW.

Postava dodaje private.seating_rsvp_exclusions, zamjenjuje manage_seating_participant uz isti potpis i dodaje sync_seating_rsvp_guests. Ne briše podatke, ne kopira goste i ne izvršava sync pri postavi; guard traži prazne seating sudionike/dodjele i nepromijenjen instalirani baseline. Potvrđeni dolasci zatim se automatski uključuju pri otvaranju/osvježavanju/povratku u editor; ručno uklonjeni gosti ostaju uklonjeni. Model, frontend tok i ograničenja: [RSVP_FLOW.md](../RSVP_FLOW.md). Agent nije izvršio SQL na live bazi.
