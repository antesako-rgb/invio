-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/010_public.storage_request_cleanup.sql
create function public.storage_request_cleanup(p_photo_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin perform private.storage_queue(p_photo_id); end;
$$;
