> Current status (2026-10-07): SQL020 applied; function body and grants verified read-only. Application deploy and scheduler setup still pending. Cleanup remains disabled. Earlier pending-SQL instructions below are historical.

# Vercel Hobby — konkretne upute (nije aktivirano)

Hosting/paket potvrdio korisnik: Vercel Hobby. Lokalni repository nije bio dokaz deploya.
Native Vercel Cron podrzava samo dnevno pokretanje na Hobbyju i salje GET.
Nas endpoint podrzava POST i do 3 objekta; dnevni batch bi zaostajao pri vise od
3 brisanja dnevno. Preporuka: zadrzati POST i koristiti QStash schedule svakih 5 min.
Nista nije konfigurirano na hostingu/scheduleru u ovom zadatku.

## 1. Prije ukljucivanja

Izolirani PostgreSQL concurrency/cascade/lease testovi jos nisu izvrseni (nema initdb).
Remote PUT expiry granica nije dokazana; trenutni claim ukljucuje stare pending rezervacije.
Prije trajnog automatiziranja potvrditi ove uvjete ili implementirati pregledan ready-only
cleanup s odvojenim postupkom za napustene rezervacije. Jedan uspjesan ready test nije dokaz toga.

## 2. Vercel projekt > Settings > Environment Variables

Odaberi Production, ne Preview/Development:
- STORAGE_CLEANUP_ENABLED = false za pocetni deploy.
- STORAGE_CLEANUP_SECRET = novi nasumicni 32-byte secret (64 hex znaka), Sensitive.
- Postojece server varijable moraju biti prisutne: SUPABASE_SECRET_KEY,
  BUNNY_STORAGE_ZONE, BUNNY_STORAGE_REGION, BUNNY_STORAGE_PASSWORD.
- NEXT_PUBLIC_SUPABASE_URL mora odgovarati instaliranoj bazi.
Ne koristi NEXT_PUBLIC_ prefiks za tajne. Lokalni testni secret nije za hosting.
Nakon izmjene varijabli redeploy Production da deployment dobije nove vrijednosti.
U Functions postavkama potvrdi Fluid compute i stvarni limit 300s; kod vec ima
maxDuration=300, ali stvarni limit provjeri u deploymentu. Batch radi do tri DELETE-a
po 60s plus DB overhead. Ne povecavaj batch bez mjerenja.

## 3. QStash schedule (u pocetku paused)

Destination: https://TVOJA-PRODUCTION-DOMENA/api/internal/storage-cleanup
Method: POST
Cron: */5 * * * *
Destination Authorization header: Bearer <isti STORAGE_CLEANUP_SECRET>
Bez request bodyja, secret nikad u URL-u. Odvojiti QStash API credential od
Authorization headera poslanog Memora endpointu. Podesiti timeout koji pokriva
worker trajanje u okviru dostupnog QStash paketa; ako ne pokriva, smanjiti batch.
Za pocetak retries=0: sljedeci tick i DB jobs/leases upravljaju ponavljanjem.
Ne dodavati Supabase ni Bunny kljuceve u scheduler. Izbjegavati preklapanje.
Provjeri da Vercel Deployment Protection ne blokira ciljnu production domenu;
ne gasiti zastitu cijelog projekta radi schedulera. Endpoint i dalje mora traziti bearer.

## 4. Aktivacija nakon testova/PUT uvjeta

Postavi STORAGE_CLEANUP_ENABLED=true samo za Production i redeploy.
Jednom rucno pokreni autorizirani POST prema produkcijskom endpointu, s prethodno
provjerenim kandidatima. Provjeri completed/failed, ledger/jobs i Bunny origin.
Tek zatim unpause schedule. Monitoriraj i failed>0 kod HTTP 200, ne samo status.
Prati backlog, najstariji pending posao, attempts, leased expiry i quarantine.
Gasimo: pause schedule -> flag false -> redeploy -> pregled in-flight poslova.

## Native dnevni cron kao alternativa

Za native cron potrebna je zasebna pregledana GET integracija sa CRON_SECRET i
vercel.json cronom; nije dodana jer bi trenutni POST vracao 405. Ne koristiti
*/5 na Hobby native cron: deploy bi odbio ucestalost. Ako biras dnevni cleanup,
prvo rijesiti kapacitet batcha/backlog. Nece automatski obraditi sve fotografije.

Izvori provjereni 2026-10-07:
https://vercel.com/docs/cron-jobs/usage-and-pricing
https://vercel.com/docs/cron-jobs
https://vercel.com/docs/functions/limitations
https://upstash.com/docs/qstash/api-reference/schedules/create-a-schedule
