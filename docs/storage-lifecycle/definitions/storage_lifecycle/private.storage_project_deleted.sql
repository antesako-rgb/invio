-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/017_private.storage_project_deleted.sql
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
