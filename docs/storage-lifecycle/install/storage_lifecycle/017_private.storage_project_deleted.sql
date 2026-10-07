-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function private.storage_project_deleted() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform private.storage_lock();
  for v_id in select id from private.storage_objects where project_id = old.id and state = 'ready'
  loop perform private.storage_queue(v_id); end loop;
  -- Pending objects may still have an in-flight PUT: retain the expiry + grace.
  -- The regular sweep is also a backstop for every product/cascade deletion.
  return old;
end;
$$;

revoke all on function private.storage_project_deleted() from public, anon, authenticated;

commit;
