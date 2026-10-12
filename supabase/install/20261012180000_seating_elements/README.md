# Seating elements — ručna primjena

Status: **pripremljeno, nije primijenjeno**. Frontend release gate je isključen.
Ovo je instalacijska uputa za **istu** verzioniranu migraciju, nije druga
migracija ni dodatni APPLY. Namjerno nema kopije `APPLY.sql` koja bi mogla zastarjeti.

## Cilj i preduvjeti

Migracija je za postojeći, pregledani DEV model `gdrwvoryapkgnfeislps`.
Nije baseline za prazan TEST `cwhuknuhvzahxfoljohk`: TEST prvo mora imati sve
ovisnosti i odgovarajuću provjerenu strukturu. Ne prenositi korisnike ni podatke.
Ne koristiti ovu promjenu za cjelovitu rekonstrukciju.

Identitet projekta provjeriti u Dashboardu (naziv i project reference).
`current_database()`, korisnik `postgres` i lokalni CLI link nisu dokaz identiteta
Supabase projekta. Ne postoji univerzalni pouzdan project-ref guard u SQL Editoru;
nemoj uklanjati provjere definicija ako preflight odbije pogrešan/stari model.

## Točan redoslijed

1. Pregledati migraciju i ovu uputu. Zatvoriti seating editore i zaustaviti seating
   zahtjeve; pripremljeni frontend ima `SEATING_ELEMENTS_RELEASE_ENABLED=false`.
2. U DEV SQL Editoru kao `postgres` izvršiti cijeli
   [preflight](../../verify/assert/seating_elements_preflight.sql).
   Očekivano: `seating_elements_preflight_passed=true`.
3. Jednom izvršiti cijelu
   [migraciju](../../migrations/20261012180000_seating_elements.sql).
   To je **jedini APPLY**, bez drugog instalacijskog SQL-a nakon nje.
4. Izvršiti cijeli [verify](../../verify/assert/seating_elements.sql).
   Očekivano: `seating_elements_verified=true`, `revision_conflict_sqlstate=PT409`.
   Ako ne prođe, pokrenuti [inspect](../../verify/inspect/seating_elements.sql)
   i usporediti s `manifests/seating-elements.expected.json`; ne uklanjati assert.
5. Poslati rezultat korisnikove primjene i provjere. Tek nakon potvrde Codex
   pregledava rezultat read-only, evidentira primjenu/checksum i uključuje lokalni
   release gate. Sama prisutnost tablice nikad automatski ne aktivira feature.
6. Regenerirati DB tipove postojećom read-only procedurom. Privremeni tipovni
   adapter `elements/database.ts` omogućuje pripremu prije instalacije.
7. Nakon aktivacije provjeriti desktop i mobitel: dodavanje, odabir, pomicanje,
   rotaciju, dimenzije, zaključavanje/otključavanje, redoslijed, brisanje,
   ponovno učitavanje te smanjivanje prostorije. Predlošci v1 moraju nastaviti
   raditi; novi v2 predložak provjeriti bez gostiju/RSVP podataka.

Na SQL pogrešku izvršiti zasebni `ROLLBACK;`. Transakcija nema djelomični commit.
Na lock timeout ne povećavati čekanje naslijepo: zatvoriti editore i pregledati
aktivne zahtjeve. Nakon uspjeha migraciju ne ponavljati; koristiti verify.
Ne raditi automatski downgrade/drop tablice ako aplikacija ne radi: ostaviti
release gate isključen, pregledati uzrok i pripremiti zasebni popravak.

## Model i granice

Centar objekta je `x_cm/y_cm`, širina/dubina u cm i rotacija 0–359°.
Ukupni footprint uključuje zvučnike DJ-a i stepenice pozornice. Ne rade se kolizije
između objekata, dodjela gostiju ni redovi stolica.

| Vrsta | Početno | Min | Max |
|---|---|---|---|
| dance_floor | 400 × 400 | 200 × 200 | 2000 × 2000 |
| stage | 400 × 240 | 200 × 120 | 2000 × 1200 |
| dj_booth | 200 × 100 | 120 × 60 | 500 × 300 |

Početne dimenzije smanjuju se samo do minimuma vrste, da stanu u manju prostoriju;
ako minimum ne stane, dodavanje se odbija. Maksimalno 200 elemenata po planu.

RLS: član projekta može SELECT; nema izravnog pisanja za `PUBLIC`, `anon`,
`authenticated` ili `service_role`. Novi RPC je postgres-owned SECURITY DEFINER
s praznim search_path i authenticated-only EXECUTE. Helperi su postgres-only.
Široki default privileges izričito se uklanjaju prije COMMIT-a.

RPC koristi postojeći `private.lock_seating_plan` (projektni i plan lock,
autorizacija, PT409). Svaka potvrđena mutacija povećava istu reviziju jednom.
Identitet projekta/plana izvodi se iz zaključanog plana, ne iz klijentova JSON-a.
Trigger odbija promjenu identiteta i geometrije zaključanog elementa; otključavanje
i pomicanje trebaju dva koraka. Brisanje zahtijeva postojeći UI confirmation.
Trigger plana provjerava elemente pri promjeni dimenzija za sve putove UPDATE-a.

Konva redoslijed: prostorija → podiji → stolovi/stolice → pozornice/DJ.
Fiksne render skupine koriste `z_index` samo unutar skupine; ID određuje stabilan
redoslijed za jednak z_index. Detalji koriste postojeće vizuale i zoom pragove.
Mobilni tap otvara postojeći drawer; drag početak samo odabire, bez otvaranja.

Predložak v1: postojeća stroga struktura, bez `elements`. V2: ista polja + obvezno
polje `elements` (može prazno), geometrija, kind, name, z_index i locked. Bez ID-a,
projekta, gostiju ili RSVP-a. Validator i RPC za stvaranje plana podržavaju oba.
Nema backfilla ni promjene postojećih predložaka, tablica ili dodjela gostiju.

## Lokalna provjera i ograničenja

`check-seating-elements.cjs` uspoređuje kanonske izvore, migraciju, preflight,
expected/verify i isključen release. `check.cjs` provjerava coverage i checksumove.
Expected katalog dobiven je izvođenjem kanonskog SQL-a u izoliranom, već dostupnom
PGlite-u; nije označen kao primijenjeno DEV stanje. NOT NULL se uspoređuje kroz
stupce zbog različitog katalog prikaza u PostgreSQL-u 17/18.

Lokalni SQL testovi koriste isključivo in-memory bazu i sintetičke fixture
ovisnosti. Ne dokazuju Cloud HTTP ponašanje ni pravu konkurentnost dviju veza.
Post-install cloud concurrency provjera planirana je zasebno na TEST-u.
Snapshotovi i manifeste ne označavati kao DEV verified prije potvrđenog verifyja.
