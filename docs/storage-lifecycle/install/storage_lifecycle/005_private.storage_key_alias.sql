-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function private.storage_key_alias(p_path text) returns text
language sql immutable set search_path = '' as $$
  select pg_catalog.btrim(p_path, '/');
$$;

revoke all on function private.storage_key_alias(text) from public, anon, authenticated;

commit;
