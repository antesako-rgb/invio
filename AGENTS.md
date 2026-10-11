<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Projektne upute za Codex

Ove upute vrijede za cijeli projekt. Postojeći Next.js blok iznad ostaje na snazi.

## 1. Sigurnost Supabase baze

- Trenutačni udaljeni Supabase projekt služi razvoju i testiranju. To nije dozvola za automatske promjene baze.
- Supabase MCP konfiguriran je s `read_only=true`. Sačuvaj tu postavku i ne mijenjaj MCP konfiguraciju bez izričitog odobrenja korisnika.
- Read-only alatima smiješ pregledavati shemu, tablice, odnose, indekse, RLS pravila, grantove, triggere i RPC funkcije.
- Nikada automatski ne izvršavaj udaljene mutacije, uključujući `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `CREATE`, `ALTER`, `DROP` ili migracije. Pozivanje RPC funkcije koja mijenja podatke također je mutacija.
- Ne koristi `SUPABASE_SECRET_KEY` ili druge privilegirane vjerodajnice za mutiranje udaljene baze.
- Ne izvršavaj `supabase db push`, udaljeni `supabase migration up`, destruktivne naredbe baze ili ekvivalentne operacije bez izričitog odobrenja korisnika za konkretnu operaciju. Isto vrijedi za terminal, API, MCP i druge alate.
- Sve migracije pripremi kao lokalne SQL datoteke za ručni pregled i izvršavanje od strane korisnika. Zahtjev za implementacijom ili pripremom SQL-a sam po sebi ne odobrava njegovo udaljeno izvršavanje.
- Prije predlaganja migracije pregledaj trenutačnu strukturu baze i relevantne ovisnosti. Ako to nije moguće, jasno navedi što nije provjereno; nemoj pretpostavljati udaljeno stanje na temelju lokalnih definicija.
- Kada je primjereno, dodaj zaseban read-only SQL za provjeru rezultata.
- Ne pretpostavljaj da je migracija primijenjena dok njezin rezultat nije provjeren.
- Dopušteno je generiranje TypeScript tipova koje samo čita udaljenu bazu i zapisuje lokalnu datoteku tipova.
- Nikada ne izlaži, ispisuj ni commitaj tajne vjerodajnice.

Ovo su operativne upute, a ne tehnička ograničenja pristupa. Read-only MCP ne ograničava automatski terminal, aplikaciju ili druge kanale.

## 2. Arhitektura projekta

- Prije implementacije pregledaj postojeću strukturu i relevantan kod.
- Slijedi postojeću arhitekturu po značajkama u `src/features`, konvencije imenovanja i obrasce importa.
- Ponovno koristi postojeće komponente, hookove, utilse i repozitorije. Pregledaj zajedničke komponente, uključujući `src/features/editor` i `src/components`, prije dodavanja novih.
- Izbjegavaj nepotrebne apstrakcije i nove ovisnosti.
- Ne uvodi arhitekturne promjene koje nisu povezane sa zatraženim zadatkom.
- Sačuvaj postojeću funkcionalnost osim ako korisnik izričito zatraži njezinu promjenu ili uklanjanje.

## 3. Frontend standardi

- Slijedi postojeće Next.js, React i TypeScript konvencije te Next.js upute iz bloka iznad.
- Održavaj kompatibilnost sa strogim TypeScript provjerama.
- Ne koristi inline CSS ni React `style` prop bez dokumentirane tehničke potrebe.
- Koristi postojeći sustav stiliziranja projekta.
- Poštuj postojeće responzivne prikaze i mobilne interakcije.
- Koristi postojeći HR/EN sustav internacionalizacije u `src/i18n` i `src/messages`.
- Izbjegavaj hardkodirane korisničke tekstove kada su prijevodi dostupni. Nove korisničke tekstove dodaj kroz postojeći sustav prijevoda za HR i EN.

## 4. Tijek implementacije

Za opsežnije zadatke ili zadatke osjetljive na arhitekturu:

1. Pregledaj relevantnu implementaciju.
2. Utvrdi ovisnosti i moguće rizike.
3. Kada je primjereno, objasni predložene promjene prije implementacije. Za udaljene mutacije uvijek vrijedi obvezno izričito odobrenje iz odjeljka 1.
4. Implementiraj samo zatraženi opseg.
5. Pokreni relevantne dostupne provjere i testove. Provjere koje bi mijenjale udaljenu bazu ne pokreći bez odobrenja.
6. Sažmi promijenjene datoteke, rezultate provjera i preostale rizike. Jasno razlikuj lokalno testirano od provjerenog na udaljenoj bazi.

Za male, jasne promjene izbjegavaj nepotrebno planiranje. Sigurnosna pravila vrijede neovisno o veličini zadatka.

## 5. Sigurnost i integritet podataka

- Ne izlaži vrijednosti varijabli okruženja, API ključeva, tokena ili drugih vjerodajnica.
- Ne commitaj `.env.local` ni druge datoteke koje sadrže tajne. Pri pregledu konfiguracije prikazuj samo potrebna imena varijabli ili informaciju o njihovoj prisutnosti, bez vrijednosti tajni.
- Poštuj autentikaciju, autorizaciju i RLS granice.
- Ne zaobilazi sigurnosne provjere aplikacije radi jednostavnije implementacije.
- Destruktivne operacije i migracije podataka tretiraj kao visokorizične promjene.
- Prije svake operacije koja može promijeniti ili obrisati udaljene podatke traži izričito odobrenje za konkretnu operaciju, u skladu s odjeljkom 1.

## 6. Odvajanje produkcije

- Prije lansiranja bit će izrađen zaseban produkcijski Supabase projekt.
- Nikada ne pretpostavljaj da razvojne vjerodajnice vrijede za produkciju.
- Ne uvodi produkcijske tajne u lokalne razvojne datoteke.
- Produkcijske migracije i deployment operacije moraju ostati pod izričitom kontrolom korisnika.

## 7. Komunikacija

- Komuniciraj s korisnikom na hrvatskom.
- Tehničke identifikatore, kod i nazive datoteka ostavi na izvornom jeziku.
- Značajne arhitekturne odluke objasni na hrvatskom, jasno i sažeto, uz razlog odluke i njezine posljedice.
