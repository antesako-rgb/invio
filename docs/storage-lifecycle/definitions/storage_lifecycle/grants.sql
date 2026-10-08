-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/004_private.storage_lock.sql
revoke all on function private.storage_lock() from public, anon, authenticated;

-- Source: install/storage_lifecycle/005_private.storage_key_alias.sql
revoke all on function private.storage_key_alias(text) from public, anon, authenticated;

-- Source: install/storage_lifecycle/006_private.storage_has_references.sql
revoke all on function private.storage_has_references(text) from public, anon, authenticated;

-- Source: install/storage_lifecycle/007_private.storage_queue.sql
revoke all on function private.storage_queue(uuid) from public, anon, authenticated;

-- Source: install/storage_lifecycle/008_public.storage_reserve_upload.sql
revoke all on function public.storage_reserve_upload(uuid,text,uuid,text,uuid) from public, anon, authenticated, service_role;

-- Source: install/storage_lifecycle/009_public.storage_finalize_upload.sql
revoke all on function public.storage_finalize_upload(uuid,bigint,text) from public, anon, authenticated, service_role;

-- Source: install/storage_lifecycle/010_public.storage_request_cleanup.sql
revoke all on function public.storage_request_cleanup(uuid) from public, anon, authenticated, service_role;

-- Source: install/storage_lifecycle/011_public.storage_claim_cleanup.sql
revoke all on function public.storage_claim_cleanup(integer) from public, anon, authenticated, service_role;

-- Source: install/storage_lifecycle/012_public.storage_finish_cleanup.sql
revoke all on function public.storage_finish_cleanup(uuid,uuid,boolean) from public, anon, authenticated, service_role;

-- Source: install/storage_lifecycle/013_private.storage_document_guard.sql
revoke all on function private.storage_document_guard() from public, anon, authenticated;

-- Source: install/storage_lifecycle/014_private.storage_photo_guard.sql
revoke all on function private.storage_photo_guard() from public, anon, authenticated;

-- Source: install/storage_lifecycle/015_private.storage_link_guard.sql
revoke all on function private.storage_link_guard() from public, anon, authenticated;

-- Source: install/storage_lifecycle/016_private.storage_unlinked.sql
revoke all on function private.storage_unlinked() from public, anon, authenticated;

-- Source: install/storage_lifecycle/017_private.storage_project_deleted.sql
revoke all on function private.storage_project_deleted() from public, anon, authenticated;

-- Source: install/activation/018_ACTIVATE.sql
grant execute on function public.storage_reserve_upload(uuid,text,uuid,text,uuid),
  public.storage_finalize_upload(uuid,bigint,text), public.storage_request_cleanup(uuid),
  public.storage_claim_cleanup(integer), public.storage_finish_cleanup(uuid,uuid,boolean) to service_role;

-- Source: install/maintenance/022_cleanup_claim_variable_fix.sql (APPLIED, operator-confirmed)
revoke all on function public.storage_claim_cleanup(integer) from public, anon, authenticated;

-- Source: install/maintenance/022_cleanup_claim_variable_fix.sql (APPLIED, operator-confirmed)
grant execute on function public.storage_claim_cleanup(integer) to service_role;
