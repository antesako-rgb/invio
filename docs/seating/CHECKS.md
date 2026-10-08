# Pre-install provjera — 2026-10-08

## Originalni SQL

Početni guard imao je ispravan dollar tag, ne do $ begin. Međutim, četiri preuzete $function$ definicije stvarno su nedostajale završni semicolon; ispravljene su u definitions, 002 i bundleu. Markdown escape znakovi nisu pronađeni u originalnom paketu. Ispravljeni INSTALL_ALL_REVIEW.sql izvršen je kao točna datoteka, bez uklanjanja baseline guardova.

## Stvarno PostgreSQL izvršavanje

Runtime: PostgreSQL 17.11 on x86_64-windows, compiled by msvc-19.44.35229, 64-bit. Izolirani novi cluster u .tmp, samo 127.0.0.1:55439. Sintetički podaci, lokalno rekonstruirane postojeće tablice/FK/triggeri i originalne read-only izvezene funkcije. auth/member/owner helperi u fixtureu simuliraju owner pristup; ovo nije puna kopija Supabase platforme ili svih production triggera. Nema produkcijskih podataka ni konekcije prema tvojoj bazi. Runtime zaustavljen u finally.

- Public RSVP output unchanged: PASS
- Exact install bundle + baseline guards: PASS
- Backfill IDs/groups/primary + rotated bounds: PASS
- Two actual connections compete for last seat; stale revision + capacity retry: PASS
- Invitation source-only SET NULL + retained assignment/person + project cascade: PASS
- SQL template validacija/kopiranje 10 stolova, bez sudionika; brisanje templatea čuva plan: PASS.
- Hard delete povezane osobe odbijen: PASS.
- Istovremena dodjela: dvije stvarne psql veze, prva drži transaction lock; druga dobiva revision conflict, retry dobiva Table full; jedna assignment ostaje.

Test je otkrio i ispravio project cascade FK grešku: person FKs su sada INITIALLY DEFERRED, uz eksplicitni linked-person delete guard. Backfill prije SET NOT NULL izričito provjerava pending FK events pa vraća deferred režim.

## Application

Full TypeScript: PASS. Lokalna rotirana geometrija (90°, crossing at 45°, circle at boundary): PASS. x/y su centar u cm, rotation oko centra; SQL/TS isti AABB i epsilon.

## Nakon instalacije i čišćenje

Korisnik je izvršio install bundle i regenerirao database.types.ts. Dostavljene read-only provjere potvrđuju backfill (0 nepovezanih, 0 različitih imena), očekivane FK-ove, prava i svih sedam SELECT politika. Aplikacija sada koristi generirane tipove; nema privremenog schema ugovora.

Na zahtjev korisnika uklonjeni su portable PostgreSQL runtime i ZIP, download HTML, testni log, svih pet lokalnih clustera te jednokratni fixture.sql, assertions.sql, delete_assertions.sql, run-local.cjs i RESULTS.json. Nije pronađen postmaster.pid prije uklanjanja. Rezultati prethodnog izvršavanja sačuvani su gore. Testovi drugih featurea i trajni aplikacijski testovi nisu dirani; install, definitions i read-only verify SQL ostaju.

## Granice

Ovo potvrđuje navedene scenarije na PostgreSQL-u, ne sve moguće Supabase membership/RSVP/delete_project interakcije. Browser editor i admin template editor još nisu implementirani. Ulaz/podij/pozornica dokumentirani su kao zaseban space-elements model; ne mogu se spremiti u trenutni version 1 template. Vidi GEOMETRY_AND_SPACE.md.

Završni ciljani seating ESLint nakon geometrijske dorade: PASS.

## Frontend provjera nakon usklađivanja — 2026-10-08

TypeScript --noEmit: PASS. Ciljani ESLint (invitation-guests, project-guests, seating, Supabase server i generated tipovi): PASS. npm run build: PASS. Puni npm run lint: 6 grešaka u nepovezanim BackToTop, PageContainer/Page, FilePicker, Skeleton, tooltip i AuthProvider datotekama, uz 4 img upozorenja. Te datoteke nisu mijenjane ovom integracijom. Generirani database.types.ts normaliziran je iz UTF-16LE u UTF-8 bez promjene sadržaja tipova; ESLint ignorira privremenu .tmp mapu.

Browser provjera aktivnog project guest toka nije izvršena: flag ostaje isključen prema zahtjevu. Nema zasebne project guest tablice/stranice, Konve ili novog seating editora; baza nije mijenjana.

## 2D editor V1 — 2026-10-08

Implementirani projektni planovi, kopiranje aktivnog templatea, klijentski react-konva canvas, pan/zoom/fit, stolovi i transformacije, React paneli i eksplicitni sudionici/dodjele te postojeći RSVP resolver. SQL i hosted environment nisu mijenjani.

- Četiri trajna editorGeometry testa: PASS.
- TypeScript (noEmit i build TypeScript): PASS.
- Ciljani ESLint za seating, projektnu karticu i i18n: PASS.
- Konačni npm run build na Node 24.21.0 / Next 16.3.8: PASS.
- Puni lint: istih 6 nepovezanih grešaka i 4 upozorenja; nema novih seating grešaka.
- Browser/live RPC scenariji novog editora nisu izvršeni. Ručni koraci i ograničenja: EDITOR.md. Guest/recipient/RSVP frontend korisnik je prethodno ručno provjerio; to se ne računa kao provjera novog editora.

## UX i rute — 2026-10-08

/seating je pregled kartica s counts i modalom Novi raspored. /seating/[planId] je zaseban fullscreen editor u postojećem standalone route groupu. Ponovno iskorišteni EditorShell, EditorHeader, EditorSaveStatus, EditorWorkspace, EditorSidebar i EditorMobilePanel; opcionalni desni sidebar ne mijenja default drugih editora. Toolbar sadrži canvas kontrole, a postavke plana su modal. Gosti/Svojstva stola imaju odvojeni panel scroll, na mobitelu drawer. SQL/RPC signature nisu mijenjani.

Konačni TypeScript, ciljani ESLint i build: PASS. Postojeća 4 geometry testa: PASS. Browser skill je provjeren, ali nema povezanog preglednika; nova visual QA nije izvršena. Ručni koraci ažurirani u EDITOR.md.

## Izravne interakcije, gosti i stolice — 2026-10-08

Aktualna dorada dodaje resize/rotaciju stolova, resize prostorije bez skaliranja stolova, Ruka/Space i pinch, grupe gostiju, pointer drop i tap-odabir stola, novi unos osobe s uključivanjem u plan te stolice i −/+ spremljenog kapaciteta. Svojstva stola više nemaju geometrijska polja. Svaka podatkovna promjena ide kroz postojeći RPC i reviziju; SQL, dependencies i environment nisu mijenjani.

- Osam editorGeometry/canvasInteraction aplikacijskih testova: PASS (bez baze ili ključeva).
- npx tsc --noEmit: PASS; završni build TypeScript također PASS.
- npx eslint src/features/seating nakon završnih touch ispravaka: PASS.
- Konačni npm run build: PASS (Node 24.21.0 / Next 16.3.8).
- git diff --check: bez whitespace grešaka u tracked promjenama; Git prikazuje uobičajena LF/CRLF upozorenja.
- Browser discovery nije pronašao povezan preglednik. Nova vizualna QA, stvarne desktop/mobilne geste i live RPC tok ove dorade nisu izvršeni; ručni testovi su u EDITOR.md. Ovo nije potvrda da su svi uređaji/touch preglednici provjereni.

Za tražene interakcije nema potrebnih novih paketa ili DB objekata. Nova osoba + membership koriste dva RPC-a i mogu imati djelomičan/nejasan ishod; UI čuva potvrđeni ID osobe, nudi reload i ne ponavlja stvaranje automatski. Strogi all-or-nothing upis tražio bi novi kombinirani RPC, nije dodan ni izvršen. Stolice su prikaz stvarnog kapaciteta, bez pojedinačnih dodjela; granice provjeravaju tijelo stola prema postojećem modelu.

## Lijevi panel i resize sa svih strana — 2026-10-08

Seating koristi lijevi panel zajedničkog EditorWorkspacea, kao pozivnice i digitalni album; njegov scroll i mobilni drawer ostaju u seating sučelju. Prostorija ima osam aktivnih ručki. Lijevi/gornji rub tijekom previewa mijenjaju vizualni početak prostorije; commit prenosi taj pomak u lokalni viewport i sprema samo width/height postojećim RPC-om/revizijom. Stolovi zadržavaju cm koordinate, veličinu, rotaciju i kapacitet. Smanjenje preko zakrenutih stolova odbija se prije upisa i ponovno provjerava u postojećem RPC-u.

TypeScript: PASS. Ciljani seating ESLint: PASS. Svih 10 aplikacijskih testova: PASS, uključujući svih osam ručki/normalizaciju prikaza i odbijanje lijevog/gornjeg smanjenja. npm run build: PASS. SQL, dependencies i environment nisu mijenjani. Browser/touch QA ove dorade nije izvršena; manualni koraci ažurirani u EDITOR.md.

## Veličina stolica i početnih stolova — 2026-10-08

Uklonjen je fiksni maksimum 30 cm za dekorativnu stolicu. Veličina i odmak prate dimenzije stola, uz ograničenje dostupnog razmaka pri velikom kapacitetu. Sjedište ima zaobljene rubove i prikaz naslona. Novi stolovi: okrugli Ø 300 cm, pravokutni 360 × 180 cm, 8 mjesta. Manje prostorije proporcionalno smanjuju defaults, uključujući siguran centar pri neparnim dimenzijama; zoom ne utječe na podatke. Postojeće dimenzije i predlošci nisu automatski prepisani.

TypeScript: PASS. Ciljani ESLint: PASS. Svih 10 postojećih aplikacijskih testova: PASS. Konačni build: PASS. Browser/touch vizualna provjera ove dorade nije izvršena. Nema novih paketa ili SQL izmjena.

## Responsive fit na mobitelu — 2026-10-08

Popravljen je zadržani desktop zoom nakon promjene širine canvasa: početno otvaranje i širinske promjene automatski uklapaju prostoriju u aktualnu raspoloživu površinu, s manjim marginama na uskom canvasu. Promjene samo visine zbog poruke čuvaju ručni zoom. Na mobitelu Prikaži prostor ima tekstualnu oznaku i dolazi prije zoom tipki. Fit mijenja samo viewport, bez RPC-a ili promjene centimetara.

TypeScript: PASS. Ciljani seating ESLint: PASS. Svih 12 testova: PASS, uključujući desktop → mobile bounds i očuvanje zooma na height-only notice. Build: PASS. Browser/stvarne touch provjere ove dorade nisu izvršene; ručni koraci su u EDITOR.md. SQL i dependencies nisu mijenjani.

## Početne dimenzije iz spremljenih stolova — 2026-10-08

Na izričit zahtjev korisnika izvršen je samo agregatni SELECT u READ ONLY transakciji nad seating_tables njegova projekta. Šest okruglih stolova: zaokruženi prosjek 479 × 479 cm, raspon promjera 431–560 cm. Dva pravokutna: prosjek 444 × 398 cm, širine 401–487, visine 395–400 cm. U aplikaciji su nove fiksne početne vrijednosti zaokružene na Ø 480 cm i 440 × 400 cm; u manjim prostorijama ostaje proporcionalno prilagođavanje. Kapacitet ostaje 8. Postojeći stolovi, predlošci i baza nisu mijenjani. Nema automatskog približavanja stola ili Prikaži stolove gumba iz otkazanog pokušaja.

Ciljani ESLint: PASS. TypeScript --noEmit: PASS. Ova dorada mijenja samo konstante novih stolova; browser upisi nisu izvršeni.

## Prekid resizea pri promjeni prikaza i aktualne početne dimenzije — 2026-10-08

Otkriven je put kojim promjena širine/visine canvasa mijenja Stage viewport dok Konva Transformer još ima aktivan potez i apsolutne koordinate početka. Prekinuta transformacija može ostaviti scale na čvoru; stari table commit spremao je i taj scale pri običnom drag-u. Canvas sada prije responsive fit-a/zoom-a/fit-a zaustavlja i invalidira aktivne geste te vraća potvrđenu geometriju i preview. Završni događaj koji nastane tijekom stopTransform/stopDrag ili stigne kasnije ne pokreće upis. Isti prekid vrijedi za pinch, Space/Ruka, promjenu odabira, touch/pointer cancel i blur. Drag stola odvojeno normalizira samo položaj.

Na novi izričit zahtjev korisnika ponovljen je READ ONLY SELECT nad seating_plans/seating_tables njegova projekta. Trenutni plan ima 2000 × 1500 cm, jedan okrugli stol 229 × 229 cm i jedan pravokutni 237 × 206 cm, oba kapaciteta 8. Novi stolovi koriste te točne fiksne početne dimenzije, uz postojeće proporcionalno smanjenje u manjim prostorijama. To zamjenjuje ranije konstante 480 i 440 × 400 cm. Baza, postojeći stolovi i predlošci nisu mijenjani; nema automatskog focus-a ili Fit tables funkcije iz otkazanog pokušaja.

- Svih 14 trajnih seating testova: PASS. Dva nova testa koriste stvarne Konva objekte bez DOM-a i sintetizirano aktivno stanje Transformera; provjeravaju emitirani transformend pri zaustavljanju, ignoriranje zakašnjelog završetka, vraćanje geometrije, idući dovršen resize i očuvanje dimenzija/rotacije pri pomicanju. To nisu browser gesture testovi.
- npx tsc --noEmit: PASS.
- Ciljani ESLint za dvije komponente, geometriju, canvasGesture i test: PASS. Tri lokalna izuzeća set-state-in-effect dokumentiraju usklađivanje vanjskih mutable Konva transformacija i React previewa; ostala pravila ostaju uključena.
- npm run build: PASS (Next 16.3.8).
- Browser/DevTools/touch QA i live RPC upisi nisu izvršeni. EDITOR.md sadrži desktop → mobitel → desktop i prekid resizea prije promjene prikaza kao ručne korake.

Nema novih paketa, SQL izmjena, promjene flaga ili commita.
