-- All mutations below affect ONLY synthetic data in the runner's fresh cluster.
do $$ declare role_name text; signature text; begin
  foreach role_name in array array['anon','authenticated'] loop
    foreach signature in array array[
      'public.storage_reserve_upload(uuid,text,uuid,text,uuid)',
      'public.storage_finalize_upload(uuid,bigint,text)',
      'public.storage_claim_cleanup(integer)'
    ] loop
      if has_function_privilege(role_name,signature,'EXECUTE') then raise exception 'Client can execute management RPC'; end if;
    end loop;
  end loop;
  begin
    perform public.storage_reserve_upload('00000000-0000-4000-8000-000000000999','invitation',
      '00000000-0000-4000-8000-000000000003',null,'00000000-0000-4000-8000-000000000998');
    raise exception 'Nonmember reservation succeeded';
  exception when insufficient_privilege then null; end;
end $$;
begin;
select public.storage_reserve_upload('00000000-0000-4000-8000-000000000100','invitation','00000000-0000-4000-8000-000000000003',null,'00000000-0000-4000-8000-000000000002');
select public.storage_finalize_upload('00000000-0000-4000-8000-000000000100',10,null);
select public.storage_request_cleanup('00000000-0000-4000-8000-000000000100');
insert into public.digital_album_photos(album_id,photo_id) values ('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000100');
do $$ begin
  if (select state from private.storage_objects where id='00000000-0000-4000-8000-000000000100') <> 'ready' then
    raise exception 'Global ambiguity changed a referenced object state'; end if;
  if public.storage_claim_cleanup(3) <> '[]'::jsonb then raise exception 'Ambiguous legacy path issued a lease'; end if;
end $$;
-- Unreferenced objects also remain ready when only GLOBAL ambiguity blocks DELETE.
delete from public.digital_album_photos where photo_id='00000000-0000-4000-8000-000000000100';
delete from public.invitation_photos where photo_id='00000000-0000-4000-8000-000000000100';
do $$ begin
  if (select state from private.storage_objects where id='00000000-0000-4000-8000-000000000100') <> 'ready' then
    raise exception 'Global ambiguity unnecessarily quarantined an unreferenced object'; end if;
end $$;
-- Remove synthetic ambiguity as an operator; this is NOT an application API.
delete from public.project_photos where id='00000000-0000-4000-8000-000000000006';
delete from private.storage_legacy_review where photo_id='00000000-0000-4000-8000-000000000006';
select public.storage_request_cleanup('00000000-0000-4000-8000-000000000100');
-- Fixture-only owner bypass to simulate a PRE-EXISTING dangling reference.
-- Normal document writes are tested separately and must reject this state.
alter table public.invitations disable trigger storage_document_guard;
alter table public.digital_albums disable trigger storage_document_guard;
update public.invitations set document='{"theme":"test","pages":[{"type":"gallery","layout":"grid","photos":[],"unplacedPhotos":[{"photoId":"00000000-0000-4000-8000-000000000100"}]}]}'
  where id='00000000-0000-4000-8000-000000000003';
do $$ declare k text; begin
  select storage_key into k from private.storage_objects where id='00000000-0000-4000-8000-000000000100';
  if exists(select 1 from public.project_photos where id='00000000-0000-4000-8000-000000000100') then raise exception 'Public row should be absent'; end if;
  if not private.storage_has_references(k) then raise exception 'Missing public row hid retained reference'; end if;
  if public.storage_claim_cleanup(3) <> '[]'::jsonb then raise exception 'Dangling reference issued a lease'; end if;
end $$;
update public.invitations set document='{"theme":"test","pages":[{"type":"gallery","layout":"grid","photos":[{"photoId":"00000000-0000-4000-8000-000000000100"}],"unplacedPhotos":[]}]}'
  where id='00000000-0000-4000-8000-000000000003';
do $$ begin
  if not private.storage_has_references((select storage_key from private.storage_objects where id='00000000-0000-4000-8000-000000000100')) then
    raise exception 'Missing public row hid visible reference'; end if;
end $$;
-- Album retained references must work independently, too.
update public.digital_albums set document='{"theme":"test","pages":[{"type":"gallery","layout":"grid","photos":[],"unplacedPhotos":[{"photoId":"00000000-0000-4000-8000-000000000100"}]}]}';
update public.invitations set document='{"theme":"test","pages":[]}';
do $$ begin
  if not private.storage_has_references((select storage_key from private.storage_objects where id='00000000-0000-4000-8000-000000000100')) then
    raise exception 'Missing public row hid album retained reference'; end if;
end $$;
alter table public.invitations enable trigger storage_document_guard;
alter table public.digital_albums enable trigger storage_document_guard;
rollback;
-- Verify rollback restored the starting fixture and left no ledger/job effects.
do $$ begin
  if exists(select 1 from private.storage_objects) or exists(select 1 from private.storage_cleanup_jobs) then raise exception 'Rollback left lifecycle rows'; end if;
end $$;

begin;
delete from public.project_photos where id='00000000-0000-4000-8000-000000000006';
delete from private.storage_legacy_review where photo_id='00000000-0000-4000-8000-000000000006';
select public.storage_reserve_upload('00000000-0000-4000-8000-000000000101','invitation','00000000-0000-4000-8000-000000000003',null,'00000000-0000-4000-8000-000000000002');
select public.storage_finalize_upload('00000000-0000-4000-8000-000000000101',10,null);
select public.storage_finalize_upload('00000000-0000-4000-8000-000000000101',10,null);
delete from public.projects where id='00000000-0000-4000-8000-000000000001';
do $$ begin
  if not exists(select 1 from private.storage_cleanup_jobs where object_id='00000000-0000-4000-8000-000000000101') then
    raise exception 'Project cascade lost or failed to queue job'; end if;
  if not exists(select 1 from private.storage_objects where id='00000000-0000-4000-8000-000000000101') then raise exception 'Project cascade lost ledger'; end if;
end $$;
rollback;
-- These checks exercise actual migrations, but the fixture is NOT a full Supabase clone.
