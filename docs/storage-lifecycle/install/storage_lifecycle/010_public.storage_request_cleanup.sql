-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function public.storage_request_cleanup(p_photo_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin perform private.storage_queue(p_photo_id); end;
$$;

revoke all on function public.storage_request_cleanup(uuid) from public, anon, authenticated, service_role;

commit;
