> Current status: install and legacy DROP have been applied by the user. Do not execute them again. Definitions reflect current objects.

# Storage lifecycle - upute

Odabrani put je [install/README.md](install/README.md): numerirane skripte
organizirane po objektima, za rucnu instalaciju u SQL Editoru.

Supabase i Bunny nisu mijenjani. PostgreSQL testovi nisu izvrseni jer lokalni
PostgreSQL alati nisu dostupni; paket jos nije potvrden za produkciju.

## Folderi

| Folder | Namjena |
| --- | --- |
| definitions/ | Zasebne definicije za spremanje, NE za primjenu. |
| install/ | Izvrsive skripte po objektima; redoslijed 001-018. |
| tests/ | Iskljucivo izolirana testna baza i testni scenariji. |
| checks/ | Read-only provjere prije i nakon instalacije. |
| rollback/ | Skripte za povratak/freeze; procitaj ogranicenja prije primjene. |
| tools/ | Lokalne provjere i izolirani PostgreSQL runner. |
| review/ | Arhitektura, nalazi i udaljeni PUT uvjeti. |

## Sto spremam po folderima

[definitions/README.md](definitions/README.md) opisuje zasebne queryje za SQL Editor.
To je samo pregled/spremanje, bez ponovnog izvrsavanja nakon installa.

## Sto izvrsavam

Install ostaje jedini paket za pocetnu primjenu, redom 001-018.

## Redoslijed rada

1. Pokreni [read-only preflight](checks/000_preflight_read_only.sql) i sacuvaj definicije/grants.
2. Prije produkcije izvrsi [izolirane PostgreSQL i staging testove](tests/README.md).
3. Zaustavi storage upise i scheduler, ukljuci maintenance i isprazni stare in-flight zahtjeve.
4. Kao postgres izvrsi install **001-017**, svaku skriptu cijelu jednom.
   Slijedi [tocan popis](install/README.md), prema broju preko svih foldera.
5. Izvrsi **install/activation/018_ACTIVATE.sql**: atomska aktivacija svih guardova i grants.
6. Pokreni [read-only verify](checks/003_verify_read_only.sql).
7. Regeneriraj DB tipove, zamijeni planned RPC type boundary u storage repositoryju,
   provjeri build i pusti application kod s cleanupom iskljucenim. Zatim vrati promet.
8. Cleanup ukljuci tek nakon potvrde [remote PUT uvjeta](review/REMOTE_PUT.md),
   scheduler secreta i hosting limita.

Vec izvrsene CREATE skripte ne ponavljaj. Ako si prethodno primijenio monolitne

## Lokalne provjere

```powershell
python -B docs/storage-lifecycle/tools/test_sql_organization.py
node.exe --test src/features/project-photos/storage/storageLifecycle.test.cjs
```

Izolirani PostgreSQL runner (prilagodi putanju instalaciji):

```powershell
python -B docs/storage-lifecycle/tools/run_postgres_tests.py --run-isolated --pg-bin "C:/Program Files/PostgreSQL/17/bin"
```

Runner stvara novi lokalni cluster. Ne cita .env, ne spaja se na Supabase i ne
poziva Bunny. **tests/postgres SQL ne kopiraj u produkcijski SQL Editor.**

## Povratak i status

[Install upute](install/README.md) opisuju djelomicni install i rollback granice.
[rollback_prepare_only.sql](rollback/rollback_prepare_only.sql) nije opci rollback za
proizvoljan djelomicni install. Nakon aktivacije koristi
[rollback_freeze.sql](rollback/rollback_freeze.sql), uz iskljucen scheduler.
Ledger/jobs i sigurnosni guardovi ostaju; SQL ne vraca obrisani Bunny objekt.

- 9 lokalnih organization testova proslo; svih 18 install skripti uskladeno.
- Ranije provjere: 12 mock storage testova, ciljani TypeScript i ESLint prosli.
- Stvarni PostgreSQL testovi **nisu izvrseni**: compilation, cascade i concurrency
  nisu potvrdeni izvrsavanjem. Detalji: [FINDINGS.md](review/FINDINGS.md).

## Post-install maintenance

[Applied SQL history](history/README.md): do not replay.
[Hosted cleanup proposal and remaining tests](review/HOSTED_CLEANUP_PLAN.md).

[Concrete Vercel Hobby setup](review/VERCEL_HOBBY_SETUP.md) — not enabled.
