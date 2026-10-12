# Storage gate: analiza i minimalni hotfix

Status: korisnik je ručno primijenio hotfix na DEV-u i dostavio uspješan
VERIFY rezultat: storage_lock_hotfix_verified=true, storage_busy_sqlstate=PT503.
DEV katalog prije primjene pregledan je read-only 2026-10-12. Potvrda primjene
temelji se na korisnikovu rezultatu verifyja. TEST nije testiran.
Ovaj paket ne mijenja profiles/projects ni Database-as-Code strukturu.

## Stvarni mehanizam i zaključak

`private.storage_lock()` je SECURITY INVOKER, vlasnik postgres, vraća void,
ima prazni search_path i samo postgres EXECUTE. Ostali autorizirani SD
pozivatelji izvršavaju je kao postgres; nije javni RPC.

Koristi `pg_try_advisory_xact_lock(79314, 1)`: jedan globalni, ekskluzivni,
transakcijski advisory lock u ovoj bazi. Uspjeh drži gate do završetka
transakcije; zauzetost odmah vraća false. Ponovni poziv iz iste transakcije
uspijeva, pa nested triggeri/queue pozivi ne predstavljaju samokonflikt.

Gate koordinira provjeru referenci, dodavanje/uklanjanje fotografija,
finalizaciju i odobravanje cleanupa. Advisory lock nije zamjena za row lockove
i ne štiti kod koji ga ne koristi. Fizički Bunny PUT/DELETE odvija se izvan
SQL transakcije; cleanup lease i stanja objekta imaju zasebnu ulogu.

Zašto ne čekati: dokument/CRUD RPC može već držati parent row lock kada
njegov trigger pokuša dobiti gate. Druga transakcija može držati gate i
čekati taj parent. Zamjena try-locka blokirajućim lockom mogla bi stvoriti
kružno čekanje. Ovo je razlog zadržavanja fail-fast mehanizma, ne dokaz
da su svi ostali mogući deadlockovi isključeni.

Zaključak: ZADRŽATI funkciju zaključavanja, ključ, transakcijski opseg i
fail-fast. Promijeniti samo busy SQLSTATE `40001` → `PT503`. Ovo je privremena
nedostupnost resursa, nije poslovni revision conflict. PT409 bi je pogrešno
klasificirao kao promjenu dokumenta. PostgREST PT503 daje HTTP 503 bez
namjernog označavanja ove grane kao serialization_failure. Pozivatelji mogu
odlučiti o novom, ograničenom zahtjevu; nije uvedena SQL retry petlja.

## Potvrđeni izravni pozivatelji

| Funkcija | Uloga / redoslijed |
|---|---|
| private.storage_document_guard() | Trigger invitations/albums; gate prije storage row lockova, parent već može biti zaključan |
| private.storage_link_guard() | Trigger product-photo relacija; gate prije parent/photo lockova u tijelu |
| private.storage_photo_guard() | Trigger project_photos; gate i provjera identiteta |
| private.storage_project_deleted() | AFTER DELETE projects; parent DELETE već pokrenut, gate pa queue |
| private.storage_queue(uuid) | gate → object row lock → reference check → cleanup queue |
| public.storage_reserve_upload(...) | gate → product/project lockovi → reservation row lock |
| public.storage_finalize_upload(...) | gate → object row lock → product/project → photo/link triggeri |
| public.storage_claim_cleanup(integer) | gate → queue/ref provjere → job claim/lease |
| public.storage_finish_cleanup(...) | gate → object → job → provjera lease/reference → ACK |

Privatni pozivatelji su SD s postgres-only EXECUTE. Četiri javna izravna
Storage pozivatelja su SD i service_role-only EXECUTE. Prazni search_path i
postojeća tijela svih devet odgovaraju pregledanim lokalnim definicijama.
Neizravno: storage_request_cleanup → storage_queue, product unlink triggeri,
brisanje projekta/produkta i dokument CRUD/save RPC-ovi. Tekstualna pretraga
nije potpuna analiza dinamičkog SQL-a ili svih vanjskih klijenata.

## Ponašanje aplikacije

- uploadProjectPhoto: reserve/finalize imaju najviše dva pokušaja ukupno,
  isti ID; retry je trenutačan i hvata sve greške. Bunny PUT se ne ponavlja.
  To je postojeće ponašanje; ovaj hotfix ne širi broj pokušaja.
- Instalirani PostgREST SDK retry podržava samo GET/HEAD/OPTIONS. Storage RPC
  pozivi koriste POST; lokalni test s mock fetchom potvrđuje jedan SDK pokušaj
  za PT503. To ne dokazuje ponašanje udaljenog PostgREST procesa.
- Document save razlikuje PT409 od ostalih pogrešaka. PT503 ostaje SAVE_FAILED,
  a ne revision conflict. Nema uvedenog automatskog ponovnog spremanja.
- Cleanup claim ne uspije → nema dobivenih poslova i nema Bunny DELETE-a
  u tom pokretanju; postojeći cron kasnije pokreće novi posao.
- ACK može ne uspjeti nakon Bunny DELETE-a: lease ostaje za kasniji oporavak.
  Nema tvrdnje da je fizički DELETE rollbackan. Idempotentni DELETE i postojeći
  lease token/state guardovi ostaju potrebni.
- Endpoint /api/internal/storage-cleanup i dalje vraća sanitizirani 500 za
  worker grešku; PT503 je status PostgREST RPC-a, ne automatski status endpointa.
- cleanupLogging lokalno prepoznaje PT503 bez ispisa originalne poruke,
  putanje, tokena ili secreta. Ostala obrada ostaje nepromijenjena.

Globalni gate može izazivati nepotrebnu zauzetost između projekata i dugo
se držati dok čeka druge row lockove. Per-project/per-object lockovi i backoff
su moguća buduća poboljšanja, ali zahtijevaju zaseban dizajn i concurrency test.

## Pripremljeni SQL

APPLY mijenja samo jedan literal `errcode = '40001'` u `errcode = 'PT503'`.
Zahtijeva točno pregledano tijelo, postgres, SECURITY INVOKER, prazni search_path,
plpgsql, void/no-args i postgres-only ACL bez klijentskog EXECUTE.

- Baseline LF MD5: `fcce7d0ec0683658afb9e435b42bcb83`.
- Kandidat LF MD5: `167fc0624f3dbedbe6d4c90096e8dffc`.
- Kandidat whitespace-normalized MD5: `ce788c356d49b93f9f573f384b9952dd`.
- BEGIN/COMMIT, lock_timeout 5s, statement_timeout 15s.
- Točno jedan ciljani literal; ista pg_proc metadata/ACL nakon zamjene.
- Nema promjene lock funkcije/ključa, grantova, poslovnih tablica ili povijesti.

VERIFY je catalog-only read-only PASS/FAIL; ne poziva storage_lock ni RPC.
AUDIT_LOCK_READ_ONLY prikazuje gate holder metadata i izravne pozivatelje,
bez query teksta, parametara, stjecanja locka ili zaustavljanja procesa.
Prazan lock snapshot nije dokaz ponašanja pri konkurenciji.

## Ručna primjena nakon pregleda

1. Pregledaj ovu analizu i SQL; deployaj kompatibilno PT503 logiranje.
2. Potvrdi Dashboard DEV project ref `gdrwvoryapkgnfeislps`. Body guard ne
   dokazuje identitet projekta. Zaustavi Storage zahtjeve i concurrent DDL
   tijekom primjene; cleanup raspored ostaje pod korisnikovom kontrolom.
3. Opcionalno izvrši cijeli AUDIT_LOCK_READ_ONLY.sql radi snapshot inventara.
4. Kao postgres izvrši CIJELI APPLY.sql jednom. Na grešku zasebno ROLLBACK,
   pregled stanja i razloga; ne uklanjaj guard niti ponavljaj staru instalaciju.
5. Izvrši CIJELI VERIFY_READ_ONLY.sql. Očekuj storage_lock_hotfix_verified=true
   i storage_busy_sqlstate=PT503. Ponovni APPLY namjerno odbija patched baseline.
6. Kanonska private.storage_lock.sql sada je usklađena s potvrđenim DEV stanjem
   PT503. Sačuvaj rezultat verifyja; APPLY ne ponavljaj.
7. Provjeri svježe logove; postojeće backend petlje nisu potvrđeno zaustavljene
   samo promjenom definicije. Nema termina/restarta u ovom paketu.

## Obvezne buduće TEST provjere

TEST ref: cwhuknuhvzahxfoljohk. Prvo pripremiti pregledane ovisnosti i potvrditi
ciljni projekt. Testovi uzimaju lockove/pozivaju funkcije; nisu read-only i ne
izvršavaju se automatski. Dvije SQL Editor kartice nisu same dokaz dvije sesije:
potrebno je potvrditi različite backend PID-ove i stvarnog holdera u pg_locks.

1. Slobodan gate: stjecanje i ponovni poziv iste transakcije uspiju.
2. Druga aktivna sesija drži (79314,1): storage_lock odmah vrati PT503.
3. Nakon COMMIT/ROLLBACK holdera sljedeći poziv uspije.
4. Preko TEST PostgREST-a: jedan PT503/HTTP503 odgovor, bez interne 40001 petlje;
   postojeći aplikacijski reserve/finalize retry ostaje ograničen na dva pokušaja.
5. Kontrolirani parent-lock/gate scenarij: nema čekanja na advisory gate;
   neuspjela SQL transakcija ne ostavi djelomične DB promjene.
6. Finalize/unlink/claim konkurencija: referencirana fotografija ne dobiva
   fizički DELETE claim; nested triggeri u istoj transakciji ne self-conflictaju.
7. ACK zauzetost nakon DELETE-a: provjeriti lease oporavak i idempotentnost.
8. Anon/authenticated ne mogu izravno pozivati privatni helper ni servisne RPC-ove.

Četiri Storage i tri guest hotfix lokalna testa, TypeScript i ciljani lint prolaze.
Gornji Cloud TEST scenariji nisu provedeni. Lokalni hash/mapper test ne dokazuje DB locking,
PostgREST runtime, throughput ni sigurnost fizičkog brisanja.

Izvori:
- [PostgreSQL 17 advisory locks](https://www.postgresql.org/docs/17/explicit-locking.html#ADVISORY-LOCKS)
- [PostgREST 14 custom errors](https://docs.postgrest.org/en/v14/references/errors.html)
- [Supabase: custom 40001 retries](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b)
