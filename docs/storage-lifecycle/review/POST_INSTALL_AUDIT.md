# Post-install audit — 2026-10-07

Read-only Supabase catalog inspection. No mutation RPC, SQL changes, Bunny PUT/DELETE,
credential/user-row reads, or cleanup activation performed.

## Confirmed installation

- All three private tables exist. RLS enabled; restrictive deny_clients ALL false/false.
- PUBLIC table ACL absent. anon/authenticated/service_role effective table privileges false.
- PKs, canonical storage-key constraint, UNIQUE key, state/kind constraints, cleanup ledger FK,
  storage_objects_sweep and storage_cleanup_due are installed. Ledger has no project FK.
- All 10 expected triggers enabled on the expected public tables.
- All 15 function bodies match local install after whitespace normalization (MD5 equality).
- Empty search_path; five public storage RPCs SECURITY DEFINER, service_role-only.
- Both old create-photo RPC ACLs contain only postgres. Effective anon/authenticated/service_role
  EXECUTE false; no PUBLIC grant.

## Application and types

All three upload adapters call uploadProjectPhoto: invitation, digital-album, photo-wall.
Server UUID -> reserve -> optimization -> Bunny PUT -> finalize; same reservation used on retry.
Authenticated actor comes from auth.getUser; Photo Wall uses publicId. No old create-photo
RPC calls in src except generated DB declarations. Cleanup requested after unlink via RPC,
not by accepting arbitrary client storage paths.

Regenerated public database.types.ts using the CLI against the live project, stored as UTF-8
(previous file was UTF-16). Removed PlannedStorageClient/unknown cast in storage repository.
Nullable application input remains nullable; limited non-null assertions occur only at rpc
arguments because generated SQL Args do not represent SQL NULL inputs. Runtime result parsing retained.

## Removal candidates, not a removal authorization

public.create_invitation_photo(uuid,text,bigint,text)
public.create_digital_album_photo(uuid,text,bigint,text)

No src callers, public/private function-source callers, or pg_depend dependents found.
These are deprecated registration entry points, not required by the new flow. Keep disabled
until actual upload smoke tests pass, then remove in a separate manually reviewed transaction
using DROP FUNCTION without CASCADE. This will detect catalog dependencies but cannot prove
absence of external scripts, runtime dynamic SQL, or stored SQL Editor queries. Regenerate types
and update definitions/rollback instructions after removal. Do not restore their client grants.

project_photos and three product association tables remain required. All new ledger/jobs/archive,
helpers and triggers remain required. storage_legacy_review is a precaution for untrusted older
metadata and is not disposable solely because there are currently no photos.
No claim that the rest of the database is free of unused objects: this audit covers storage only.

## Validation

- Targeted storage TypeScript: PASS.
- ESLint on changed repository, generated types and mock test: PASS.
- Mocked storage tests: 12/12 PASS, real network forbidden by harness.
- Full TypeScript: FAIL, pre-existing TS2307 at
  src/features/invitation-guests/components/InvitationGuests.tsx:22,
  ../actions/invitationGuestActions cannot be resolved. Not changed in this task.
- Actual PostgreSQL concurrency/cascade execution and real Bunny integration: NOT TESTED.
- Hosted environment variables/scheduler state were not verified; cleanup switch was not changed.

## Next manual test

Keep cleanup disabled. Upload one small test image per product through normal UI; check display,
project_photos + association creation, and ready ledger state with matching canonical key.
For invitation/album save visible and retained/unplaced slots and verify references prevent unlink.
Remove only an unused photo association and inspect queued deleting state; do not run the worker.
Test authorization denial for a different project and unpublished Photo Wall without bypassing UI
security boundaries. Then test isolated concurrency/cascade/lease cases before approving cleanup.
A manual UI upload will perform Bunny PUT; none was performed by this audit.
