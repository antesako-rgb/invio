-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function private.storage_queue(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare o private.storage_objects;
begin
  perform private.storage_lock();
  select * into o from private.storage_objects where id = p_id for update;
  if not found or o.state not in ('pending', 'ready') then return; end if;
  update private.storage_objects set swept_at = now() where id = o.id;
  -- References always win: unrelated ambiguous legacy paths must not change
  -- the state of a live managed object or prevent its valid associations.
  if private.storage_has_references(o.storage_key) then return; end if;
  if o.state = 'pending' and o.expires_at + interval '1 hour' > now() then return; end if;
  -- Global uncertainty blocks deletion only, without quarantining ready objects.
  if exists (select 1 from public.project_photos p
      where private.storage_key_alias(p.image_path) !~ '^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*\.[A-Za-z0-9]+$')
    or exists (select 1 from private.storage_legacy_review p
      where private.storage_key_alias(p.image_path) !~ '^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*\.[A-Za-z0-9]+$') then
    return;
  end if;
  -- An exact alias on THIS unreferenced object requires individual review.
  if exists (select 1 from public.project_photos p
      where private.storage_key_alias(p.image_path) = o.storage_key and p.id <> o.id)
    or exists (select 1 from private.storage_legacy_review p
      where private.storage_key_alias(p.image_path) = o.storage_key) then
    update private.storage_objects set state = 'quarantined' where id = o.id;
    return;
  end if;
  update private.storage_objects set state = 'deleting' where id = o.id;
  insert into private.storage_cleanup_jobs(object_id) values (o.id) on conflict do nothing;
  -- Remove an unreferenced picker row, but retain the private object + job.
  delete from public.project_photos where id = o.id and image_path = o.storage_key and project_id = o.project_id;
end;
$$;

revoke all on function private.storage_queue(uuid) from public, anon, authenticated;

commit;
