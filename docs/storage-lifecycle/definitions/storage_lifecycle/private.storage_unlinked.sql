-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/016_private.storage_unlinked.sql
create function private.storage_unlinked() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.storage_queue(old.photo_id);
  return old;
end;
$$;
