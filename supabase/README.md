# Memora Database-as-Code

## Seating preset styles — primijenjeno i aktivirano na DEV-u

Korisnik je ručno primijenio `20261012223000_seating_preset_styles` i dobio
`seating_preset_styles_verified=true`. Isti DEV (`gdrwvoryapkgnfeislps`), uz
`read_only=true`, ponovno je provjeren kroz katalog i sigurnosne assertione.
Native tipovi su regenerirani; frontend je aktiviran bez privremenih legacy
kontrola ili adaptera. **Nije potreban dodatni SQL.**

Plan sprema `floor_style` i zajednički `table_theme`; podij vlastiti `style`.
Stolovi nemaju appearance stupac: postojeći i novi stolovi čitaju temu plana.
Prazan plan ostaje neutralan/generički. Revizije i `PT409` koriste postojeći RPC.

[Model i paket](install/20261012223000_seating_preset_styles/README.md).
[Dokaz read-only provjere](manifests/seating-preset-styles.dev-verified.json).
Za aktualnu bazu koristiti `verify/assert/seating_preset_styles.sql`; prethodni
appearance assert očekuje povijesni model i više ne opisuje trenutno stanje.
Migracije ne izvršavati ponovno. Clean baseline i udaljeni runtime/concurrency
testovi nisu izvršeni.

Lokalna provjera: `node supabase/manifests/check-seating-preset-styles.cjs`.

## Seating Appearance — prethodna primjena na DEV-u

Nova migracija `20261012210000_seating_appearance` dodaje opcionalni izgled
prostorije, stolova i elemenata. [Postupak i model](install/20261012210000_seating_appearance/README.md).
Korisnik je ručno primijenio migraciju i potvrdio uspješan verify te regeneraciju
DB tipova. Read-only MCP usporedba 12. listopada 2026. potvrđuje potpuno podudaranje
četiri seating tablice i 17 funkcija, uključujući RLS, grants i triggere; provjereni
su i zajednički autorizacijski helperi. Frontend release gate sada je **true**,
a Server Action koristi regenerirane native tipove. Prazan raspored ostaje generički.

DEV ima 33 aplikacijske tablice i 109 funkcija. Coverage označava samo provjerene
objekte; [dokaz](manifests/seating-appearance.dev-verified.json) i primjena s checksumom
evidentirani su lokalno. Povijesni snapshotovi i primijenjene migracije ostaju netaknuti.
Cloud concurrency i ručno vizualno/mobilno testiranje još nisu potvrđeni.
Na ovom DEV-u ne ponavljati preflight ni migraciju; aktualna read-only provjera
jest `verify/assert/seating_appearance.sql`.

Lokalna provjera: `node supabase/manifests/check-seating-appearance.cjs`.


## seating_elements ? primijenjeno i provjereno na DEV-u

Korisnik je ru?no primijenio migraciju `20261012180000_seating_elements` i
pokrenuo verify. Read-only MCP usporedba 2026-10-12 potvrdila je potpuno podudaranje
s o?ekivanim katalogom (tablica i 13 funkcija). DB tipovi regenerirani su od strane
korisnika; lokalni release gate sada je uklju?en i koristi native generated tipove.

Nakon te migracije DEV je imao 33 aplikacijske tablice, 106 funkcija i 36 politika. Coverage ozna?ava
samo stvarno uspore?ene objekte kao verified, uz strukturni opseg. Primjena i SHA-256
zabilje?eni su u applications.json; udaljena Supabase migracijska povijest nije mijenjana.
[Dokaz provjere](manifests/seating-elements.dev-verified.json) ne zna?i da su
Cloud concurrency i ru?na mobilna provjera provedeni.

[Install uputa](install/20261012180000_seating_elements/README.md) ostaje povijesni
postupak iste migracije: na ovom DEV-u ne ponavljati preflight/APPLY, koristiti verify.
TEST nije mijenjan; ovo nije baseline za prazan projekt. Cjelovita rekonstrukcija
ostaje odgo?ena prema dogovoru.

Lokalne provjere:

```text
node supabase/manifests/check-seating-elements.cjs
node supabase/manifests/check.cjs
```

Primijenjenu migraciju ne ure?ivati. Svaka budu?a promjena ima novu migraciju,
a?uriranu kanonsku definiciju, verify i coverage.

## Opseg i sigurnost

DEV `gdrwvoryapkgnfeislps` ostaje postojeće razvojno okruženje. TEST
`cwhuknuhvzahxfoljohk` je zaseban Supabase Cloud projekt. MCP pregledava samo
DEV read-only; TEST nije pregledan i nema pretpostavljenog pristupa.
SQL mutacije izvršava isključivo korisnik, ručno u Dashboard SQL Editoru nakon
pregleda. Nema Dockera, instalacija, CLI relinka, promjene migracijske povijesti,
CI/CD-a ili automatskog izvršavanja SQL-a.

Ovaj pilot pokriva profiles/projects, četiri zajednička helpera i tri project
RPC-a. Ostalih 30 tablica ima samo inventar i direktorije, bez izmišljenog SQL-a.
Postojeći docs SQL paketi ostaju netaknuta povijest/prijelazna dokumentacija.
Za pokrivene objekte ovdje je jedna kanonska definicija; stare datoteke ne
koristiti kao izvor nove promjene. Nepokrivene domene još zahtijevaju DEV pregled.

SQL i manifesti mogu u GitHub samo u PRIVATE repozitorij; prije svakog budućeg
pusha provjeriti vidljivost. Nikad ne verzionirati korisnike, poslovne podatke,
ključeve, lozinke, Vault vrijednosti ili environment secret datoteke.

## Odgovornosti direktorija

- `schemas/`: aktualne očekivane deklaracije. Nisu migracije za postojeći DEV.
  Jedna definicija objekta, grupirana po domeni/tablici; shared helperi samo u
  `global_functions/`. Function datoteke uključuju vlasnika i EXECUTE ACL.
- `migrations/`: buduće pregledane, nepromjenjive promjene, npr.
  `20261012120000_add_project_description.sql`. Primjeri nisu generirani.
- `verify/inspect/`: prikaz metapodataka bez osobnih redaka ili RPC poziva.
- `verify/assert/`: usporedba očekivanog i stvarnog stanja; PASS ili exception.
- `tests/`: budući TEST-only autorizacijski, izolacijski, concurrency i negativni
  testovi. RPC mutacija uz ROLLBACK i dalje nije read-only.
- `manifests/`: inventar, pokrivenost, redoslijed, checksumovi i evidencija primjene.

PK/UNIQUE indeksi definiraju se samo kroz constraints u `table.sql`.
`indexes.sql` sadrži samo dodatne indekse: zato profiles nema tu datoteku.
Auth trigger pripada `identity/profiles/triggers.sql`; auth.users je platformska
tablica koju ne stvaramo. Storage trigger projekta ostaje u projects/triggers.sql,
ali njegov helper će imati jednu definiciju u Storage domeni.

## Status ovog pilota

Read-only DEV katalog: 2026-10-12, PostgreSQL 17.6. Šest metadata usporedbi
prošlo: tablice, funkcije, indeksi, politike, triggeri i schema permissions.
`verified` znači strukturnu usporedbu s DEV-om, NE izvršenu rekonstrukciju,
runtime autorizaciju, odsutnost svih ranjivosti ili uspješan konkurentni test.

| Vrsta | Verified / ukupno |
|---|---:|
| Tablice | 2 / 32 |
| Funkcije | 7 / 103 |
| Triggeri | 4 / 31 |
| Politike | 3 / 35 |
| Indeksi | 4 / 91 |
| Constraints | 13 / 191 |

Ukupni brojevi uključuju aplikacijski Auth trigger, ne Supabase managed triggere.
Brojevi su izvedeni iz coverage.json, nisu budući cilj koji treba ručno nagađati.

## Nepokrivene ovisnosti — ne preskakati

1. `private.is_project_member` je SQL helper i zahtijeva project_collaborators.
   Njegova kanonska definicija je potvrđena, ali još nije samostalno učitljiva.
2. `create_project` automatski stvara photo_walls i koristi
   extensions.gen_random_bytes. Ne uklanjati taj dio radi uspjeha pilota.
3. projects AFTER DELETE trigger zahtijeva private.storage_project_deleted i
   Storage lifecycle. Delete/cascade ponašanje nije rekonstruirano bez njih.
4. projects SELECT politika ovisi o is_project_member i time collaborators.
5. Foundation pretpostavlja Supabase managed public/auth sheme, auth.users,
   auth.uid i platformne uloge. Actual private schema nema klijentski USAGE/CREATE.

Zato NE postoji izvršiva profiles+projects baseline migracija. `migrations/`
je namjerno prazan. U schemas nema privremenih stub tablica ili helpera.
`load-order.json` je privremen, ima blockere i `executable=false`.

## Baseline nasuprot razvojnoj migraciji

Baseline će graditi aplikacijske objekte na novom čistom TEST/beta projektu,
iz već pripremljenih kanonskih datoteka. Ne primjenjuje se na DEV koji ih ima.
Kasniji generator može sastaviti pregledani paket prema load-order manifestu;
ne treba ponovno ručno prepisivati SQL. Generirani povijesni paket nije druga
kanonska definicija i nakon primjene se ne uređuje.

Razvojna migracija radi minimalnu promjenu već postojećeg objekta. Budući proces:

1. Read-only pregled DEV-a i ovisnosti; ako nije pokriven, prvo capture sadašnjeg stanja.
2. Pripremiti migraciju, ažurirane deklaracije i minimalni read-only assert.
3. Lokalno provjeriti manifest, definicije i checksumove. Nova očekivana definicija
   dobiva `prepared`, a DEV usporedba ostaje pending/drift dok primjena nije potvrđena.
4. Korisnik potvrđuje Dashboard project ref i izvršava cijeli odobreni paket.
   Testiranje ide na TEST; zasebno odobrena razvojna primjena na DEV.
5. Uspješan verify → evidentirati primjenu i tek tada `dev_comparison_status=verified`.
6. Na grešku: zasebni ROLLBACK, inspect stanja, ne prelaziti na sljedeću migraciju.
   Primijenjenu datoteku ne prepisivati; korekciju izdati novim ID-em.

Svaka mutirajuća jedinica mora biti transakcijska gdje je moguće, provjeriti
preduvjete i eksplicitno REVOKE/GRANT prije COMMIT-a. PostgreSQL public default
privileges su široki. Ne izvršavati pojedinačne deklaracije u odvojenim
autocommit pozivima. DDL bez transakcijske podrške zahtijeva zaseban plan.
`service_role` BYPASSRLS i table/function ACL su zasebne provjere.

## Provjere spremne za pregled

`verify/inspect/profiles_projects.sql` prikazuje svih šest kategorija metapodataka.
`verify/assert/profiles_projects.sql` provjerava:
stupce/redoslijed/tip/default/NOT NULL, constraints i njihove postavke,
indekse/validnost, vlasništvo, RLS/FORCE, sve politike, table/column ACL,
funkcijske signature/default argumente/tijela/SD/search_path/EXECUTE/cost i triggere,
uključujući aplikacijski trigger na auth.users te schema privileges.
Ne poziva aplikacijske funkcije, ne zapisuje podatke i ne testira njihovu autorizaciju.
Neočekivani dodatni objekt UNUTAR ovih kategorija na dvije tablice izaziva FAIL;
ovo nije sveobuhvatni inventarni assert cijele baze.

Očekivani metapodaci u JSON-u i assertu su izvedeni iz istog pregledanog capturea,
ne dodatni izvor DDL-a. Pri promjeni regenerirati oboje zajedno, usporediti diff
i tek nakon stvarnog verifyja zabilježiti potvrdu. Inspect nije PASS/FAIL.

Na nepotpunom TEST-u ovaj assert očekivano pada jer traži cijelo potvrđeno
DEV stanje ovog slicea. To nije uputa za automatsko stvaranje nedostajućih objekata.
Jednakost MD5 tijela nije dokaz poslovne sigurnosti; koristi se kao drift kontrola.

Lokalna provjera bez mreže, SQL-a ili dodatnih instalacija:

```text
node supabase/manifests/check.cjs
```

## Manifesti i evidencija primjene

`coverage.json` sadrži svih 32 tablice, 103 funkcije, 31 trigger, 35 politika,
91 indeks i 191 constraint. Planirana putanja smije ne postojati za not_started.
`preparation_status` i `dev_comparison_status` su zasebni. Ovisnosti iz source
pretrage su konzervativne; PL/pgSQL/dinamički SQL zahtijeva dodatni pregled.
`dev-inventory.json` je metadata capture bez funkcijskih tijela/osobnih redaka;
`profiles-projects.expected.json` je fokusirani očekivani snapshot.

Uz svaku promjenu održavati zajedno: canonical SQL, verify, snapshot, coverage,
load order/blockere i files.sha256.json. Check skripta ne kontaktira baze i
NIKADA sama ne postavlja verified. Za svjesno pregledanu novu lokalnu verziju:

```text
node supabase/manifests/check.cjs --record-checksums
```

Ova naredba zapisuje samo lokalni checksum manifest; ne potvrđuje DEV primjenu.
SQL datoteke koriste LF preko lokalnog .gitattributes radi stabilnih SHA-256.

`applications.json` je zasad prazan. Budući zapis: migration_id, kind,
project_ref, file, SHA-256 točnih datoteka, applied_at, verified_at, verify_files,
PASS/FAIL i putanja sanitiziranog dokaza. Zapis stvarati samo uz korisnikovu
potvrdu; ne rekonstruirati izmišljenu Supabase povijest. SQL Editor ne dodaje
automatski CLI migration history. Kasniji CI i history onboarding su zasebna odluka.

Nema pouzdanog project-ref SQL guarda u ovom paketu. Dashboard URL/reference
potvrđuje korisnik; budući environment marker zahtijeva zasebno odobrenje.

## Otvorene odluke i najmanji sljedeći korak

Zadržane su stvarne privilegije DEV-a, uključujući service_role ALL na profiles
i projects te UPDATE samo first_name/last_name za authenticated na profiles.
MAINTAIN zahtijeva PostgreSQL 17+; target verziju prvo provjeriti.
Auth handler zahtijeva email i upisuje metadata imena; phone-only registracija
i nevaljana metadata imena mogu pasti na postojećim constraints. To nije promijenjeno.
RLS člansko čitanje i owner-only update/delete RPC ponašanje nisu sinonimi.

Storage cron, Vault provisioning, bucketovi i endpointi ostaju dokumentirani
preduvjeti: ništa ne aktivirati na TEST-u. Raniji inventar nema bucketove i
ima aktivni DEV cleanup cron; novi projekt ne smije naslijediti DEV odredište.

Trenutačni prioritet je završetak aplikacije na DEV-u. Profiles-only TEST pilot,
izvršivi baseline i rekonstrukcija odgođeni su do zasebnog korisnikova zahtjeva.
Tijekom razvoja svaku promjenu baze pratiti verzioniranom migracijom, ažuriranom
kanonskom definicijom, minimalnim read-only verifyjem i evidencijom pokrivenosti.
Nepokriveni objekt prvo potvrditi prema aktualnom DEV katalogu. SQL za ručnu
primjenu organizirati u `install/` paketu povezanom s migracijom i verifyjem;
ne uvoditi drugu neovisno održavanu definiciju istog objekta.

## Završna faza nakon pokrivanja svih domena, prije bete

Ovo je plan za zaseban završni zadatak, a ne odobrenje za njegovo pokretanje.
Kada dokumentiramo sve aplikacijske tablice, funkcije i pripadajuće objekte:

1. Ponovno read-only inventarizirati DEV i usporediti ga s kanonskim definicijama.
   Inventar može narasti tijekom razvoja: koristiti tada aktualni broj objekata,
   ne zamrznuti cilj na početnih 32 tablice i 103 funkcije. Razriješiti drift,
   nepokrivene objekte, otvorene probleme i sve blokere redoslijeda.
2. Potvrditi potpunu mapu ovisnosti i redoslijed rekonstrukcije: platformni
   preduvjeti, sheme, tablice/ključevi, funkcije, politike, triggeri i prava.
   Supabaseove upravljane objekte odvojiti od naših prilagodbi.
3. Sastaviti cjelovitu verzioniranu baseline sekvencu iz postojećih `schemas/`
   datoteka, bez ponovnog ručnog prepisivanja i bez primjene na postojeći DEV.
   Paket mora imati preflight, transakcijske granice, eksplicitne ACL-ove prije
   COMMIT-a, checksumove, upute za primjenu i postupanje nakon greške.
4. Pripremiti sveobuhvatni read-only PASS/FAIL verify: stupci, tipovi, defaulti,
   constraints, indeksi, funkcijska tijela/signature, triggeri, vlasništvo, RLS,
   table/column grantovi i default privileges. Usporediti očekivani i stvarni
   inventar radi otkrivanja nedostajućih i nepotrebnih aplikacijskih objekata.
5. Napraviti zaseban sigurnosni audit i TEST testove: autorizacija SECURITY
   DEFINER funkcija, EXECUTE prava, RLS politike, izolacija korisnika/projekata,
   javni tokeni i pristup pozivnicama, albumima, Photo Wallu i uploadima.
   Namjernu odsutnost politika razlikovati od nedostatka; strukturni PASS nije
   dokaz autorizacije ili ispravnog ponašanja kod istodobnih zahtjeva.
6. Nakon zasebnog odobrenja korisnik ručno rekonstruira čisto TEST okruženje i
   izvršava verify te autorizacijske, negativne, integracijske i concurrency
   testove. Ne kopirati korisnike, profile ni poslovne/testne podatke iz DEV-a.
7. Provjeriti Auth integraciju i zasebnu konfiguraciju Storagea: bucketove,
   Vault provisioning, endpointe, cleanup i cron. Tajne nisu dio repozitorija;
   TEST ne smije koristiti DEV odredišta. Aktivacija je zasebno kontrolirana.
8. Evidentirati primijenjene datoteke/checksumove, rezultate i preostale rizike.
   Završna faza nije dovršena dok rekonstrukcija, verify i potrebni sigurnosni
   testovi nisu potvrđeni; sama potpuna dokumentacija nije dovoljna.
9. Dokumentirati postupak postavljanja nove beta/produkcijske baze iz istih
   provjerenih datoteka i potrebne konfiguracije, s odobrenim kataloškim početnim
   podacima, environment provjerama i završnim verifyjem. Kreiranje projekta,
   SQL primjena i deployment ostaju pod izričitom korisnikovom kontrolom.

Do tog završnog zadatka ne pokretati rekonstrukciju, aktivaciju servisa ili
automatsku primjenu SQL-a. Nema samostalnog commita/pusha ni promjene konfiguracije.
