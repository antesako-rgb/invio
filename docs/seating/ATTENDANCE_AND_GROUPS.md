# Javni odgovori, ručni dolazak i grupe pozivnice

Pripremljeno za korisnikovu bazu s postojećim 001–008 i provjerenim RSVP modelom. Nema migracije/backfilla gostiju. Agent ne briše podatke i nije izvršio postavu na live bazi.

## Korisnički tok

U seatingu **Dodaj gosta → Odgovori iz pozivnice** prikazuje još nepovezane javne odgovore iz spremljene RSVP pozivnice, s imenom i statusom. **Dodaj u goste** stvara novu projektnu osobu, vezu u pozivnici i članstvo u planu. **Poveži postojećeg → Poveži i dodaj u plan** koristi odabranu postojeću osobu. Jedan RPC radi sve u jednoj transakciji. Ne spaja imena automatski. Ponavljanje za već povezani odgovor ne stvara novu osobu; stara revizija odbija se prije upisa. Gost se uključuje bez stola; odabir stolice ili cijele grupe nastavlja se kroz postojeći seating tok. Ako je dijalog otvoren iz odabrane stolice/stola, potvrđeni gost vraća se u taj odabir. Novi javni odgovori tijekom otvorenog dijaloga postaju dostupni nakon zatvaranja i osvježavanja.

U pozivnici popis gostiju i detalji povezanih odgovora imaju izbor **Dolazi / Ne dolazi / Koristi odgovor gosta**. Ručna odluka čuva se u `invitation_attendance_overrides` po pozivnici i projektnoj osobi, s korisnikom i vremenom izmjene. Ima prednost pred svim javnim/personaliziranim odgovorima dok je organizator ne ukloni. Isti čovjek može imati različitu odluku za drugu pozivnicu. Izvorni odgovori, imena upisana u javni obrazac i odgovori na pitanja ne mijenjaju se. Nepovezani javni odgovor prvo treba povezati s osobom kroz postojeće kontrole u detaljima; nakon toga dostupan je ručni status.

Seating čita isti efektivni status. Ručno Dolazi može uključiti osobu bez javnog odgovora ili razriješiti proturječne odgovore za automatsko uključivanje. Ručno Ne dolazi sprječava automatsko uključivanje novih sudionika, ali već postojeće članstvo/stolica ostaju uz upozorenje. Ručno uklanjanje iz plana i dalje je jače od automatskog uključivanja. Izvorni konflikti ostaju vidljivi uz oznaku **Ručno potvrđeno**. Nesiguran ishod promjene zahtijeva eksplicitno osvježavanje, bez automatskog ponavljanja.

Grupe dolaze iz `invitation_guest_groups` i `invitation_guests.group_id` samo od spremljene RSVP pozivnice. Ne kopiraju se i nisu recipient/grupa ljudi iz jednog javnog odgovora. Gosti imaju naziv grupe, glavni panel i picker imaju filter **Sve grupe**, a višestruki odabir nudi **Odaberi cijelu grupu**. Odabir čuva prethodno označene goste i ne dijeli grupu prema kapacitetu stola. Ako ne stane, preview navodi manjak mjesta i spremanje je blokirano; korisnik bira veći stol ili svjesno mijenja odabir. Granica jednog grupnog spremanja ostaje 100 osoba. Novi javni gost početno je bez grupe; grupu može dobiti u pozivnici kroz postojeće uređivanje gosta.

## SQL Editor: redoslijed

Ove datoteke koriste se nakon već instaliranog RSVP modela koji je korisnik potvrdio. Originalni INSTALL_ALL_REVIEW, 001–008 i APPLY_EMPTY_RSVP_MODEL ne pokreću se ponovno.

1. [PREFLIGHT_EMPTY_ATTENDANCE_MODEL.sql](install/PREFLIGHT_EMPTY_ATTENDANCE_MODEL.sql), cijela datoteka kao `postgres`: očekuje `empty_attendance_model_ready=true`.
2. [APPLY_EMPTY_ATTENDANCE_MODEL.sql](install/APPLY_EMPTY_ATTENDANCE_MODEL.sql), cijela datoteka u jednom pozivu, jednom, uz zaustavljene seating/guest/RSVP upise. Samo zadnji redak radi COMMIT. Na grešci ROLLBACK i pregled poruke.
3. [VERIFY_ATTENDANCE_MODEL_READ_ONLY.sql](install/VERIFY_ATTENDANCE_MODEL_READ_ONLY.sql): očekuje `attendance_model_verified=true` i `member_execute=true`.
4. Regeneracija `database.types.ts`, zatim osvježavanje aplikacije.

Preflight zahtijeva prazne `project_guests`, članstva/dodjele i iznimke seatinga. Planovi/stolovi mogu ostati; njihova revizija i izvor čuvaju se. Postava provjerava prethodni RSVP baseline, owner/security/search_path/ACL potrebnih funkcija, stvara jednu tablicu, dva RPC-a i zamjenjuje tijelo sync RPC-a. Ne briše/kopira goste i ne mijenja podatke odgovora. Već postavljen model odbija ponavljanje. Nakon ove postave koristi se novi attendance verify; stari RSVP verify namjerno provjerava prethodno instalirano tijelo sync funkcije.

Canonical definicije u `definitions/invitation_attendance_overrides` i `definitions/seating_plan_guests` integrirane su u generator `node src/features/seating/tests/buildEmptyAttendanceModel.cjs --write`. Korisnik je potvrdio `attendance_model_verified=true`, `member_execute=true` i regeneraciju DB tipova. Frontend koristi generiranu tablicu i RPC tipove; privremene definicije modela su uklonjene. Generirani DB tipovi nisu ručno uređivani. Postojeći `nullableRpcArgs` adapter čuva nullable SQL argumente za uklanjanje ručnog statusa i stvaranje nove osobe iz javnog odgovora. Status iz tablice provjerava se prije slanja u frontend. Ako tablica nije dostupna u nekom drugom okruženju, čitanje statusa ostaje dostupno uz poruku; ručne kontrole su onemogućene, a import javnog gosta javlja poznatu poruku o potrebnoj postavi. Preflight i apply ne ponavljaju se na već postavljenom modelu.

## Provjera prije objave

Javni odgovor → Dodaj gosta → nova/postojeća osoba → jedna osoba u pozivnici i planu; neuspjelo uključivanje ne ostavlja novu osobu. Ručno Ne dolazi na već posjednutoj osobi → status i upozorenje bez oslobađanja stolice. Koristi odgovor gosta → vraćen izvorni status. Grupa iz spremljene pozivnice → cijeli odabir → automatske/ručne stolice jednim spremanjem; premalen stol jasno odbija spremanje. Provjeriti desktop i mobitel, promjenu izvora, nepovezan javni odgovor i dva suorganizatora.

Izolirani SQL runner koristi jednu PGlite vezu. Live DB i stvarni mobilni/browser tok nisu testirani od strane agenta; native konkurentne veze ostaju QA zadatak.
