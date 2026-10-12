# Seating Appearance — primijenjeno i provjereno na DEV-u

Korisnik je 12. listopada 2026. potvrdio uspješnu primjenu, verify i regeneraciju
DB tipova. Naknadna read-only MCP usporedba potvrđuje četiri tablice, 17 funkcija
i autorizacijske helpere. Frontend je uključen i koristi native tipove.
[Dokaz](../../manifests/seating-appearance.dev-verified.json) i
[evidencija primjene](../../manifests/applications.json) odnose se na strukturu.
Na ovom DEV-u **ne ponavljati preflight ni migraciju**; koristiti aktualni verify.
Koraci primjene u nastavku ostaju dokumentacija za pregledanu početnu strukturu.

Ovaj paket mijenja postojeći DEV `gdrwvoryapkgnfeislps`. Nije baseline za prazan
TEST `cwhuknuhvzahxfoljohk`. SQL izvršava samo korisnik, ručno kao `postgres`.
Install upućuje na **istu migraciju**, bez drugog APPLY paketa.

## Potvrđeno početno stanje

Read-only DEV pregled 12. listopada 2026.: četiri relevantne tablice, 14 funkcija,
nula predložaka, jedan plan, četiri stola i jedan element. Izvor su stvarni
katalozi DEV-a, ne povijesne `docs/` definicije. Snapshot je u
`supabase/manifests/seating-appearance.baseline.json`; dodatni izvoz definicija
u `seating-appearance.dev-capture.json`. Nema korisničkih redaka u tim datotekama.

Postojeći planovi, stolovi, elementi i dodjele ostaju sačuvani. Preflight odbija
primjenu ako se pojavi predložak, postoje appearance stupci ili se razlikuje
pregledana struktura, izvor funkcija ili sigurnost. Guardove ne uklanjati.

## Konačni model

Tri postojeće tablice dobivaju `appearance jsonb NOT NULL DEFAULT '{}'`:

| Objekt | Dopuštene postavke | Zadano nakon normalizacije |
|---|---|---|
| `seating_plans` | `floor_style`, `floor_color` | `neutral`, `null` |
| `seating_tables` | `cloth`, `texture`, `decoration` | `none`, `plain`, `none` |
| Dance Floor | `style`, `border_color`, `shadow` | `classic_parquet`, `null`, `false` |
| Stage / DJ Booth | zasad prazan objekt | `{}` |

Stilovi i boje imaju stroge allowliste; dodatni ključevi, identiteti gostiju,
RSVP, dodjele i geometrija nisu dopušteni. Boja je `null` ili `#RRGGBB`.
SQL normalizacija i frontend Zod normalizacija proširuju isti prazni default.
Neutral pod ne dodaje renderer preko postojeće podloge. Stol bez stolnjaka i
dekoracije zadržava postojeći izgled. Teme će kasnije biti preset objekti nad
ovim vrijednostima, bez posebne tablice; buduća proširenja zida pripadaju planu.

`public.set_seating_appearance` koristi postojeći `private.lock_seating_plan`,
autorizaciju i `PT409`. Izgled svih stolova mijenja jednim UPDATE-om i jednom
revizijom u jednoj transakciji. Ne mijenja kapacitete, položaje ni dodjele.
Izgled zaključanog elementa može se uređivati; zaključavanje i dalje štiti
geometriju. Postojeći RPC potpisi ostaju isti.

RLS i postojeći table grants sačuvani su, uključujući postojeće šire
`service_role` grantove na plans/tables/templates. Nova javna RPC funkcija ima
EXECUTE samo za authenticated i vlasnika. Privatni normalizer nema javni EXECUTE.
Čisti boolean validator CHECK-a jest SECURITY DEFINER s praznim search_path;
EXECUTE za service_role omogućuje postojeći izravni servisni DML bez davanja
USAGE na private shemu. Validator ne pristupa podacima ni drugim objektima.
Postflight uspoređuje cjelovit očekivani ACL, ne samo nekoliko uloga.

## Jedan aktualni format predloška

Zadržan je broj `document_version = 2`, ali postoji samo jedna aktualna struktura:

```json
{
  "width_cm": 2000,
  "height_cm": 1500,
  "appearance": {},
  "tables": [],
  "elements": []
}
```

Svaki stol i element uz postojeću konfiguraciju ima obavezni `appearance` objekt.
Nema v1 adaptera, v3 formata niti migracije podataka starih predložaka. Predlošci
koriste potvrđeni aktivni release; početni DEV inventar bio je prazan.
Ako netko u međuvremenu doda predložak, preflight zaustavlja promjenu za pregled.
Primjena predloška kopira izgled i geometriju, nikad goste ili dodjele.

## Rendering i editor

Room Floor, Dance Floor i Table Appearance imaju zasebne renderere unutar
postojećeg Stage/Layer/Group sustava. Stage i DJ Booth koriste postojeće prikaze.
Postojeći redoslijed skupina ostaje: prostorija → podiji → stolovi/stolice →
pozornice/DJ; `z_index` vrijedi samo unutar skupine. Podij ne može prekriti stolove.
Vizualne površine/dekoracije imaju `listening=false`. Selection i transform
kontrole ostaju na postojećim objektima.

Materijali koriste ponavljajuće 120×120 proceduralne canvas uzorke, cache od
najviše 64 pločice i stalan raster u cm. Broj Konva objekata ne raste s veličinom
poda. Nema slika, nove biblioteke, WebGL-a ili inline DOM stilova. Sitne dekoracije
skrivaju se pri malom zoomu; broj i popunjenost ostaju čitljivi i na tamnom stolnjaku.

Vizualne kartice smještene su u postojeće panele. Klik, ne početak povlačenja
prazne prostorije, otvara postavke. Mobilni drawer ostaje postojeći. Geometrija
elementa dostupna je na platnu i u sklopivoj sekciji; zaključavanje štiti oba puta.

## Ručni redoslijed nakon pregleda

1. Potvrdi DEV project reference u Dashboardu i zatvori seating editore.
   PostgreSQL katalog sam po sebi nije pouzdan dokaz Supabase project referencea.
2. Kao `postgres` pokreni [preflight](../../verify/assert/seating_appearance_preflight.sql).
3. Jednom izvrši **cijelu** [migraciju](../../migrations/20261012210000_seating_appearance.sql).
   Ona koristi transakciju, lock timeout 5 s, statement timeout 30 s i postflight
   prije COMMIT-a. Ako nastane greška, izvrši ROLLBACK zasebno i istraži uzrok.
4. Pokreni [read-only verify](../../verify/assert/seating_appearance.sql).
   Očekivano: `seating_appearance_verified = true`.
5. Regeneriraj DB tipove i pošalji rezultat verify-a. Ovaj korak već je potvrđen
   za DEV; privremeni RPC tip uklonjen je, `SEATING_APPEARANCE_RELEASE_ENABLED` je true.
6. Evidentiramo korisničku primjenu/checksum i read-only usporedbu s DEV-om.
   Sama SQL datoteka nije dokaz da je migracija izvršena; DEV migration history
   ne mijenjamo automatski.
7. Ručno provjeri ponovno učitavanje, desktop/mobilni prikaz, zoom i dva istodobna
   zahtjeva. Stari seating_elements verify nakon ove promjene ostaje povijesna
   provjera starog snapshot-a; aktualni appearance verify uključuje novu strukturu.

## Lokalne provjere i ograničenja

206 seating testova, TypeScript, lint i production build prolaze nakon aktivacije.
Aktivni Server Action provjeren je s izoliranim transportom: SQL NULL identitet,
normalizacija, jedan apply-all RPC, potvrđena revizija, PT409 bez retry-a i
blokiranje nesigurnog ishoda. Testovi stvarnih workspace handlera provjeravaju
ponovno učitavanje izgleda, očuvanje nespremljenih postavki i mobilno otvaranje
postojećeg panela. Dekoracije oba oblika stola ostaju unutar zakrenute geometrije
i izvan uspravne oznake stola/popunjenosti.
40 izoliranih PGlite PostgreSQL 18.3 provjera: rollback/replay guard, preflight
odbijanje postojećeg predloška, očuvanje postojećih redaka, schema/security verify,
normalizacija, autorizacija, stale revision, atomskom izmjenom oba oblika stola
očuvana geometrija, zaključani element i primjena predloška s izgledom.

PGlite koristi minimalne platformne fixture-e i potvrđene definicije zajedničkih
membership/owner helpera; ovo nije Cloud test
stvarnog Auth sustava, HTTP odgovora ili stvarne konkurentnosti. Mobilno i vizualno
ponašanje još zahtijeva ručnu provjeru. Postojeći duplicate-table RPC stvara
generički stol; izgled se može zasebno primijeniti, dok predlošci čuvaju izgled.
Kompletna rekonstrukcija TEST/beta projekta i završni audit ostaju zaseban zadatak.

Popis datoteka: [FILES.md](FILES.md).

U postojećem editoru nema korisničke akcije za objavu vlastitog predloška.
Prilagođen je postojeći export builder, čitanje kataloga i primjena predloška;
novi ownership/publishing sustav predložaka nije uveden.
