# Završni sigurnosni audit fotografija i storage lifecyclea

Datum: 2026-10-08. Opseg: aktualni application kod i aktualni Supabase SQL/ACL metapodaci za upload, registraciju, product veze, dokumente, uklanjanje i potpisani cleanup. Ovo zamjenjuje prethodni AUDIT.md i uspoređuje današnje stanje s početnim Bunny auditom.

## Zaključak

**Početni lanac authenticated registracije proizvoljne tuđe putanje → orphan cleanup → Bunny DELETE zatvoren je u pregledanom kodu i instaliranim SQL zaštitama.** Nisam pronašao aktualni client-dostupan ulaz koji prihvaća proizvoljan storage key i vodi do fizičkog brisanja.

To nije tvrdnja da su svi sigurnosni i operativni poslovi završeni. Prije javnog korištenja ostaju zaštita od masovnog javnog Photo Wall uploada, odluka/provedba privatnosti CDN pristupa i stvarni PostgreSQL concurrency testovi. Pending uploadi namjerno nisu potpuno automatizirano očišćeni.

## Kako je audit proveden

- Read-only Supabase MCP: pg_proc definicije/ACL, RLS policies, table i column efektivna prava, constraints, indexes, omogućeni triggeri, cron konfiguracija i tri posljednja HTTP statusa.
- Pregledano 27 funkcija: 18 storage/signing/document helpera, membership helper i pripadajući add/remove/document/delete_project RPC-i; dodatno is_project_owner.
- Svih 18 storage/signing/document funkcijskih tijela podudara se s definitions/ nakon whitespace normalizacije. Generator potvrđuje 42 save-only datoteke.
- Statična pretraga source stabla: Bunny PUT/DELETE pozivi, arbitrary-path registracija, directory cleanup, stari lib/upload importi i project deletion.
- Bez mutation RPC-a, SQL izmjena, Bunny PUT/DELETE, aktivacije scheduler-a, credential vrijednosti, korisničkih fotografija/kontakata/odgovora i queue headera.
- SQL metadata pretraga ne isključuje proizvoljni vanjski skript, dinamički SQL, administratorsku radnju ili spremljeni SQL Editor query izvan repozitorija.

## Što je iz početnog izvještaja riješeno

| Početni nalaz | Današnje stanje / dokaz |
| --- | --- |
| create_invitation_photo/create_digital_album_photo prihvaćaju arbitrary p_image_path | Obje funkcije odsutne iz aktualnog pg_proc. Nema src poziva ni generated deklaracija. |
| Bunny PUT prije invitation/album authorizationa | uploadProjectPhoto dohvaća auth user; reserve RPC provjerava membership/proizvod prije optimizacije i PUT-a. Project/key određuje DB. |
| Dva odvojena Photo Wall admin inserta | storage_finalize_upload registrira project_photos i product vezu u istoj transakciji. Photo Wall public/published provjerava pri reserve i finalize. |
| Podmetanje photo ID-a ili putanje | Browser daje cilj/file/description. UUID server randomUUID, canonical key DB. Photo insert trigger zahtijeva ledger ready i točno podudaranje ID/key/project/source. |
| Identity UPDATE može promijeniti putanju | storage_photo_guard odbija promjenu ID/project/path/source identiteta. Client role nemaju INSERT/UPDATE/DELETE nad photo tablicama. |
| Orphan cleanup briše putanju dobivenu iz proizvoljnog zapisa | Product unlink šalje samo photoId u requestProjectPhotoCleanup. Bunny worker koristi claim iz private ledgera uz runtime finalized:true i canonical ID/key provjeru. |
| Alias provjera samo po jednom photo_id | storage_has_references gradi sve IDs za ledger/project_photos/legacy istog normaliziranog keya, provjerava sve 3 product veze i oba dokumenta. |
| Reference ovise o project_photos retku | Ledger ID i legacy ID uključeni neovisno o postojanju picker retka. |
| Invitation unplacedPhotos nisu zaštićeni | Oba document helpera obuhvaćaju photos i unplacedPhotos; prazni null slotovi nisu reference. |
| Nova veza nakon odluke za brisanje | Link/document guardovi koriste storage gate, ledger state ready i projekt; deleting/quarantined/deleted reference odbijaju. |
| Premještanje association UPDATE-om | photo_id i parent ID immutable; premještanje samo unlink/link. |
| Save document / unlink race bez zajedničke zaštite | Document guard sudjeluje u storage gateu; link guard zaključava parent i ponovno provjerava aktualne reference. Gate fail-fast 40001 umjesto čekanja uz parent lockove. Stvarno konkurentno izvođenje još nije testirano. |
| Blind DELETE nakon registration timeouta | Jedan PUT; reserve/finalize retry jednom s istim UUID-em. Nejasan ishod ne uzrokuje kompenzacijski Bunny DELETE. |
| Nema durable retry nakon fizičkog brisanja / brisanja projekta | Ledger i jobs nemaju project FK. Claim/lease/finish; cron sweep i project-delete trigger. Konačni ACK provjerava stanje, token, expiry i reference. |
| Brisanje cijelih direktorija | Aktivnih directory DELETE servisa nema. Adapter prihvaća samo canonical file key. |
| deleteProjectWithStorage koristi snapshot proizvoljnih putanja | Sada poziva samo autorizirani delete_project; fizikalno brisanje ide kroz ledger/cron. |
| Arbitrary path validacija samo neprazan string | project_photos stari CHECK ostaje, ali INSERT guard + zaštićeni ledger su dokaz registracije. Sam CHECK/UNIQUE nije predstavljan kao vlasništvo. |
| Request payload na Vercelu dopušta 10 MiB | App limit sada 4 MiB; UI/server zajednički constants; invitation preflight, HR/EN. Next action body limit 4.25 MiB. Production boundary upload poslije deploya još treba provjeriti. |

## Današnji tokovi i datoteke

Sva tri upload adaptera pozivaju [uploadProjectPhoto](../../src/features/project-photos/storage/uploadProjectPhoto.ts): validate → auth/context → reserve → Sharp/WebP → jedan PUT → idempotentna finalize. Link putanje u ovom dokumentu odnose se na repo; application mapa je u [project-photos README](../../src/features/project-photos/README.md).

- Invitation adapter: src/features/invitations/repositories/photos/uploadInvitationPhoto.ts.
- Album adapter: src/features/digital-albums/repositories/photos/uploadDigitalAlbumPhoto.ts.
- Photo Wall adapter: src/features/photo-walls/repositories/photos/uploadPhotoWallPhoto.ts.
- Zajednički DB boundary: src/features/project-photos/storage/storageLifecycleRepository.ts; generated Args, runtime reservation/finalized/claim parsing. Nullable assertions samo na SQL nullable argumentima.
- Uklanjanje: removeInvitationPhoto/removeDigitalAlbumPhoto/deletePhotoWallPhoto koriste user Supabase client i auth/member RPC, zatim storage/requestProjectPhotoCleanup.ts.
- Fizički DELETE: jedini consumer storage/runStorageCleanup.ts → storage/bunny.ts. PUT jedini consumer uploadProjectPhoto.ts.
- Project deletion: src/features/projects/services/deleteProjectWithStorage.ts → delete_project owner check.
- HTTP route: src/app/api/internal/storage-cleanup/route.ts; server-only funkcije ostaju u featureu.

Nema aktivnog createPhotoWallPhoto dvostrukog inserta, buildFileName/getBunnyPath helpera, deleteEmpty direktorija ni legacy orphan path deletion. Pretraga tekstualnih SQL writer funkcija izvan storage_* nije našla dodatni project_photos writer; trigger je dodatna zaštita neovisno o imenu SQL ulaza.

## DB sigurnosne granice — potvrđeno live

| Područje | Stanje |
| --- | --- |
| public project_photos + 3 association tablice | RLS true. authenticated samo SELECT, member-based policies; anon bez SELECT/write; service_role ima administratorska prava. |
| 4 private storage tablice | RLS true, restrictive deny_clients ALL false/false. ACL samo postgres; anon/authenticated/service_role bez izravnog schema/table/column pristupa. |
| Novi public storage RPC-i (6) | SECURITY DEFINER, prazan search_path, EXECUTE service_role i owner; anon/authenticated false. |
| Private signer i storage helperi | Signer samo postgres EXECUTE; anon/authenticated/service_role false. Private helperi nisu client registration API. |
| Membership / add/remove/save | auth.uid obavezan; projekt iz proizvoda, member/owner helper. Client IDs nisu sami dokaz ovlasti. Product/photo same-project provjera i guardovi. |
| Constraints | Canonical key/UNIQUE/PK/state/kind/positive size; product FKs cascade; job FK na ledger; ledger nema project FK. |
| Triggeri | Svih 10 storage triggera uključeno na očekivanim tablicama. |
| Vault | secrets/decrypted_secrets: anon/authenticated bez USAGE/SELECT/column grantova. service_role read/delete administrativni pristup zadržan; ne uklanja se platform grant. Vault crypto helperi nisu izvršivi anon/auth. |
| PUBLIC grants | Relevantni table ACL-i nemaju PUBLIC; nema zasebnih column grantova za pregledane role. |

Service role je pouzdani server boundary. Reserve p_actor_id smije biti poslan samo tim boundaryjem: application ga uzima iz auth.getUser, ne iz browser inputa. Runtime upload schema strict; product adapteri ne prenose client actor/project/key. SQL ne tvrdi da PostgreSQL sam provjerava Bunny bytes: server potvrđuje uspješan PUT prije finalize.

## Potpisani cron — potvrđeno

- memora-storage-cleanup: active=true, */5 * * * *, postgres, command select private.enqueue_signed_storage_cleanup();.
- HMAC veže POST, fiksnu putanju, raw body bytes 7b7d, epoch timestamp, UUIDv4. Literal UTF-8 secret; method/path/body/time/id tampering odbijen.
- Window -120/+30 sekundi, i SQL consume i app. HTTP timeout 240s ne produljuje signature validity.
- Endpoint provjerava potpis pa jedinstveni nonce INSERT prije worker poziva. Expired request ostaje nevaljan i kad nonce housekeeping ukloni zapis. Nema Bearer fallbacka.
- Signer stavlja samo potpis/metadata u queue, ne ključ; ključ živi u Vaultu/Vercelu. Vrijednosti nisu čitane ovim auditom.
- pg_net queue i dalje dopušta anon/authenticated schema usage i headers SELECT kroz DB kontekst. Potpis ne otkriva ključ, ali queue reader može pokušati prvi replay / DoS. Nonce dopušta jedan prihvaćeni pokušaj, ne jamči da će legitimate delivery pobijediti.
- Data API public/graphql_public exposure potvrđen ranijim screenshotom, ne današnjim Management API dohvatom. net/vault/private ne izlagati. DB privileges i Data API dostupnost su odvojeni.
- Posljednja tri HTTP rezultata: id16/17/18, 200, timed_out=false, 12:25/12:30/12:35 UTC (14:25/14:30/14:35 Zagreb). Tijela/headers nisu čitana. Ranije operater potvrdio completed1, deleted/done i odsutnost Bunny objekta.

## Preostali nalazi po prioritetu

### P1 — prije javnog Photo Wall prometa: abuse i kvote

Javni upload namjerno ne zahtijeva login, ali u pregledanom toku nema rate limita, CAPTCHA, ukupne project/wall kvote ni admission limita paralelnih rezervacija. Osoba s publicId može slati niz dozvoljenih datoteka, stvarati storage/CPU trošak ili pending redove s nevaljanim sadržajem. 4 MiB/file i max10 UI nisu ukupna zaštita; direktan server action može zaobići UI broj. Hosted WAF pravila nisu provjerena.

Najmanja dorada: server-side admission/rate control prije reserve, projektna kvota/rezervacije u DB, po potrebi public abuse challenge, eksplicitni resource/pixel limiti obrade. Ne oslanjati se na file MIME ili UI kao ukupnu zaštitu. Plan: [PACKAGE_LIMITS.md](PACKAGE_LIMITS.md).

### P1 ako obećavaš privatne albume — CDN autorizacija

getProjectPhotoUrl vraća unsigned CDN URL. RLS ne autorizira HTTP GET na Bunnyju. Aktualne zone/token-auth/TTL konfiguracije nisu dohvaćene pa ne tvrdim da je javni GET svakog objekta uspješno testiran. U aplikaciji nema per-user short-lived CDN potpisa. Ako su fotografije namjerno javne po linku, to treba opisati proizvodom; ako su privatne, ovo je nedovršena zaštita.

Najmanja dorada za private content: pravo provjeriti na serveru pa izdati kratkotrajni potpisani URL; konfigurirati Bunny token authentication prema službenom protokolu. Povlačenje objave samo po sebi ne invalidira već podijeljenu statičnu fotografsku adresu. [Bunny službeni token auth](https://github.com/BunnyWay/BunnyCDN.TokenAuthentication).

### P2 — brisanje origin objekta nije isto što i trenutni nestanak CDN cachea

Bunny adapter radi Storage DELETE, bez eksplicitnog cache purgea. deleted/done znači uspješni Storage DELETE/404 i SQL ACK; ne dokazuje da sve edge/browser kopije nestaju odmah. Ako treba trenutno povlačenje pristupa, definirati token TTL/cache/purge pravilo i testirati CDN ponašanje. Bunny konfiguracija nije čitana. [Bunny cache FAQ](https://bunny.net/faq/).

### P2 — nejasni/pending uploadi zadržavaju se za pregled

To zatvara unsafe late-PUT delete, ali ne rješava automatski orphan trošak. Pending nije sweepan za fizičko brisanje u finalized-only claimu. Rezervacija je prije decodea, pa decode/PUT/finalize failure može ostaviti pending. Definirati operator pregled/reconciliation i sigurno otkazivanje prije PUT-a; nema dokaza da HTTP abort sigurno zaustavlja udaljeni PUT.

### P2 — nema production rollback/concurrency dokaza

SQL statički sadrži gate i state guards; stvarni izolirani save/delete, add/claim, cascade projekta, concurrent nonce, stale lease/quarantine i retry testovi nisu izvršeni. Dosadašnji mock testovi i obični UI uspjesi to ne potvrđuju.

### P2 — observability i retry UX

Cleanup route vraća generički 500 bez stage/code loga; dobro skriva interne podatke, ali usporava dijagnostiku. Dodati sanitizirani stage + error code bez secreta/headera/putanje. Fail-fast storage gate 40001 može uzrokovati prolaznu grešku; request/finalize retry je jedan immediate retry, ostali add/remove/save nemaju ovim auditom potvrđen jedinstveni backoff. Novi browser upload zahtjev dobiva novi UUID: idempotentnost finalize retrya ne znači globalnu idempotentnost poslije izgubljenog UI odgovora.

### Operativno — batch i backlog

Endpoint obrađuje do 3 zadatka po terminu, cron svakih 5 min: nominalno do 36/h bez dodatnih poziva. To nije sigurnosni bypass; kod masovnog brisanja pratiti backlog i tek nakon mjerenja prilagoditi batch/time budget. HTTP200 completed0 nije dokaz da nema quarantined/legacy blokade; monitor mora pratiti ledger/jobs stanja.

## Granice svih zaključaka

- Nema stvarnog pokušaja registracije tuđe putanje ni brisanja tuđeg objekta ovim auditom. Zaključak zatvorenog lanca temelji se na uklonjenim ulazima, ACL/triggerima i application data flowu.
- Vanjski administratori/skripte sa server ključem ili postgres ovlastima ostaju trust boundary; ne mogu se ograničiti ovim client ACL-om.
- Nema live provjere Bunny token settings, backupa, replikacije, cachea, hosted environment vrijednosti, WAF-a ni deployed git commita. Lokalni kod nije automatski dokaz iste production verzije.
- Neovisni backup i responsive thumbnails/performance mjerenje još nisu dokazani. To nisu ponovni arbitrary-path propusti.
- Prethodni regex nalaz je povučen: izravno prosrc testiranje oba regexa daje 1 backslash, canonical true i traversal false. SQL023 nije potreban. JSON escaping ne tretirati kao stvarni SQL znak.

## Provedene provjere

| Provjera | Rezultat / ograničenje |
| --- | --- |
| Današnji full TypeScript | PASS |
| Današnji ciljani server/photo ESLint | PASS |
| 42 definitions generator check | PASS |
| Live usporedba 18 function bodies | PASS, whitespace-normalized |
| Production build poslije 4 MiB promjene | PASS u prethodnom koraku ove sesije; nije ponovno deployano ovim auditom |
| 4 MiB boundary + MIME + HR/EN | PASS u prethodnom koraku |
| 15 mock storage/security testova | PASS ranije u sesiji; privremeni harness uklonjen, trajni test obrisao operater |
| Stvarni PostgreSQL concurrency/cascade/lease testovi | NOT EXECUTED |
| Novi 4 MiB boundary upload na produkciji | NOT TESTED |
| Bunny/CDN privacy ili cache purge integracija | NOT TESTED |

## Najmanji sljedeći plan

1. Potvrditi deploy aktualnog koda i kontrolirani 4 MiB/beyond-limit UI test na Vercelu.
2. Prije javnog Photo Walla uvesti abuse/admission + quota zaštitu.
3. Odlučiti javna vs privatna media politika; private URL autorizacija i cache revocation zasebno implementirati ako je zahtjev.
4. U izoliranoj PostgreSQL bazi izvršiti navedene race/cascade/lease scenarije.
5. Dodati sanitizirani cleanup stage monitoring i dokumentirani pending review/backlog postupak.

Ne treba ponovno izvršavati instalaciju ni mijenjati postojeće grants radi ovog izvještaja. Originalni ownership/registration/DELETE nalaz je popravljen; cijeli sustav se ne proglašava bezuvjetno završenim dok navedene granice nisu riješene.

## Usklađena dokumentacija

Pregled admin.ts potvrdio je da ovaj projekt koristi **SUPABASE_SECRET_KEY**, ne SUPABASE_SERVICE_ROLE_KEY kao naziv environment varijable. To je ispravljeno u project-photos README i GO_LIVE; nema potrebe mijenjati ispravnu runtime varijablu. Ključ je server-only i daje service_role DB kontekst.

[Storage održavanje](README.md) · [Prije puštanja](GO_LIVE.md) · [Application mapa](../../src/features/project-photos/README.md)

Rješavao bih dio sada, a dio prije javnog puštanja. Ne treba ponovno raditi cijeli storage sustav — osnovni upload i cleanup već rade.
Posao	Okvirna procjena	Kada
Provjera production uploada do 4 MiB i odbijanja većeg	1–2 sata	Sada
Sanitizirani logovi + upute za pending/backlog	Pola dana	Sada, radi lakšeg održavanja
Photo Wall rate limit + osnovna DB kvota	1–3 dana	Prije javnog puštanja
PostgreSQL testovi konkurentnosti i retryja	1–2 dana	Prije javnog puštanja
Privatni Bunny URL-ovi, ako želiš privatne fotografije	1–3 dana	Prije obećanja privatnosti korisnicima
CDN purge pri brisanju	Pola do jednog dana	Ako treba trenutno uklanjanje s CDN-a
## Naknadna dorada: operativni logovi

Dodani su sanitizirani authorize/claim/delete/acknowledge logovi i complete brojači, bez originalne poruke greške ili identifikatora. Upute za pending/backlog su u [OPERATIONS.md](OPERATIONS.md); monitor dodaje read-only pregled pending uploada i expired leases. Ova dorada zahtijeva application deploy. Production boundary upload ostaje nepotvrđen; SQL i Bunny nisu mijenjani.
