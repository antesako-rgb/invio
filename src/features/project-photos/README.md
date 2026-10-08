# Fotografije: upload, prikaz i cleanup

Sve zajedničko sada je u **src/features/project-photos/**. lib/upload i zasebni photo-upload feature više ne postoje. Product adapteri ostaju uz invitation/digital-album/photo-wall zato što vraćaju njihove tipove i koriste njihove ovlasti/UI.

## Gdje sutra tražim promjenu

| Želim mijenjati | Datoteka ili folder ovdje |
| --- | --- |
| Zajednički dijalog, izbor i preview fotografija | upload/components/ i upload/utils/createPhotoPreview.ts |
| Dopuštene formate, veličinu i broj odabranih datoteka | upload/constants/photoUpload.constants.ts |
| Serversku provjeru datoteke | storage/validateImage.ts — koristi iste formate i veličinu kao UI |
| Rezervaciju, upload i finalizaciju | storage/uploadProjectPhoto.ts |
| WebP obradu, kvalitetu i resize | storage/optimizeImage.ts; parametri u uploadProjectPhoto.ts |
| Bunny HTTP PUT/DELETE | storage/bunny.ts (server-only) |
| Runtime validaciju RPC rezultata | storage/storageLifecycle.schema.ts i storage/storageKey.schema.ts |
| Pozive storage RPC-a | storage/storageLifecycleRepository.ts |
| Zahtjev za cleanup nakon autoriziranog unlinka | storage/requestProjectPhotoCleanup.ts |
| Potpis/timestamp | storage/cleanupRequestAuth.ts |
| Atomsko trošenje jednokratnog ID-a | storage/consumeCleanupRequest.ts |
| Obradu cleanup zadataka | storage/runStorageCleanup.ts |
| CDN URL za prikaz | utils/getProjectPhotoUrl.ts (koristi javni CDN URL) |
| Tip project_photos | types/projectPhoto.types.ts — generated table type |

## Upload tok

Product UI/hook → postojeći server action → product upload adapter → uploadProjectPhoto → validate → authenticated actor ili public Photo Wall → storage_reserve_upload → WebP obrada → Bunny PUT jednom → storage_finalize_upload. DB određuje project i canonical key i provjerava pristup prije PUT-a. Canonical putanja: projects/<project UUID>/photos/<object UUID>.webp. UI UUID previewa nije authority ni stvarni storage key.

Upload adapteri:
- ../invitations/repositories/photos/uploadInvitationPhoto.ts
- ../digital-albums/repositories/photos/uploadDigitalAlbumPhoto.ts
- ../photo-walls/repositories/photos/uploadPhotoWallPhoto.ts

Tri adaptera samo prilagođavaju postojeći povratni tip; ne stvaraju svoje Bunny putanje. U njih ne dodavati direktni PUT/DELETE. Product-specific hookovi/revalidation ostaju u svojim featureovima.

## Uklanjanje i cron

Product server action → remove_invitation_photo/remove_digital_album_photo/remove_photo_wall_photo putem korisničkog klijenta → DB autorizacija/unlink/reference guard → requestProjectPhotoCleanup. Cascade/triggeri i cron sweep su dodatna zaštita. UI ne briše fizičku datoteku.

Supabase Cron → private.enqueue_signed_storage_cleanup → POST /api/internal/storage-cleanup → HMAC + raw body + timestamp → storage_consume_cleanup_request → claimStorageCleanup (runtime finalized:true proof) → Bunny DELETE → storage_finish_cleanup. App route ostaje u src/app/api/internal/storage-cleanup/route.ts jer ga Next.js ondje registrira.

Svih šest storage RPC-a koristi generated public Database tipove. Nullable assertions ograničene su na nullable SQL argumente pri RPC pozivu; runtime validacija rezultata ostaje. Nema Planned/ConsumeRpc castova ni starih create-photo poziva. DB read-only potvrda potpisa/grants 2026-10-08. Sve su service_role-only definer funkcije s praznim search_path.

## Varijable

| Varijabla | Namjena |
| --- | --- |
| BUNNY_STORAGE_ZONE / BUNNY_STORAGE_REGION / BUNNY_STORAGE_PASSWORD | Server Bunny adapter, nikad browser |
| SUPABASE_SECRET_KEY | Postojeći server admin client, nikad browser |
| NEXT_PUBLIC_CDN_URL | Javni URL za prikaz fotografije |
| STORAGE_CLEANUP_ENABLED | Endpoint uključen samo kad je true |
| STORAGE_CLEANUP_SECRET | Server potpisni ključ, ista vrijednost u Vault memora_storage_cleanup_secret |

Ne spremati vrijednosti u README ili SQL. Shared upload/constants i browser UI ne smiju importati server-only storage module. CDN URL nije tajna i nije dokaz vlasništva za brisanje.

## Granice i održavanje

Reserve/finalize mogu jednom retry sa ISTIM ID-em; PUT se ne ponavlja. Timeout ne dokazuje da je udaljeni PUT prekinut: pending/ambiguous objekti zadržavaju se za pregled, bez automatskog DELETE-a. Fizičko brisanje samo za finaliziran, autoriziran claim; DELETE 404 prihvaćen radi idempotencije. Ne pretvarati path iz browsera/URL-a u cleanup authority.

Za SQL Editor, cron monitoring i povijest: [storage upute](../../../docs/storage-lifecycle/README.md). Instalirani SQL ovim refaktorom nije mijenjan. Browser UI/regression nije ovime automatski potvrđen; production upload ranije je operater testirao. Stvarni PostgreSQL concurrency testovi još nisu izvršeni.

Stari test/fixture već je bio uklonjen u radnom stablu prije ovog zadatka; nije vraćen u feature. Tijekom provjere koristi se privremeni mock harness s zabranjenom mrežom, zatim se uklanja.

## Rezultat provjere 2026-10-08

Full TypeScript i production build prolaze. Ciljani ESLint: 0 grešaka, 2 postojeća no-img-element upozorenja u preview komponentama. Privremeni mock harness 15/15 prošao uz zabranjen real network; nakon provjere uklonjen. Nijedan mutation RPC, Bunny PUT/DELETE niti scheduler/env promjena izvršeni. Live UI upload nije ponavljan ovim refaktorom.

## Limit fotografija na Vercelu

Najviše 4 MiB (UI poruke 4 MB) po izvornoj fotografiji; JPEG/PNG/WebP. Browser i server koriste isti MAX_FILE_SIZE. Album/Photo Wall šalju pojedinačne datoteke redom, invitation jednu; max 10 odabranih nije jedan zbirni request. Next server action limit 4.25 MiB ostavlja multipart prostor i ostaje ispod Vercel 4.5 MB platform limita. Veličina se provjerava prije slanja i na serveru; server-side WebP optimizacija ne može spasiti već prevelik ulazni request. Za buduću podršku većih izvornika potreban je zaseban autorizirani direct-upload ili prethodna browser obrada, bez otkrivanja Bunny ključa.
