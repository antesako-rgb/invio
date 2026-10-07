-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/005_private.storage_key_alias.sql
create function private.storage_key_alias(p_path text) returns text
language sql immutable set search_path = '' as $$
  select pg_catalog.btrim(p_path, '/');
$$;
