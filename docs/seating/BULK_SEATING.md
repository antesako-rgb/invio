# Skupno dodavanje gostiju na stol

Aktualno stanje (2026-10-11): korisnik je instalirao 007 i 008, dostavio uspješan 008 verify (rpc_008_verified=true, member_execute=true) i regenerirao DB tipove. Frontend koristi generirane potpise; nema privremenog schema ugovora. Agent nije izvršavao live SQL upise.

## Glavni postupak

1. Klik na stol otvara sve njegove numerirane stolice, goste i sklopive postavke.
2. Dodaj goste otvara jedan pretraživ popis s kućicama. Zadano su prikazani gosti bez stola, uključujući aktivne projektne osobe koje još nisu uključene u plan.
3. Označi više osoba ili Odaberi prikazane. Taj gumb popunjava preostala slobodna mjesta do limita 100 po grupi; osobe koje su već za ciljanim stolom ne troše dodatni kapacitet. Prikaži sve goste omogućuje premještanje s drugih stolova i izbor osoba koje su već za ciljanim stolom.
4. Dodaj odabrane (N) odmah potvrđuje cijelu grupu. Ne postoji dodatni korak pregleda ni drugi gumb za spremanje. Slobodne stolice dodjeljuju se automatski; postojeće stolice osoba na ciljanom stolu ostaju.

Odabrani gosti ostaju vidljivi tijekom pretrage i filtriranja; odabir se može pojedinačno poništiti ili očistiti. Redak prikazuje postojeći raspored/plan status, RSVP/arhivu i predloženi broj pri automatskoj dodjeli. Footer prikazuje broj odabranih, zauzetost nakon dodavanja i broj premještanja s drugih stolova. Enter u pretrazi ne sprema raspored.

Točne stolice ostaju dostupne kao neobvezna kućica Želim odabrati točne stolice. Tada isti označeni retci dobivaju vlastiti select stolice; nema zasebnih kartica, koraka ili radio načina. Spremanje i dalje radi jednom potvrdom za cijelu grupu. Ne nude se tuđe zauzete stolice ni brojevi koje je odabrao drugi gost u grupi; vlastita postojeća stolica ostaje dostupna.

Novi gost otvara unos nove osobe i nakon stvaranja vraća u sačuvani grupni odabir. Uključivanje postojećih projektnih gostiju u plan dostupno je i u panelu Gosti. Nova osoba koristi postojeći create/include postupak, s očuvanjem ID-a ako uključivanje ne uspije; ti upisi nisu jedan atomski create+include RPC.

## Pojedinačna dodjela

Klik konkretne stolice na canvasu ili popisu preodabire taj broj. Mobilni/touch drop na stolicu također ga čuva; drop na tijelo stola predlaže automatsku stolicu. Klik gosta otvara njegovu dodjelu za premještanje ili uklanjanje sa stola. Polje Stolica ima Automatski odabir ili konkretan raspoloživ broj; nema zasebnog izbora Automatski/Ručno. Desktop koristi panel, mobitel donji dijalog. Predloženi automatski broj prikazan je uz polje Stolica, a footer sadrži samo Odustani i Spremi dodjelu.

Gosti bez stola ostaju neraspoređeni. Frontend za gosta za stolom uvijek traži konkretnu automatsku ili ručnu stolicu; nema Odredi kasnije, release uz ostanak za stolom ili konverzije starih dodjela. Nullable stupac i stari RPC-i ostaju kompatibilni s 006.

## RPC-i i atomska pravila

assign_seating_guests(p_plan_id uuid,p_revision bigint,p_guest_ids uuid[],p_table_id uuid,p_mode text) -> bigint

- auto: stol je obvezan; 1–100 različitih aktivnih projektnih gostiju. Osobe se uključuju u plan po potrebi. Postojeće konkretne stolice ciljanog stola ostaju; ostali dobivaju najmanji slobodan broj u redoslijedu odabira.
- include: NULL stol; cijela grupa uključuje se u plan bez promjene dodjela.
- Kapacitet broji svaku osobu jednom, uključujući postojeće NULL-seat retke. Greška poništava sve membership/assignment upise i reviziju. Jedna grupa povećava reviziju jednom.

assign_seating_guests_to_seats(p_plan_id uuid,p_revision bigint,p_table_id uuid,p_seats jsonb) -> bigint

p_seats je niz 1–100 objekata guest_id/seat_number. Provjeravaju se JSON oblik, različiti gosti/brojevi, aktivnost/projekt, raspon i zauzetost. Uključivanje u plan i sva mjesta spremaju se zajedno uz jednu reviziju. Nema implicitne zamjene dvaju gostiju ili istiskivanja zauzetog mjesta.

Oba RPC-a koriste postojeći project/plan auth i lock, postgres SECURITY DEFINER i prazan search_path. EXECUTE ima authenticated; anon, service_role i PUBLIC nemaju. Stari RPC-i, SELECT RLS i table grants ostaju. Konflikt ili nejasan transportni ishod zahtijeva reload; nema retrya niti fallbacka na pojedinačne upise grupe.

## Instalacija za drugu bazu

Na korisnikovoj bazi ovi koraci već su potvrđeni; ne ponavljati instalaciju. Nema migracije gostiju/dodjela ni promjene tablica.

- Na instaliranom 006: [007 preflight](install/007_preflight_read_only.sql), cijeli [007 upgrade](install/007_bulk_seating_upgrade.sql), [007 verify](install/007_verify_read_only.sql).
- Na instaliranom 007: [008 preflight](install/008_preflight_read_only.sql), cijeli [008 upgrade](install/008_manual_bulk_upgrade.sql), [008 verify](install/008_verify_read_only.sql).
- Regenerirati database.types.ts postojećim npm run db:types postupkom. Generirani tipovi ne uređuju se ručno. Definitions služe spremanju/pregledu, a ne instalaciji.

Nadogradnje imaju jednu transakciju, guardove, provjere definicija/prava i PostgREST NOTIFY nakon COMMIT-a. Ponovljena instalacija namjerno staje. Ostale instalacijske napomene: [install README](install/README.md).

## Provjere i ručni QA

124 trajna seating testa prolaze. Provjere koriste stvarni React server render i submit handler obrasca s izoliranim UI/server granicama: jedna potvrda automatske grupe, uključivanje projektne osobe, jedna točna grupna potvrda, incomplete bez fallbacka, overflow/blocked/saving/prazan/nedostajući stol, include bez stola, vidljivost odabira/Enter u pretrazi i Odaberi prikazane unutar preostalog kapaciteta bez dvostrukog brojanja postojećih gostiju stola. Regresije pokrivaju početni prikaz spremljene stolice, koordinate/toleranciju dropa, neutralan status promašaja te stvarni drag hook s izoliranim React raspoređivanjem i Node EventTargetom. Šest workspace provjera pokriva shared navigaciju, skupljanje/otvaranje panela, očuvanje postavki kroz responsive/panel promjene, potvrđene dimenzije, jednu potvrdu spremanja i postojeću potvrdu brisanja. To nije browser/touch test.

Ranije je izolirani PGlite 0.5.8 izvršio 62 SQL provjere 007/008: stvarni preflight/upgrade/verify, očuvanje podataka pri instalaciji, rollback greške drugog INSERT-a, prava, archive/cross-project/duplicate/range/occupied/stale/full odbijanja i grupe od 100 konkretnih stolica s jednom revizijom. Runner: node src/features/seating/tests/batchSeatingSql.cjs <putanja-do-PGlite-modula>. PGlite nije projektna ovisnost; privremeni runtime uklonjen je. Jedna veza ne potvrđuje native istodobne transakcije. SQL ovom frontend doradom nije mijenjan niti ponovno izvršavan.

Ručni QA nakon instalacije: označi tri gosta, jednom potvrdi, refresh i provjeri tri mjesta/imena; ponovi s projektnom osobom i premještanjem s drugog stola. Odaberi točne stolice na istom ekranu i provjeri spremljene brojeve; pokušaj nepotpun/range/occupied izbor ili pun stol. Provjeri stvaranje osobe i povratak, pretragu/Prikaži sve/Očisti odabir, orijentaciju s draftom i stale reviziju iz drugog taba. Na 320/390/767 px i desktopu provjeri dostupnost footera i kontrola. Stvarni browser/touch i live RPC upisi nisu izvršeni od strane agenta. Rezultati i granice: [CHECKS.md](CHECKS.md).
