-- ONLY before 002 activation and before ANY reservations have been created.
-- Refuses to discard ledger/jobs/archive or disable active safety guards.
begin;
do $$
begin
  if exists (select 1 from pg_catalog.pg_trigger where tgname in (
    'storage_photo_guard','storage_link_guard','storage_unlinked','storage_project_deleted','storage_document_guard'))
    or exists (select 1 from private.storage_objects)
    or exists (select 1 from private.storage_cleanup_jobs)
    or exists (select 1 from private.storage_legacy_review) then
    raise exception 'Use rollback_freeze: lifecycle active or records exist';
  end if;
end;
$$;
drop function public.storage_reserve_upload(uuid,text,uuid,text,uuid);
drop function public.storage_finalize_upload(uuid,bigint,text);
drop function public.storage_request_cleanup(uuid);
drop function public.storage_claim_cleanup(integer);
drop function public.storage_finish_cleanup(uuid,uuid,boolean);
drop function private.storage_queue(uuid);
drop function private.storage_has_references(text);
drop function private.storage_key_alias(text);
drop function private.storage_lock();
drop table private.storage_cleanup_jobs;
drop table private.storage_objects;
drop table private.storage_legacy_review;
commit;
