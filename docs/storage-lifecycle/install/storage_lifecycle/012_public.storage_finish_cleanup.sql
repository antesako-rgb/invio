-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function public.storage_finish_cleanup(p_id uuid, p_lease_token uuid, p_success boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare o private.storage_objects; j private.storage_cleanup_jobs;
begin
  perform private.storage_lock();
  if p_success is null then raise exception 'Invalid completion' using errcode = '22023'; end if;
  -- Lock object BEFORE job, and never overwrite a quarantine/other state.
  select * into o from private.storage_objects where id = p_id for update;
  if not found or o.state <> 'deleting' then
    raise exception 'Cleanup object state changed' using errcode = '22023';
  end if;
  select * into j from private.storage_cleanup_jobs where object_id = p_id for update;
  -- Check the wall clock AFTER both row locks have been obtained.
  if not found or j.state <> 'leased' or j.lease_token is distinct from p_lease_token
    or j.lease_until is null or j.lease_until <= clock_timestamp() then
    raise exception 'Expired or stale cleanup lease' using errcode = '22023';
  end if;
  -- A completion ACK cannot repair a physical DELETE that already happened.
  -- Retain any newly discovered reference/alias decision for operator review.
  if private.storage_has_references(o.storage_key) then
    raise exception 'Cleanup object is referenced' using errcode = '22023';
  end if;
  if p_success then
    delete from public.project_photos p
      where p.id = o.id and p.image_path = o.storage_key and p.project_id = o.project_id;
    update private.storage_objects set state = 'deleted' where id = o.id and state = 'deleting';
    update private.storage_cleanup_jobs set state = 'done', lease_until = null where object_id = o.id;
  else
    update private.storage_cleanup_jobs set state = 'pending', lease_until = null,
      next_attempt_at = now() + interval '15 minutes' where object_id = o.id;
  end if;
end;
$$;

revoke all on function public.storage_finish_cleanup(uuid,uuid,boolean) from public, anon, authenticated, service_role;

commit;
