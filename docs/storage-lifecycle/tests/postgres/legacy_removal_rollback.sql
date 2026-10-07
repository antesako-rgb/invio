-- ONLY synthetic local fixture. Proves freeze remains valid after optional DROP.
begin;
drop function public.create_invitation_photo(uuid,text,bigint,text);
drop function public.create_digital_album_photo(uuid,text,bigint,text);
-- SAFE OPERATIONAL ROLLBACK, manual review only. Pause uploads/removals and
-- disable the scheduler FIRST. Keep all ledger rows/jobs and safety guards.
-- This stops the new lifecycle; it deliberately does NOT reopen the vulnerable
-- arbitrary-path endpoints, adopt legacy rows, or delete any object/data.

revoke execute on function public.storage_reserve_upload(uuid,text,uuid,text,uuid),
  public.storage_finalize_upload(uuid,bigint,text), public.storage_request_cleanup(uuid),
  public.storage_claim_cleanup(integer), public.storage_finish_cleanup(uuid,uuid,boolean) from service_role;
-- Legacy registration RPCs have been removed; no grants to restore.

-- Restoring full writes requires a forward fix and re-granting the five reviewed
-- storage RPCs to service_role. A Bunny DELETE cannot be undone by SQL rollback.

do $$ begin
 if to_regprocedure('public.create_invitation_photo(uuid,text,bigint,text)') is not null
 or to_regprocedure('public.create_digital_album_photo(uuid,text,bigint,text)') is not null then
  raise exception 'Legacy removal failed';
 end if;
 if has_function_privilege('service_role','public.storage_claim_cleanup(integer)','EXECUTE') then
  raise exception 'Freeze did not revoke lifecycle execution';
 end if;
end $$;
rollback;
