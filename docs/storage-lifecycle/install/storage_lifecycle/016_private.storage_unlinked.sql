-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function private.storage_unlinked() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.storage_queue(old.photo_id);
  return old;
end;
$$;

revoke all on function private.storage_unlinked() from public, anon, authenticated;

commit;
