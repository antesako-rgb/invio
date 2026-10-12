# Seating preset styles — prijedlog za pregled

**Primijenjeno i aktivirano na DEV-u 12. listopada 2026.**
Korisnik je ručno izvršio migraciju i verify te regenerirao native tipove.
Read-only MCP na istom projektu, uz sačuvan `read_only=true`, potvrdio je
sve četiri tablice, 17 funkcija i zajedničke autorizacijske helpere.
[Dokaz](../../manifests/seating-preset-styles.dev-verified.json).
`SEATING_PRESET_STYLES_RELEASE_ENABLED=true`. Uklonjeni su privremena grana
starog modela, granularni panel, stari table renderer i prilagođeni prijelazni
SeatingTable tip. Nema dodatnog SQL-a ni potrebe za ponavljanjem migracije.

## Potvrđeno stanje i sigurnost

DEV `gdrwvoryapkgnfeislps`, read-only MCP pregled 12. listopada 2026.:
aktualne četiri seating tablice i 17 funkcija potpuno se podudaraju s provjerenim
Seating Appearance snapshotom. Prije korisničkog brisanja postojale su četiri
različite table appearance kombinacije; zatim je korisnik obrisao projekt.
Naknadno je potvrđeno **0 planova, 0 stolova, 0 elemenata, 0 predložaka**.
[Dokaz pregleda](../../manifests/seating-preset-styles.dev-review.json).

Migracija zato zahtijeva da sve četiri tablice ostanu prazne. Ako se pojavi
novi zapis, preflight i APPLY staju. Nema automatskog brisanja ni konverzije
podataka. Ne izvoditi stare podatke ili novi SQL iz povijesnih `docs/` datoteka.
TEST nije pregledan ni mijenjan; ovo je razvojna promjena na postojećem DEV-u,
a ne baseline za prazni projekt.

## Najmanji čist model

| Gdje | JSON nakon normalizacije | Što korisnik bira |
|---|---|---|
| `seating_plans.appearance` | `{"floor_style":"neutral","table_theme":"generic"}` | Jedan stil prostorije i jedan stil svih stolova |
| Dance Floor `seating_elements.appearance` | `{"style":"classic_parquet"}` | Jedan stil tog podija |
| Stage / DJ Booth | `{}` | Postojeći prikaz |
| `seating_tables` | Nema `appearance` stupca | Geometrija i kapacitet, bez pojedinačnog stila |

Postojeći JSON stupci planova i elemenata ostaju `NOT NULL DEFAULT '{}'`.
Prazan JSON znači Neutral/Generic za prostoriju/stolove i Classic Parquet za
podij. Nove tablice ili stupci za teme nisu potrebni.

Zajedničke teme stolova: `generic`, `classic_ivory`, `rustic_green`,
`modern_white`, `elegant_gold`. Generic čuva jednostavan tlocrt kao opciju.
Postojećih šest `floor_style` i šest Dance Floor `style` identifikatora ostaju.
Njihove boje, teksture, obrubi i sjene pripadaju frontend preset definicijama;
korisnik više ne šalje proizvoljne boje ili zasebne dekoracije.

SQL strogo odbija `floor_color`, `cloth`, `texture`, `decoration`, `border_color`,
`shadow`, podatke o gostima i nepoznate ključeve. Na DEV-u nema zapisa koje bi
te promjene trebale pretvarati. Bez nove verzije seating templates formata:
ostaje jedan aktualni `document_version = 2`, sada bez appearance u stavkama stolova.

## Jedna tema za postojeće i buduće stolove

`public.set_seating_appearance` zadržava isti potpis. Novi `p_target='table_theme'`
prihvaća `p_object_id=NULL`, `p_all=false` i `{"table_theme":"elegant_gold"}`.
Upisuje jednu vrijednost na planu i povećava reviziju jednom; ne radi UPDATE
stolova niti petlju zahtjeva. Stari cilj `table` i `p_all=true` više nisu podržani.
`room` spaja provjerene postavke s aktualnim planom kako promjena poda ne bi
resetirala temu stolova. `element` mijenja stil samo odabranog podija.

Renderer svakog stola dobiva temu iz `current.plan.appearance.table_theme`.
Novi ili duplicirani stol pripada istom planu, pa odmah koristi isti preset.
Za nasljeđivanje nema kopiranja vrijednosti u retke stolova, dodatnog RPC-a
niti triggera. Postojeći create/duplicate-table RPC ne treba promjenu.

Autorizacija, `private.lock_seating_plan`, `PT409`, RLS, grants, identiteti,
geometrija, položaji stolica, gosti, RSVP i dodjele ostaju isti. Izgled zaključanog
podija može se mijenjati, dok njegovo pomicanje ostaje zabranjeno.

## Što SQL mijenja

1. `private.normalize_seating_appearance`: stroge preset allowliste.
2. `public.set_seating_appearance`: zajednički stil na planu; jedan plan write/revizija.
3. `private.validate_seating_template`: stolovi u dokumentu više nemaju appearance.
4. `public.create_seating_plan_from_template`: kopira zajednički stil u plan, ne u stolove.
5. Uklanja samo `seating_tables_appearance_check` i prazan `seating_tables.appearance`.

Provjerene katalog ovisnosti uklonjenog stupca jesu njegov default i CHECK;
PL/pgSQL izvor koristi ga samo u dva javna RPC-a iznad. Guard odbija nove ovisnosti.
PostgreSQL 18 dodatno evidentira vlastiti NOT NULL constraint; dopušten je samo
tako vezan zapis za taj stupac. DROP koristi **RESTRICT**, nikada CASCADE.

Transakcija obuhvaća sve promjene, provjeru izvora/vlasništva/search_path/ACL,
ACCESS EXCLUSIVE lock nad četiri tablice, `lock_timeout=5s`,
`statement_timeout=30s`, eksplicitni REVOKE/GRANT i postflight prije COMMIT-a.

## Plan frontenda nakon odobrenja

Tri izbora u postojećim panelima:

- **Izgled stolova** u kartici Stolovi, zajednički za plan, dostupan i bez odabranog stola.
- **Izgled prostorije** u postojećim postavkama prostorije.
- **Izgled podija** u postojećem panelu odabranog Dance Floora.

Nestaju individualne kontrole stolnjaka/teksture/dekoracije, zasebne boje poda
i obruba, shadow toggle i gumb „Primijeni na sve stolove”.

| Tema stolova | Planirana stvarna 2D obrada |
|---|---|
| Generic | Postojeći jednostavan prikaz, bez tkanine/dekoracije |
| Classic Ivory | Bjelokost, suptilni nabori lana, tanak rub i mali bijeli cvjetni detalj; tapecirana sjedala i mekani detalji naslona |
| Rustic Green | Kadulja i prirodno drvo, vidljiva tekstura tkanine/drveni obrub, sitne grančice; drvene stolice sa zelenim sjedalom |
| Modern White | Čista bijela površina, diskretni šavovi i neutralan detalj; bijela sjedala i precizni grafitni detalji |
| Elegant Gold | Šampanj površina, suptilni satenski ton i dvostruki zlatni obrub, mali svijetli aranžman/svijeće; krem sjedala i zlatni detalji |

Preset rendereri i kartice izrađeni su lokalno i aktivirani nakon potvrđene SQL primjene.
Preset mijenja surface/chair skin preko postojeće geometrije. Ponovno koristimo
`chairPositions`, `getChairSize`, oznake stolica i popunjenosti; ne crtamo novi
raspored stolica. Occupied/selection stanje zadržava jasno čitljivu oznaku.

Drvo dobiva stvarne pomaknute spojeve dasaka i diskretne godove; mramor nekoliko
nenametljivih vena; pločice odmjeren raster i fugiranje. Podij dobiva uvjerljive
parquet/herringbone uzorke i integrirani obrub/sjenu iz preseta. Ponavljajuće
proceduralne pločice imaju fiksne dimenzije u cm i ograničen cache, bez stotina
Konva objekata. Dekoracije ostaju izvan uspravne oznake stola i unutar njegove
geometrije pri svim rotacijama, a pri malom zoomu skrivaju sitne detalje.

Kartice stolova koriste minijaturni stol **sa stolicama**, kroz iste skin renderere
kao editor. Kartice prostorije/podija koriste stvarne material renderere, umjesto
zasebnih jednobojnih CSS swatcheva. Preview nema pointer interakcije. Ostaju
postojeći desktop/mobilni paneli, Stage/Layer/Group redoslijed i zaštita da podij
ne prekriva stolove. Nema Three.js, WebGL scene ili novih biblioteka.

## Paket i redoslijed ručne primjene

- [Preflight](../../verify/assert/seating_preset_styles_preflight.sql).
- [Jedina migracija](../../migrations/20261012223000_seating_preset_styles.sql).
- [Read-only PASS/FAIL verify](../../verify/assert/seating_preset_styles.sql).
- [Read-only inspect](../../verify/inspect/seating_preset_styles.sql).
- [Manifest promjene](../../manifests/seating-preset-styles.change.json).

Install je samo poveznica na istu migraciju; nema drugog APPLY.sql.
Sljedeći redoslijed je već dovršen na DEV-u. Ne ponavljati migraciju.
Koraci ostaju zapisani kao evidencija ručne primjene:

1. Zatvoriti editore, potvrditi DEV reference i pokrenuti preflight kao `postgres`.
2. Korisnik jednom izvršava cijelu migraciju.
3. Korisnik izvršava novi verify; rezultat mora biti `seating_preset_styles_verified=true`.
4. Regenerirati native DB tipove — `seating_tables.appearance` mora nestati iz tipova.
5. Read-only potvrditi stvarni DEV, ažurirati evidenciju i aktivirati novi frontend.
6. Ručno provjeriti kartice, oba oblika stolova, zoom/pan, zaključavanje, spremanje
   i dva konkurentna zahtjeva.

Kanonske definicije pet promijenjenih objekata sada su **potvrđeno DEV stanje**.
Pokrivenost je ažurirana, a uklonjeni constraint arhiviran uz dokaz odsutnosti.
Sve primijenjene migracije i prethodni snapshotovi ostaju nepromijenjeni.

## Provjere i ograničenja

38 izoliranih PGlite PostgreSQL 18.3 provjera prolazi: rollback/replay, odbijanje
postojećih podataka i nepoznate view ovisnosti, točan schema/security verify,
strogi JSON, autorizacija, stale PT409, jedna revizija, nepromijenjena geometrija,
novi stol u istom planu, zaključani podij i primjena predloška bez table appearance.
To nije stvarni Supabase Auth/HTTP/concurrency test. Novi frontend pokriven je
lokalnim testovima: strogi JSON, jedan RPC/revizija, room patch bez resetiranja
teme stolova, PT409 bez retryja, predlošci bez table appearance, geometrija i
eventi stolica, granice dekoracija pri rotaciji te ograničen cache uzoraka.
Kartice i oba oblika stolova provjereni su u lokalnom Chromeu na desktop i
mobilnoj širini, bez mrežnog pristupa bazi. To nije end-to-end provjera
autentificiranog editora. Nakon aktivacije ostaje ručna provjera spremanja,
reload-a, stvarnih mobilnih gesti i konkurentnih zahtjeva.

Stare granularne kontrole i privremene deployment grane su uklonjene. Editor
prihvaća samo aktualni model. Povijesne SQL migracije, snapshotovi i dokazi
prethodnih provjera ostaju sačuvani. Za sadašnje stanje koristiti isključivo novi
preset-style verify; prethodni appearance assert opisuje staru shemu.
