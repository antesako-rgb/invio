-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function private.storage_lock() returns void language plpgsql set search_path = '' as $$
begin
  -- Existing CRUD/document RPCs may hold parent rows before reaching a trigger.
  -- Never wait for the gate while holding those rows: abort/retry instead.
  if not pg_catalog.pg_try_advisory_xact_lock(79314, 1) then
    raise exception 'Storage transaction busy; retry the transaction' using errcode = '40001';
  end if;
end;
$$;

revoke all on function private.storage_lock() from public, anon, authenticated;

commit;
