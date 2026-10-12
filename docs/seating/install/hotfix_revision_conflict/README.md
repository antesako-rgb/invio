# Hitan ispravak konflikta revizije

Pripremljeno 12. 10. 2026. Udaljena DEV baza pregledana je isključivo read-only.
Nijedna skripta za promjenu baze ili zaustavljanje procesa nije izvršena.

## Nalaz i opseg

PostgREST 14 može interno ponavljati transakciju nakon `40001`. Poslovni konflikt
sa zastarjelom revizijom ne nestaje ponavljanjem istih argumenata.
[Supabase: službeno objašnjenje i postupak](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b).

Read-only pregled aplikacijskih funkcija, uključujući triggere u `public` i
`private`, pronašao je tri eksplicitna `40001`:

| Funkcija | Uzrok | Ovaj ispravak |
| --- | --- | --- |
| `private.lock_seating_plan(uuid,bigint)` | Poslovni konflikt revizije | Samo `40001` → `PT409` |
| `public.delete_invitation_guest(uuid)` | Gost/promatrana pripadnost promijenjena između čitanja | Nije mijenjana; pripremiti zaseban minimalni konfliktni ispravak |
| `private.storage_lock()` | Neuspješan `pg_try_advisory_xact_lock` | Nije mijenjana; zasebno definirati kod zauzetosti i ograničeni retry/backoff |

Nisu pronađeni eksplicitni `40P01`, `55P03`, `57014`, imenovani
`serialization_failure`/`deadlock_detected` ni dinamički `ERRCODE` u tim shemama.
To je pregled izvora funkcija, ne dokaz da PostgreSQL ili vanjski proces nikada
ne mogu proizvesti stvaran deadlock, serialization failure ili timeout.
Upravljačke Supabase sheme i kod drugih klijenata nisu uključeni u ovaj patch.
Druga dva `40001` ostaju rizik: ovaj patch ne znači da je cijela baza oslobođena
retry rizika. Nemoj pokretati njihove konfliktne scenarije radi provjere.

## Zahvaćeni pozivatelji

Izravni javni RPC-ovi: `manage_seating_plan`, `manage_seating_table`,
`manage_seating_participant`, `assign_seating_guests`,
`assign_seating_guests_to_seats`, `include_generic_seating_guest`,
`sync_seating_rsvp_guests`.

Privatni izravni pozivatelj: `private.assign_seating_guest_internal`.
Preko njega su zahvaćeni `assign_seating_guest` i `assign_seating_guest_to_seat`.
Standardizacija dimenzija koristi postojeći `manage_seating_table` RPC.

Javni pozivatelji dopuštaju `authenticated`, a ne `anon` ili `service_role`.
Privatni helper nema EXECUTE za te uloge. Helper provjerava projekt kroz
`lock_seating_project`; vlasnik `postgres`, SECURITY DEFINER i prazni search_path
ostaju isti. Nema promjene autorizacije, potpisa, grantova, zaključavanja, gostiju,
dodjela ili povećavanja revizije. `CREATE OR REPLACE` zadržava isti OID.

Server actions koriste zajednički `seatingError.ts`: sada prepoznaje `PT409` kao
`REVISION_CONFLICT`, uz kompatibilnost sa starim `40001` tijekom prijelaza.
`SeatingWorkspace` blokira sljedeće upise nakon konflikta i traži ponovno
učitavanje; actions ne ponavljaju mutaciju. RSVP hook nema intervalni polling,
nego reagira na otvaranje, eksplicitni refresh i povratak u editor.

## Konkretna SQL promjena

Jedina razlika u tijelu funkcije:

```sql
raise exception 'Revision conflict' using errcode='PT409';
```

`APPLY.sql` izvlači postojeću definiciju iz kataloga i zamjenjuje samo taj literal.
Prije toga provjerava pregledani hash, vlasnika, jezik, tip rezultata, SECURITY
DEFINER, search_path i ACL. Nakon zamjene provjerava točan novi izvor i jednakost
ostalih metapodataka. Ne mijenja ostale funkcije. Sve je u jednoj transakciji.

## Redoslijed ručne primjene

1. Pregledaj datoteke. Primijeni/deployaj kompatibilnu server obradu `PT409` iz
   lokalnog koda prije promjene SQL-a. Zatvori seating editore i zaustavi nove
   seating zahtjeve dok traje zahvat; zatvaranje browsera nije dokaz da je
   postojeća backend petlja prestala.
2. Pokreni **`AUDIT_CURRENT_READ_ONLY.sql`** i
   **`IDENTIFY_PROCESSES_READ_ONLY.sql`**. U svježim Postgres logovima za ponovljeni
   `40001 / Revision conflict` pronađi `process_id`; usporedi ga s `pid` i
   `user_name=authenticator`. Kandidati iz SELECT-a sami nisu dokaz petlje.
3. Kao **postgres**, jednom izvrši **cijeli `APPLY.sql`**. Na grešku zasebno
   izvrši `ROLLBACK;` i pregledaj uzrok. Ne uklanjaj baseline/security guardove.
   Ako je već primijenjeno, APPLY se namjerno zaustavlja: pokreni VERIFY.
4. Pokreni **cijeli `VERIFY_READ_ONLY.sql`**. Prvi rezultat mora biti
   `revision_conflict_hotfix_verified=true`, `business_conflict_sqlstate=PT409`.
   Drugi rezultat navodi preostala dva rizika; to nije neuspjeh ovog patcha.
5. Ponovno pokreni identifikaciju. Samo za proces potvrđen svježim logovima
   popuni PID, `backend_start`, `query_start` i `query_fingerprint` u zasebnoj
   **`TERMINATE_CONFIRMED_PROCESS_MANUAL.sql`**. Ručno pregledaj pa izvrši samo tu
   ciljanu naredbu. NULL predložak sam ne radi ništa. Nula redova znači da proces
   nije zaustavljen: ponovno identificiraj; ne širi uvjete.
6. Ako APPLY zapne na lock timeoutu, izvrši `ROLLBACK;`, ponovno identificiraj
   i samo nakon potvrde zaustavi ciljanu petlju, pa ponovi APPLY i VERIFY.
7. Provjeri da u NOVIM logovima više nema ponavljanja iste seating greške.
   Dvaput pokreni read-only statistiku i usporedi rast rollbackova; kumulativni
   brojač se ne vraća na nulu. Ostali procesi mogu proizvesti legitimne rollbackove.
   Ne zaustavljaj sve `authenticator` veze i ne restartaj projekt.
8. Otvori editor i učitaj aktualni plan. Kontrolirani stale-revision RPC test je
   mutacija/zaključavanje, čak i kada se očekuje odbijanje: tek uz zasebno odobrenje,
   najbolje na Cloud TEST projektu. Očekuje se jedan HTTP 409 s `PT409`, bez retrya,
   bez promjene revizije/dodjela. Taj runtime scenarij nije izvršen.

Postojeća zaglavljena transakcija može zadržati raniji izvršni plan; promjena
funkcije sama nije dokaz da je petlja zaustavljena. Naredba za zaustavljanje
prekida vezu i rollbacka njenu otvorenu transakciju. Identitetski guardovi smanjuju
rizik recikliranog PID-a, ali promatranje i signal nisu potpuno atomski.

## Definicije, povijest i provjere

Kanonska lokalna definicija `definitions/seating_plans/private.lock_seating_plan.sql`
usklađena je s predloženim patchom. Stare instalacijske skripte 001–008 i
empty-model preflightovi nisu prepisani niti im je popuštena provjera izvornog
hasha. Oni očekuju stari baseline i nakon ovog patcha mogu namjerno odbiti
izvršavanje. **Ne ponavljaj stare instalacije na postojećoj bazi.** Za budući novi
baseline treba uključiti ovaj patch u redoslijed i zasebno uskladiti njegove
preflightove; taj posao nije dio hitnog zahvata.

Verify je strukturna PASS/FAIL provjera točnog pregledanog tijela i sigurnosti.
Ne poziva helper koji zaključava redove. Read-only provjera zato ne potvrđuje
ponašanje HTTP sloja niti status postojećih procesa.

Lokalni testovi provjeravaju minimalnu razliku prema stvarno očitanom starom
hashu, zaštite skripti, `PT409` obradu i odsutnost client retrya. SQL APPLY nije
izvršen ni na DEV ni na TEST bazi; PostgreSQL runtime provjera čeka ručnu primjenu.
