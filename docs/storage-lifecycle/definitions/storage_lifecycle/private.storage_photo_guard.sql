-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/014_private.storage_photo_guard.sql
create function private.storage_photo_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare o private.storage_objects;
begin
  perform private.storage_lock();
  if tg_op = 'DELETE' then
    if not exists (select 1 from private.storage_objects s
      where s.id = old.id and s.storage_key = old.image_path and s.project_id = old.project_id) then
      insert into private.storage_legacy_review(photo_id, project_id, image_path, source_type, source_id, file_size)
        values (old.id, old.project_id, old.image_path, old.source_type, old.source_id, old.file_size)
        on conflict (photo_id) do nothing;
    end if;
    return old;
  end if;
  if tg_op = 'UPDATE' then
    if new.id <> old.id or new.project_id <> old.project_id or new.image_path <> old.image_path
      or new.source_id <> old.source_id or new.source_type <> old.source_type then
      raise exception 'Storage identity is immutable' using errcode = '22023';
    end if;
    return new;
  end if;
  select * into o from private.storage_objects where id = new.id;
  if not found or o.state <> 'ready' or o.storage_key <> new.image_path
    or o.project_id <> new.project_id or o.product_id <> new.source_id or o.kind <> new.source_type then
    raise exception 'Photo requires a server upload reservation' using errcode = '42501';
  end if;
  return new;
end;
$$;
