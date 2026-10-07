-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/004_private.storage_lock.sql
create function private.storage_lock() returns void language plpgsql set search_path = '' as $$
begin
  -- Existing CRUD/document RPCs may hold parent rows before reaching a trigger.
  -- Never wait for the gate while holding those rows: abort/retry instead.
  if not pg_catalog.pg_try_advisory_xact_lock(79314, 1) then
    raise exception 'Storage transaction busy; retry the transaction' using errcode = '40001';
  end if;
end;
$$;
