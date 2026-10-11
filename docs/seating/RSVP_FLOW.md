# Pozivnica i gosti u seating planu

Aktualna dopuna javnih gostiju, ručne potvrde dolaska i grupa opisana je u [ATTENDANCE_AND_GROUPS.md](ATTENDANCE_AND_GROUPS.md). Korisnik je već potvrdio instalaciju prvog RSVP modela; za novu pripremljenu postavu koristi se attendance paket iz tog dokumenta.

Glavni tok je jedna pozivnica po projektu. Novi plan, prazan ili iz predloška, automatski sprema tu pozivnicu kao izvor potvrda dolaska. Korisnik otvara plan i vidi povezane goste koji su potvrdili Dolazi među neraspoređenima. Dodaj gosta ostaje za ručno dodavanje; Dodaj goste na stolu ostaje za grupno raspoređivanje. Zasebno ponovno uključivanje RSVP gostiju uklonjeno je iz sučelja.

Kod više pozivnica korisnik jednom odabire izvor u Postavkama i sprema plan. Kod jedne vidi naziv pozivnice i zajednički Switch za povezivanje/isključivanje. Bez pozivnice plan radi ručno. Isključivanje izvora ostaje spremljeno; ažuriranje naziva/prostora ne povezuje ga ponovno. Ako se pozivnica kreira nakon ručnog plana, vezu se jednom uključi u Postavkama.

## Kada se odgovori prate

Automatski Server Action radi pri otvaranju plana, spremanju novog izvora, ponovnom učitavanju i povratku u vidljivi editor. Aktivni izbor gosta/grupe/stola, povlačenje i spremanje odgađaju osvježavanje; povratak se pamti do završetka interakcije. Nema stalnog polling-a ili realtime pretplate. Dok korisnik bez prekida radi u editoru, nove odgovore može dohvatiti preko Ponovno učitaj.

Provjera RSVP-a radi u pozadini i čuva status u zaglavlju; „Spremanje…” prikazuje se za korisničke promjene. Povratak u prozor ne pokreće novi zahtjev unutar 30 sekundi od prethodne provjere, a istodobni focus/visibilitychange događaji ne dupliciraju zahtjev. Otvaranje, promjena izvora i ručno ponovno učitavanje zaobilaze to ograničenje. I kada nema novih sudionika, statusi dolaska ponovno se učitavaju. Potvrđeni novi sudionici javljaju se toastom; neizvjestan upis i dalje traži izričito ponovno učitavanje prije daljnjih promjena.

SQL sam čita spremljeni izvor pod project → plan lockom. Nakon attendance postave ručna odluka ima prednost. Bez nje uključuje aktivne povezane projektne osobe s Dolazi bez proturječnih generičkih odgovora; personalizirani odgovor ima prednost, a u njegovoj odsutnosti bezkonfliktni generički Dolazi omogućuje uključivanje. Ne dolazi, pending, arhivirane/nepovezane osobe i nerazriješeni sukobi ne uključuju se automatski. Generički odgovor povezuje se s projektnom osobom u pozivnici ili kroz Odgovori iz pozivnice u seatingovom Dodaj gosta. Ista imena nisu veza.

Postojeća mjesta, ručno uključeni gosti i naziv/nacrti čuvaju se. Ne dolazi na već uključenom gostu ne uklanja osobu ili stolicu; postojeća upozorenja ostaju. Novi gost dobiva članstvo, a stol/stolica odabiru se kroz postojeći pojedinačni ili grupni tok. Cijeli sync je atomski, uključujući više od 100 dolazaka. Ako nema novih osoba, revizija ostaje ista. Kod konflikta ili nesigurnog ishoda nema ponavljanja do izričitog reload-a.

## Uklanjanje i ručni povratak

Ukloni iz plana koristi isti javni RPC potpis. Uz brisanje članstva upisuje privatni zapis plan/osoba u private.seating_rsvp_exclusions. Naknadni sync ili drugi RSVP izvor ne vraćaju tu osobu. Izričit Dodaj gosta/ručna grupna dodjela i dalje mogu uključiti istu osobu. Ukloni sa stola zadržava članstvo i ne stvara iznimku. Iznimke se uklanjaju zajedno s planom/osobom; nisu dostupne izravnim klijentskim SELECT/DML-om.

## Prva RSVP postava — već instalirana kod korisnika

Korisnik je obrisao podatke, ali zadržao instalirane tablice/funkcije 001–008. Zato ovo nije ponovna instalacija ili migracija/backfill gostiju: jedna postava stvara privatnu tablicu iznimaka, zamjenjuje tijelo manage_seating_participant uz isti potpis i dodaje sync_seating_rsvp_guests. Postojeće tablice, imena, goste, planove, revizije, RPC-e 006–008 i RSVP submission tok ne briše niti resetira. Ne izvršavati originalni INSTALL_ALL_REVIEW ponovno.

Redoslijed na toj bazi, kao postgres:

1. [PREFLIGHT_EMPTY_RSVP_MODEL.sql](install/PREFLIGHT_EMPTY_RSVP_MODEL.sql): read-only provjera praznih seating sudionika/dodjela, postojećih tijela/ACL i RLS-a.
2. [APPLY_EMPTY_RSVP_MODEL.sql](install/APPLY_EMPTY_RSVP_MODEL.sql): cijela datoteka jednom, na jednoj vezi, uz zaustavljene seating upise. Jedini COMMIT dolazi nakon provjera. Nema DROP-a, brisanja, backfilla ili izvršavanja synca pri postavi. Ako baseline odstupa, stati i pregledati razlog. Na grešci ROLLBACK.
3. [VERIFY_RSVP_MODEL_READ_ONLY.sql](install/VERIFY_RSVP_MODEL_READ_ONLY.sql): očekuje rsvp_model_verified=true/member_execute=true; provjerava private ACL/FK/RLS i oba tijela/potpisa/prava.
4. Regenerirati database.types.ts. Generirani tipovi nisu ručno mijenjani; novi javni RPC ima izolirani pripremljeni typed contract koji ostaje kompatibilan s regeneracijom.

Prvi setup/verify ostaje zamrznut na svom provjerenom sync tijelu, sa snapshotom u tests/fixtures/installedRsvpSync.sql; generator `buildEmptyRsvpModel.cjs` ne pristupa bazi. Aktualne canonical definitions sync-a uključuju ručnu odluku i ulaze u `buildEmptyAttendanceModel.cjs`. Već postavljen prvi model odbija ponovnu postavu. Ako postoje sudionici/dodjele, postava se zaustavlja; ne brisati stvarne podatke da bi se zaobišao guard.

Agent nije izvršio postavu na live bazi. Izolirani runner `rsvpSyncSql.cjs` koristi PGlite putanju kao argument; ne čita live vjerodajnice. Rezultati i granice provjera zapisani su u CHECKS.md.
