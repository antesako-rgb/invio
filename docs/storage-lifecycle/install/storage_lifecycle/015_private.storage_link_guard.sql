-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function private.storage_link_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare p public.project_photos; o private.storage_objects; v_project uuid; v_document jsonb;
begin
  perform private.storage_lock();
  if tg_op = 'UPDATE' and (
    new.photo_id is distinct from old.photo_id
    or (tg_table_name = 'invitation_photos' and (to_jsonb(new)->'invitation_id') is distinct from (to_jsonb(old)->'invitation_id'))
    or (tg_table_name = 'digital_album_photos' and (to_jsonb(new)->'album_id') is distinct from (to_jsonb(old)->'album_id'))
    or (tg_table_name = 'photo_wall_photos' and (to_jsonb(new)->'photo_wall_id') is distinct from (to_jsonb(old)->'photo_wall_id'))
  ) then
    raise exception 'Association identity is immutable; use unlink/link' using errcode = '22023';
  end if;
  if tg_table_name = 'invitation_photos' then
    select project_id, document into v_project, v_document from public.invitations
      where id = case when tg_op = 'DELETE' then old.invitation_id else new.invitation_id end for update;
  elsif tg_table_name = 'digital_album_photos' then
    select project_id, document into v_project, v_document from public.digital_albums
      where id = case when tg_op = 'DELETE' then old.album_id else new.album_id end for update;
  else
    select project_id into v_project from public.photo_walls
      where id = case when tg_op = 'DELETE' then old.photo_wall_id else new.photo_wall_id end for update;
  end if;
  if tg_op = 'DELETE' then
    -- On a parent cascade the parent is already absent: removal is allowed.
    if v_project is not null and exists (select 1 from public.projects where id = v_project)
      and tg_table_name = 'invitation_photos' and exists (
      select 1 from private.invitation_document_photo_ids(v_document) id where id = old.photo_id
    ) then raise exception 'Photo is used by document' using errcode = '23503'; end if;
    if v_project is not null and exists (select 1 from public.projects where id = v_project)
      and tg_table_name = 'digital_album_photos' and exists (
      select 1 from private.digital_album_document_photo_ids(v_document) id where id = old.photo_id
    ) then raise exception 'Photo is used by document' using errcode = '23503'; end if;
    return old;
  end if;
  select * into p from public.project_photos where id = new.photo_id for update;
  if not found or v_project is null or v_project <> p.project_id then
    raise exception 'Photo does not belong to product project' using errcode = '22023';
  end if;
  select * into o from private.storage_objects where storage_key = private.storage_key_alias(p.image_path);
  if found and (o.state <> 'ready' or o.id <> p.id or o.project_id <> p.project_id) then
    raise exception 'Storage object is unavailable' using errcode = '22023';
  end if;
  -- Existing legacy photos may still be linked within their own project.
  -- This does NOT trust/adopt their object or authorize physical deletion.
  return new;
end;
$$;

revoke all on function private.storage_link_guard() from public, anon, authenticated;

commit;
