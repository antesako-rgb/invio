-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function private.storage_document_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_ids uuid[]; o private.storage_objects;
begin
  perform private.storage_lock();
  if tg_table_name = 'invitations' then
    select array_agg(id order by id) into v_ids from private.invitation_document_photo_ids(new.document) id;
  else
    select array_agg(id order by id) into v_ids from private.digital_album_document_photo_ids(new.document) id;
  end if;
  foreach v_id in array coalesce(v_ids, array[]::uuid[]) loop
    for o in select s.* from private.storage_objects s
      where s.id = v_id or s.storage_key in (
        select private.storage_key_alias(p.image_path) from public.project_photos p where p.id = v_id
        union
        select private.storage_key_alias(p.image_path) from private.storage_legacy_review p where p.photo_id = v_id
      ) for update
    loop
      if o.state <> 'ready' or o.id <> v_id or o.project_id <> new.project_id then
        raise exception 'Document references an unavailable storage object' using errcode = '22023';
      end if;
    end loop;
  end loop;
  -- Existing RPCs retain their product membership/photo association validation.
  return new;
end;
$$;

revoke all on function private.storage_document_guard() from public, anon, authenticated;

commit;
