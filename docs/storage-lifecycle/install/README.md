# Instalacija po objektima — tvoj odabrani put

Install je jedini instalacijski SQL paket. Izvrsavaj skripte 001-018 redom.

PostgreSQL testovi još nisu izvršeni. Prvo provjeri ovaj put na izoliranoj bazi
i klonu stvarne sheme. Nove objekte ne smiješ već imati instalirane.

## Ručni postupak

1. Izvrši `../checks/000_preflight_read_only.sql`; sačuvaj postojeće definicije/grants.
2. Kao postgres radi tijekom cijelog paketa u maintenance prozoru: storage upisi
   i scheduler zaustavljeni, stari in-flight zahtjevi ispražnjeni.
3. Izvrši svaku numeriranu SQL datoteku cijelu, jednom, ovim redom:

| Broj | Objekt / datoteka |
| --- | --- |
| 001 | `private.storage_objects/001_table.sql` |
| 002 | `private.storage_cleanup_jobs/002_table.sql` — ovisi o 001 |
| 003 | `private.storage_legacy_review/003_table.sql` |
| 004 | `storage_lifecycle/004_private.storage_lock.sql` |
| 005 | `storage_lifecycle/005_private.storage_key_alias.sql` |
| 006 | `storage_lifecycle/006_private.storage_has_references.sql` — ledger/archive/alias i postojeći document helperi |
| 007 | `storage_lifecycle/007_private.storage_queue.sql` — prethodne tablice/helperi |
| 008 | `storage_lifecycle/008_public.storage_reserve_upload.sql` |
| 009 | `storage_lifecycle/009_public.storage_finalize_upload.sql` |
| 010 | `storage_lifecycle/010_public.storage_request_cleanup.sql` |
| 011 | `storage_lifecycle/011_public.storage_claim_cleanup.sql` |
| 012 | `storage_lifecycle/012_public.storage_finish_cleanup.sql` |
| 013 | `storage_lifecycle/013_private.storage_document_guard.sql` |
| 014 | `storage_lifecycle/014_private.storage_photo_guard.sql` |
| 015 | `storage_lifecycle/015_private.storage_link_guard.sql` |
| 016 | `storage_lifecycle/016_private.storage_unlinked.sql` |
| 017 | `storage_lifecycle/017_private.storage_project_deleted.sql` |
| **018** | **`activation/018_ACTIVATE.sql` — granica aktivacije** |

Skripte 001–003 u istoj transakciji stvaraju table + constraints, pripadajuće
indexe, RLS, restrictive deny-all policies i zatvaraju table grants. Ne postoji
commit nezaštićene privatne tablice.

Skripte 004–017 u istoj transakciji stvaraju funkciju i zatvaraju client EXECUTE.
Novi public management RPC-i još nemaju service_role EXECUTE. Trigger funkcije
postoje, ali još nijedan novi trigger nije aktivan. Postojeći write RPC-i zato
i dalje zahtijevaju maintenance tijekom pripreme.

## 018 — jedna atomska aktivacija

Jedna transakcija zamjenjuje invitation photo-ID helper, uključuje svih 10
triggera, zatvara stare arbitrary-path create RPC-e i daje service_role EXECUTE
nad pet novih management RPC-a. Sve ovisnosti već su instalirane.

Triggeri se namjerno uključuju zajedno, da ne ostane djelomična zaštita između
tablica. Ako 018 ne uspije, cijela aktivacija se rollbacka.

Nakon 018 izvrši `../checks/003_verify_read_only.sql`, regeneriraj DB tipove i pusti
novi application kod. Cleanup ostaje isključen do PostgreSQL/staging provjera
i potvrde remote PUT uvjeta. Ne ponavljaj kompletne migracije.

## Greška i povratak

Svaka skripta ima begin/commit. Na grešci stani: prethodni koraci već su commitani.
Provjeri rollback neuspjelog koraka; ne ponavljaj uspješne CREATE skripte.

Prije 018 dovrši/popraviti pripremu uz maintenance. Postojeći
`../rollback/rollback_prepare_only.sql` pretpostavlja sve prepare objekte i nije opći rollback
proizvoljnog djelomičnog installa; za njega treba poseban SQL prema izvršenim koracima.
Nakon 018 koristi `../rollback/rollback_freeze.sql`, uz isključen scheduler i reviewed forward fix.
Ledger/jobs se zadržavaju. SQL ne može vratiti već obrisani Bunny objekt.

Foldere private.storage_objects, private.storage_cleanup_jobs,
private.storage_legacy_review, storage_lifecycle i activation prenesi kao foldere
u SQL Editor. Redoslijed određuje broj datoteke, NE abecedni red foldera.
Invitation helper i svi trigger bindings ostaju u posljednjoj activation skripti
zbog atomske zaštite; ne izvršavaju se zasebno.

ali nisu tvoj način izvršavanja nakon ovog installa.

## Zasebni queryji za spremanje

[definitions/](../definitions/README.md) sadrzi table/index/rls/grants/trigger
i zasebne funkcije. Samo ih spremi za pregled; ne izvrsavaj nakon installa.
