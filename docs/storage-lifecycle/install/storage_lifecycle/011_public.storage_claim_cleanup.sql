-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function public.storage_claim_cleanup(p_limit integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; result jsonb;
begin
  perform private.storage_lock();
  if p_limit is null or p_limit not between 1 and 50 then raise exception 'Invalid batch' using errcode = '22023'; end if;
  -- Do not issue physical-delete leases while path identity is uncertain.
  -- Keep ready/deleting states intact; no global quarantine side effects.
  if exists (select 1 from public.project_photos p where private.storage_key_alias(p.image_path)
      !~ '^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*\.[A-Za-z0-9]+$')
    or exists (select 1 from private.storage_legacy_review p where private.storage_key_alias(p.image_path)
      !~ '^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*\.[A-Za-z0-9]+$') then
    return '[]'::jsonb;
  end if;
  -- Sweep also discovers cascade deletes and abandoned reservations.
  for v_id in select id from private.storage_objects where state = 'ready'
    or (state = 'pending' and expires_at + interval '1 hour' <= now()) order by swept_at nulls first, created_at limit 25
  loop perform private.storage_queue(v_id); end loop;
  -- Re-check aliases/references immediately before authorizing physical deletion.
  for v_id in select o.id from private.storage_objects o where o.state = 'deleting'
  loop
    if exists (select 1 from public.project_photos p
      where private.storage_key_alias(p.image_path) = (select storage_key from private.storage_objects where id = v_id)
        and p.id <> v_id)
      or exists (select 1 from private.storage_legacy_review p
        where private.storage_key_alias(p.image_path) = (select storage_key from private.storage_objects where id = v_id))
      or private.storage_has_references((select storage_key from private.storage_objects where id = v_id)) then
      update private.storage_objects set state = 'quarantined' where id = v_id;
    end if;
  end loop;
  with due as (
    select j.object_id from private.storage_cleanup_jobs j join private.storage_objects o on o.id = j.object_id
    where o.state = 'deleting' and ((j.state = 'pending' and j.next_attempt_at <= now())
      or (j.state = 'leased' and j.lease_until <= now()))
    order by j.created_at limit p_limit for update of j skip locked
  ), claimed as (
    update private.storage_cleanup_jobs j set state = 'leased', lease_token = gen_random_uuid(),
      lease_until = now() + interval '1 hour', attempts = attempts + 1 from due
      where j.object_id = due.object_id returning j.object_id, j.lease_token
  ) select coalesce(jsonb_agg(jsonb_build_object('object_id', c.object_id,
      'storage_key', o.storage_key, 'lease_token', c.lease_token)), '[]'::jsonb)
    into result from claimed c join private.storage_objects o on o.id = c.object_id;
  return result;
end;
$$;

revoke all on function public.storage_claim_cleanup(integer) from public, anon, authenticated, service_role;

commit;
