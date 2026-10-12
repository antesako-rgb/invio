# Hotfix: delete_invitation_guest poslovni konflikt

Status: korisnik je ručno primijenio na DEV-u i dostavio uspješan verify.
Naknadni read-only katalog potvrđuje očekivani hash i sigurnosne postavke.
Nije potvrđeno runtime/HTTP ponašanje ni konkurentni scenarij. TEST nije provjeren.
Read-only DEV pregled: 2026-10-12. Projekt: `gdrwvoryapkgnfeislps`.
`private.storage_lock()` ostaje nepromijenjen i zaseban otvoreni rizik.

## Nalaz i minimalna izmjena

`public.delete_invitation_guest(uuid)` prvo pročita `project_id`, `invitation_id`
i `recipient_id`, provjeri prijavu/članstvo, zaključa projekt i primatelja,
zatim ponovno pročita i zaključa gosta. Ako je bilo koja od te tri poveznice
promijenjena, prekida prije svojih DELETE naredbi s porukom:
`Gost je u međuvremenu promijenjen. Pokušajte ponovno.`

To je poslovni konflikt promijenjenog cilja brisanja. Nije PostgreSQL-om
detektirana serialization failure. Promjena imena/notes sama ne pokreće ovu
granu; nestali gost zasebno vraća `P0002`.

Jedina SQL izmjena:

```sql
-- prije
using errcode = '40001';
-- poslije
using errcode = 'PT409';
```

Poruka, autentikacija, članstvo, zaključavanja, DELETE/cascade ponašanje,
održavanje glavnog gosta, potpis, povratni UUID i ACL ostaju isti.
PostgREST prevodi PT409 u HTTP 409; Server Action vraća aplikacijski
`CONFLICT`, a ne obećanje da njegov vlastiti HTTP odgovor ima status 409.

## Pozivatelji i frontend

Put zahtjeva:
`InvitationGuests.remove` → `deleteInvitationGuestAction` →
`mutateInvitationGuests.deleteInvitationGuest` → RPC.

Read-only pretraga drugih aplikacijskih funkcijskih tijela nije pronašla
izravne SQL pozivatelje. To nije potpuni SQL parser niti dokaz o vanjskim
klijentima ili dinamičkom SQL-u.

Repository poziva RPC jednom i prosljeđuje pogrešku. Server Action je mapira
preko `invitationGuestError`. UI prikazuje prevedenu `Common.errors.CONFLICT`
poruku, zadržava dijalog, oslobađa busy lock i ne ponavlja zahtjev automatski.
Korisnik mora ponovno učitati popis prije novog pokušaja brisanja.
Mapper sada prepoznaje PT409 i, za prijelaz, stari 40001 isključivo uz točnu
poruku ove grane. Nepovezani Storage 40001 nije time klasificiran kao ovaj konflikt.

## Zaštite SQL datoteka

- Transakcija; `lock_timeout=5s`, `statement_timeout=15s`.
- Zahtijeva `postgres`, postojeći potpis i točno pregledano tijelo.
- Hash normalizira samo CRLF/LF; ostali razmaci i sadržaj su bitni.
- Baseline LF MD5: `7f3ed7d65b2d17a05e46e8c0a64a1e13`.
- Kandidat LF MD5: `75ca837ef7cd32a89d895ae474d0cd1a`.
- Točno jedan literal `errcode = '40001'`, bez postojećeg PT409.
- Provjerava vlasnika, SECURITY DEFINER, prazni search_path, jezik,
  rezultat, argument i ACL: postgres + authenticated EXECUTE,
  bez PUBLIC/anon/service_role EXECUTE.
- Nakon zamjene zahtijeva točno očekivano tijelo i jednaku cijelu pg_proc
  metapodatkovnu sliku osim `prosrc`; neočekivana promjena prekida transakciju.
- Nema GRANT/REVOKE, pozivanja gost RPC-a ni promjene migracijske povijesti.

MD5 ovdje služi usporedbi pregledanog kataloškog sadržaja, ne autentikaciji.
Nemoj istodobno mijenjati definiciju funkcije iz druge sesije.

## Ručni postupak

1. Pregledaj SQL i frontend diff; primijeni/deployaj kompatibilnu server obradu.
2. U Dashboard URL-u potvrdi DEV project ref `gdrwvoryapkgnfeislps`.
   Definicijski guard ne dokazuje identitet Supabase projekta.
3. Zatvori guest editore / zaustavi guest mutacije i druge izmjene funkcije.
4. Kao `postgres` izvrši CIJELI `APPLY.sql`, jednom. Ne pokreći samo DO blok.
5. Na grešku izvrši zasebno `ROLLBACK;`, pregledaj razlog i stanje. Ne uklanjaj
   guard, ne ponavljaj stare instalacije. Lock timeout nije potvrda primjene.
6. Izvrši CIJELI `VERIFY_READ_ONLY.sql`. Očekuj
   `delete_invitation_guest_hotfix_verified=true` i `business_conflict_sqlstate=PT409`.
7. Sačuvaj rezultat, project ref i datum. Kanonska definicija
   `docs/seating/definitions/invitation_guests/public.delete_invitation_guest.sql`
   sada je usklađena s potvrđenim DEV stanjem PT409. APPLY ne ponavljaj.
8. Provjeri svježe logove. Ako postoji ranija petlja, ovaj patch ne dokazuje
   njezin prestanak; identifikacija procesa i eventualno zaustavljanje zahtijevaju
   zaseban pregled i izričito odobrenje. Ovaj paket ne zaustavlja procese.

Ponovno izvršavanje APPLY-a nakon uspjeha namjerno pada na baseline guardu;
koristi VERIFY umjesto ponavljanja. DB tipove ne treba regenerirati.

## Provjere i ograničenja

Tri lokalna testa, TypeScript (`--noEmit --incremental false`) i ciljani ESLint prolaze.
Lokalni testovi provjeravaju hash kandidata, opseg zamjene, SQL zaštite i
mapper konflikta. Nisu zamjena za izvršavanje SQL-a na PostgreSQL-u.
Runtime/HTTP i konkurentni scenarij nisu izvršeni. Budući ručni TEST scenarij
treba potvrditi uspješno brisanje, očuvanu autorizaciju, održavanje primarnog
gosta te promjenu recipienta između početnog čitanja i zaključavanja: jedan
konflikt, bez brisanja u neuspjeloj transakciji i bez automatskog retrya.
Bez reprezentativnih TEST ovisnosti i kontrolirane konkurencije ova grana
ne može se pouzdano provjeriti običnim klikom u praznoj bazi.

Izvori:
- [Supabase: custom 40001 i beskonačni retry](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b)
- [PostgREST 14: custom errors](https://docs.postgrest.org/en/v14/references/errors.html)
