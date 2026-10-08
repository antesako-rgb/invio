# Storage — sve što trebaš

Storage je instaliran; automatski cleanup radi svakih 5 minuta. **Nema instalacije koju sada trebaš ponavljati.**

Prije javnog puštanja pročitaj [GO_LIVE.md](GO_LIVE.md): postojeće okruženje, nova domena i odvajanje testiranja.

Buduće limite paketa opisuje [PACKAGE_LIMITS.md](PACKAGE_LIMITS.md) — prijedlog, nije implementirano.

Budući video tok opisuje [VIDEO_PLAN.md](VIDEO_PLAN.md) — samo plan, nije implementirano.

## Tri foldera

| Folder | Kada ga otvaram |
| --- | --- |
| definitions/ | Želim vidjeti aktualni SQL ili ga spremiti po folderima u Supabase SQL Editor. Samo Save, ne Run. |
| operations/ | Želim provjeriti rad ili namjerno zaustaviti/nastaviti cleanup. |
| install/ | Povijest već izvršenog SQL-a. Ne izvršavati ponovno. Tehnički generator je u install/tools/. |

## Želim samo provjeriti radi li

Otvori **operations/monitor.sql**, kopiraj SELECT u SQL Editor i izvrši. Cron succeeded + novi HTTP 200 potvrđuju obradu; pending/leased/done opisuju zadatke. To je tvoja uobičajena provjera.

## Želim zaustaviti cleanup

Otvori **operations/pause_resume_manual.sql** i izvrši SAMO naredbu za pauziranje. Ne izvršavaj cijeli file: sadrži i ponovno uključivanje. Već poslani zahtjevi nisu time otkazani. **emergency_freeze_manual.sql** je jači hitni stop koji zaustavlja i upload RPC-e; nije dnevna provjera.

Ostali operations/verify_*.sql su dodatne read-only provjere za dijagnostiku. Ne moraš ih svakodnevno izvršavati.

[Završni audit i ograničenja](AUDIT.md). SQL/Bunny/hosted postavke nisu mijenjane ovom organizacijom.

---

# Detaljan popis za SQL Editor

Status 2026-10-08: instalacija 001–018, uklanjanje starih RPC-a i SQL020/021/022 primijenjeni prema potvrdi operatera. Vercel cleanup uključen; memora-storage-cleanup aktivan svakih 5 minuta. Ne ponavljaj instalaciju.

## Što spremam u Supabase SQL Editor

Kopiraj sadržaj datoteka iz definitions/ u istoimene foldere/queryje. To su definicije za pregled, NE naredbe za ponovno izvršavanje. Zamijeni sadržaj već spremljenih queryja i pritisni Save, ne Run. SQL Editor nema naš automatski read-only zaštitni mehanizam: CREATE/REVOKE se može izvršiti ako pritisneš Run.

Posebno zamijeni storage_lifecycle/public.storage_claim_cleanup.sql verzijom SQL022 (v_result i o.result). Ne koristi tijelo iz SQL020 ili početnog installa kao aktualnu definiciju.

| Folder u SQL Editoru | Query / datoteka |
| --- | --- |
| digital_albums | private.digital_album_document_photo_ids.sql |
| `cron` | `job.sql` |
| `digital_albums` | `trigger.sql` |
| `digital_album_photos` | `trigger.sql` |
| `invitation` | `private.invitation_document_photo_ids.sql` |
| `invitations` | `trigger.sql` |
| `invitation_photos` | `trigger.sql` |
| `photo_wall_photos` | `trigger.sql` |
| `projects` | `trigger.sql` |
| `project_photos` | `trigger.sql` |
| `storage_cleanup_jobs` | `grants.sql` |
| `storage_cleanup_jobs` | `index.sql` |
| `storage_cleanup_jobs` | `rls.sql` |
| `storage_cleanup_jobs` | `table.sql` |
| `storage_cleanup_request_ids` | `grants.sql` |
| `storage_cleanup_request_ids` | `rls.sql` |
| `storage_cleanup_request_ids` | `table.sql` |
| `storage_legacy_review` | `grants.sql` |
| `storage_legacy_review` | `rls.sql` |
| `storage_legacy_review` | `table.sql` |
| `storage_lifecycle` | `grants.sql` |
| `storage_lifecycle` | `private.enqueue_signed_storage_cleanup.sql` |
| `storage_lifecycle` | `private.storage_document_guard.sql` |
| `storage_lifecycle` | `private.storage_has_references.sql` |
| `storage_lifecycle` | `private.storage_key_alias.sql` |
| `storage_lifecycle` | `private.storage_link_guard.sql` |
| `storage_lifecycle` | `private.storage_lock.sql` |
| `storage_lifecycle` | `private.storage_photo_guard.sql` |
| `storage_lifecycle` | `private.storage_project_deleted.sql` |
| `storage_lifecycle` | `private.storage_queue.sql` |
| `storage_lifecycle` | `private.storage_unlinked.sql` |
| `storage_lifecycle` | `public.storage_claim_cleanup.sql` |
| `storage_lifecycle` | `public.storage_consume_cleanup_request.sql` |
| `storage_lifecycle` | `public.storage_finalize_upload.sql` |
| `storage_lifecycle` | `public.storage_finish_cleanup.sql` |
| `storage_lifecycle` | `public.storage_request_cleanup.sql` |
| `storage_lifecycle` | `public.storage_reserve_upload.sql` |
| `storage_lifecycle` | `signed_request_grants.sql` |
| `storage_objects` | `grants.sql` |
| `storage_objects` | `index.sql` |
| `storage_objects` | `rls.sql` |
| `storage_objects` | `table.sql` |

Tablice imaju table s constraintima, odvojene index/rls/grants gdje postoje. Triggeri se spremaju pod roditeljskom tablicom; njihove funkcije pod storage_lifecycle. Prazne trigger/index datoteke nisu stvorene. Definicije postojećih proizvoda izvan ovog paketa ne zamjenjuj ovim djelomičnim storage dodatkom.

## Cron i operativno održavanje

- cron/job.sql: opis stvarno potvrđenog rasporeda i SELECT za pregled; ne stvara novi job.
- operations/monitor.sql: spremi u SQL Editor kao cron/monitor. Može se izvršavati; samo metapodaci i stanja. Cron succeeded znači enqueue; provjeri i HTTP 200.
- operations/verify_signed_rights.sql: spremi kao storage_lifecycle/verify_signed_rights. Ne čita vrijednosti secreta.
- operations/verify_installation.sql i operations/verify_finalized_cleanup.sql: spremi kao storage_lifecycle/verify i verify_finalized.
- operations/pause_resume_manual.sql: spremi kao cron/pause_resume. NIJE READ ONLY: označi samo naredbu za pause ILI resume, nikad cijelu datoteku.
- operations/emergency_freeze_manual.sql: hitno zaustavljanje storage RPC-a, nije instalacija ni uobičajena provjera; prvo pauziraj cron. Ne vraća obrisane Bunny datoteke.

Vault naziv memora_storage_cleanup_secret i Vercel varijabla STORAGE_CLEANUP_SECRET imaju istu vrijednost. Secret ne spremaj u SQL Editor, kod ili ovaj paket. Signer postgres-only; consume RPC service_role-only. Administratorski service_role Vault pristup namjerno je zadržan.

## Što koja tablica radi

| Objekt | Odgovornost |
| --- | --- |
| storage_objects | Vlasništvo canonical keya i lifecycle; ostaje nakon brisanja projekta. |
| storage_cleanup_jobs | Red brisanja, retry i lease; pending → leased → done. |
| storage_cleanup_request_ids | Atomska zaštita od ponavljanja potpisanog zahtjeva. |
| storage_legacy_review | Arhiva nepouzdanih starih putanja; nikad autorizacija Bunny brisanja. |

Automatski se brišu samo finalizirani nekorišteni objekti. Pending/nejasni uploadi ostaju za pregled. Alias/reference/legacy nejasnoće mogu spriječiti cleanup. Ne briši ledger/nonce/job retke radi čišćenja baze. Lease traje sat vremena; izgubljena potvrda može ostaviti leased do idućeg pokušaja.

## Sutra želim nešto promijeniti

1. Izreci željeno ponašanje; pronađi aktualnu funkciju u definitions/.
2. Pripremi NOVU numeriranu maintenance migraciju s transakcijom i provjerom grants; ne prepisuj povijest.
3. Pregled/test, zatim ručna primjena. Za lifecycle promjene prvo pauziraj cron i razmotri upload promet.
4. Uskladi definitions/, generated types ako se potpis promijenio, aplikaciju i ovaj status.
5. U SQL Editoru zamijeni spremljenu definiciju bez ponovnog Run.

## Što je povijest

install/001–018, install/archive/019, install/maintenance/020–022 i install/archive/scheduler/001–002 su PRIMIJENJENA POVIJEST, NE ponavljati. Sačuvani su radi rekonstrukcije i ovisnosti aplikacijskih mock testova. Maintenance nije dnevni posao: to je povijest ručnih dorada.

## Ograničenje završnog audita

MCP read-only catalog audit uspješno dovršen 2026-10-08. Funkcijska tijela usklađena s bazom, album helper dopunjen iz live kataloga. Izravna prosrc provjera potvrdila je da oba queue regexa rade; raniji nalaz bio je JSON escaping artefakt. SQL ispravak nije potreban. Detalji i neprovjereni concurrency/cascade slučajevi: AUDIT.md.

Za pending, leased, backlog i sanitizirane Vercel logove: [OPERATIONS.md](OPERATIONS.md).
