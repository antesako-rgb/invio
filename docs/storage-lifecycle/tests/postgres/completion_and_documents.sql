-- ONLY fresh synthetic cluster. No Bunny calls.
begin;
delete from public.project_photos where id='00000000-0000-4000-8000-000000000006';
delete from private.storage_legacy_review where photo_id='00000000-0000-4000-8000-000000000006';
select public.storage_reserve_upload('00000000-0000-4000-8000-000000000300','invitation','00000000-0000-4000-8000-000000000003',null,'00000000-0000-4000-8000-000000000002');
select public.storage_finalize_upload('00000000-0000-4000-8000-000000000300',10,null);
do $$ declare s text; begin
  foreach s in array array['pending','deleting','deleted','quarantined'] loop
    update private.storage_objects set state=s where id='00000000-0000-4000-8000-000000000300';
    begin
      update public.invitations set document='{"theme":"test","pages":[{"type":"gallery","layout":"grid","photos":[],"unplacedPhotos":[{"photoId":"00000000-0000-4000-8000-000000000300"}]}]}';
      raise exception 'Invitation accepted non-ready managed reference';
    exception when invalid_parameter_value then null; end;
    begin
      update public.digital_albums set document='{"theme":"test","pages":[{"type":"gallery","layout":"grid","photos":[{"photoId":"00000000-0000-4000-8000-000000000300"}],"unplacedPhotos":[]}]}';
      raise exception 'Album accepted non-ready managed reference';
    exception when invalid_parameter_value then null; end;
  end loop;
end $$;
update private.storage_objects set state='ready' where id='00000000-0000-4000-8000-000000000300';
insert into public.invitations(id,project_id) values ('00000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000001');
insert into public.digital_albums(id,project_id) values ('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000001');
insert into public.photo_walls(id,project_id) values ('00000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000001');
insert into public.digital_album_photos(album_id,photo_id) values ('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000300');
insert into public.photo_wall_photos(photo_wall_id,photo_id) values ('00000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000300');
do $$ declare t text; field text; target uuid; begin
  foreach t in array array['invitation_photos','digital_album_photos','photo_wall_photos'] loop
    field := case t when 'invitation_photos' then 'invitation_id' when 'digital_album_photos' then 'album_id' else 'photo_wall_id' end;
    target := case t when 'invitation_photos' then '00000000-0000-4000-8000-000000000007'::uuid when 'digital_album_photos' then '00000000-0000-4000-8000-000000000008'::uuid else '00000000-0000-4000-8000-000000000009'::uuid end;
    begin
      execute format('update public.%I set %I=$1 where photo_id=$2',t,field) using target,'00000000-0000-4000-8000-000000000300'::uuid;
      raise exception 'Parent reassignment accepted';
    exception when invalid_parameter_value then null; end;
    begin
      execute format('update public.%I set photo_id=$1 where photo_id=$2',t) using '00000000-0000-4000-8000-000000000999'::uuid,'00000000-0000-4000-8000-000000000300'::uuid;
      raise exception 'Photo reassignment accepted';
    exception when invalid_parameter_value then null; end;
  end loop;
end $$;
delete from public.digital_album_photos where photo_id='00000000-0000-4000-8000-000000000300';
delete from public.photo_wall_photos where photo_id='00000000-0000-4000-8000-000000000300';
delete from public.invitation_photos where photo_id='00000000-0000-4000-8000-000000000300';
do $$ declare token uuid; old_token uuid; state_before text; begin
  perform public.storage_claim_cleanup(1);
  select lease_token into token from private.storage_cleanup_jobs where object_id='00000000-0000-4000-8000-000000000300';
  update private.storage_cleanup_jobs set lease_until=clock_timestamp()-interval '1 second' where object_id='00000000-0000-4000-8000-000000000300';
  begin
    perform public.storage_finish_cleanup('00000000-0000-4000-8000-000000000300',token,true);
    raise exception 'Expired lease completion accepted';
  exception when invalid_parameter_value then null; end;
  perform public.storage_claim_cleanup(1);
  begin
    perform public.storage_finish_cleanup('00000000-0000-4000-8000-000000000300',token,true);
    raise exception 'Replaced token accepted';
  exception when invalid_parameter_value then null; end;
  select lease_token into token from private.storage_cleanup_jobs where object_id='00000000-0000-4000-8000-000000000300';
  update private.storage_objects set state='quarantined' where id='00000000-0000-4000-8000-000000000300';
  begin
    perform public.storage_finish_cleanup('00000000-0000-4000-8000-000000000300',token,true);
    raise exception 'Completion overwrote quarantine';
  exception when invalid_parameter_value then null; end;
  select state into state_before from private.storage_objects where id='00000000-0000-4000-8000-000000000300';
  if state_before <> 'quarantined' then raise exception 'Quarantine lost'; end if;
  update private.storage_objects set state='deleting' where id='00000000-0000-4000-8000-000000000300';
  old_token := token;
  perform public.storage_finish_cleanup('00000000-0000-4000-8000-000000000300',token,false);
  if not exists (select 1 from private.storage_cleanup_jobs where object_id='00000000-0000-4000-8000-000000000300' and state='pending' and lease_until is null and next_attempt_at >= now()+interval '15 minutes') then
    raise exception 'Failed cleanup did not schedule delayed retry';
  end if;
  update private.storage_cleanup_jobs set next_attempt_at=now() where object_id='00000000-0000-4000-8000-000000000300';
  perform public.storage_claim_cleanup(1);
  select lease_token into token from private.storage_cleanup_jobs where object_id='00000000-0000-4000-8000-000000000300';
  if token = old_token then raise exception 'Retry did not rotate lease token'; end if;
  perform public.storage_finish_cleanup('00000000-0000-4000-8000-000000000300',token,true);
  if not exists (select 1 from private.storage_cleanup_jobs where object_id='00000000-0000-4000-8000-000000000300' and state='done' and lease_until is null) then
    raise exception 'Successful retry did not complete job';
  end if;
  if (select state from private.storage_objects where id='00000000-0000-4000-8000-000000000300') <> 'deleted' then raise exception 'Valid completion failed'; end if;
end $$;
rollback;
