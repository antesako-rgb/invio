# Svakodnevna provjera fotografija

## Gdje pogledati

U Supabase SQL Editoru izvrši operations/monitor.sql. To su read-only provjere. U Vercel Logs filtriraj /api/internal/storage-cleanup i traži storage_cleanup. Novi logovi dostupni su nakon deploya.

- complete: completed je broj potvrđenih brisanja, failed broj neuspjelih Bunny brisanja. HTTP 200 uz failed > 0 traži pregled.
- authorize: nije uspjela DB provjera jednokratnog ID-a.
- claim: nije uspjelo preuzimanje zadataka ili validacija DB odgovora.
- delete: Bunny brisanje nije uspjelo; zadatak se vraća kroz postojeći retry postupak.
- acknowledge: DB nije potvrdio rezultat; lease ostaje za ponovni pokušaj.

Kodovi su ograničeni na poznate SQL/PostgREST kodove, INVALID_RESULT, TIMEOUT, ABORTED ili UNCLASSIFIED. Nema error message/details, storage putanje, ID-a, tokena, potpisa ni secreta. UNCLASSIFIED je namjeran; nemoj radi dijagnostike dodavati ispis cijele greške. 401/409 se ne logiraju po pokušaju radi izbjegavanja spam logova. 503 provjeri prema cleanup enabled i konfiguraciji secreta; ne ispisuj njihove vrijednosti.

## Što znače stanja

- Job pending: čeka sljedeći dozvoljeni pokušaj. Provjeri next_attempt_at i attempts.
- Job leased: worker je preuzeo zadatak. Ako se prekine, drugi pokušaj moguć je nakon lease_until (trenutno sat vremena).
- Job done / object deleted: brisanje na Storageu ili 404 i DB potvrda završili su. CDN/browser cache može još sadržavati kopiju.
- Object pending: rezerviran upload bez potvrđenog završetka. To nije isto što i pending cleanup job.
- Object quarantined: zaštita je zaustavila brisanje; ne prebacuj ga ručno u deleting.

## Ako red raste

Provjeri da je cron active, da postoje novi HTTP odgovori i da nema 500/503. Cron success potvrđuje enqueue, a ne uspješno brisanje. Pogledaj Vercel fazu/kod i monitor backlog. Trenutni endpoint obrađuje najviše 3 zadatka svakih 5 minuta (nominalno 36/h). Veće brisanje može trajati više termina. Ne povećavaj batch dok nisu izmjereni trajanje i timeouti.

Za zastarjeli leased pričekaj expiry i idući cron. Ako i dalje stoji, usporedi has_references, object state i logove; nemoj ručno čistiti lease_token ili postavljati done. Ako se ponavlja claim/acknowledge greška, pregledaj funkciju/grants prema definitions, bez ponovne instalacije svega.

## Pregled object pending

Koristi read-only pending/backlog upite u operations/monitor.sql. Pending može nastati nakon decode greške, neuspjelog PUT-a ili izgubljenog finalize odgovora. Sama starost nije dokaz da je sigurno fizički obrisati objekt.

Nemoj automatski označiti finalized, ready ili deleting, brisati ledger ili cijeli Bunny direktorij. Za konkretan slučaj treba provjeriti ishod upload/finalize operacije i da udaljeni PUT više ne može dovršiti zapis; ako to nije dokazano, zadrži pending i traži pregled. Trenutno nema sigurnog automatskog reconciliation alata.

## Production provjera limita

Na namjenskom testnom proizvodu provjeri stvarni UI svih triju upload tokova: valjani JPG/PNG/WebP od točno 4.194.304 bajta treba proći, od 4.194.305 bajta treba biti odbijen uz poruku o 4 MB, bez nove rezervacije ili Bunny uploada. Provjeri i običnu manju fotografiju. Boundary datoteka mora biti stvarno dekodabilna slika, ne nasumični bajtovi s nastavkom .jpg.

Zabilježi deployment commit, tok, veličinu i rezultat. Frontend odbijanje nije dokaz serverskog odbijanja direktnog zahtjeva; taj scenarij zasebno provjeri u izoliranom testu. Ne šalji više slika u jednom action zahtjevu. Production test još nije potvrđen dok nisu zabilježeni stvarni rezultati. Postojeće korisničke fotografije ne koristiti za test.
