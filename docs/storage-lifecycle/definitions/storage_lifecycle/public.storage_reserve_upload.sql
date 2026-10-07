-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/008_public.storage_reserve_upload.sql
create function public.storage_reserve_upload(
  p_id uuid, p_kind text, p_product_id uuid, p_public_id text, p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_product uuid; v_project uuid; o private.storage_objects;
begin
  perform private.storage_lock();
  if p_id is null then raise exception 'Invalid upload ID' using errcode = '22023'; end if;
  if p_kind = 'invitation' then
    select id, project_id into v_product, v_project from public.invitations where id = p_product_id for key share;
  elsif p_kind = 'digital-album' then
    select id, project_id into v_product, v_project from public.digital_albums where id = p_product_id for key share;
  elsif p_kind = 'photo-wall' then
    select id, project_id into v_product, v_project from public.photo_walls
      where public_id = btrim(p_public_id) and is_public and published_at is not null for share;
  else raise exception 'Invalid target' using errcode = '22023'; end if;
  if v_project is null then raise exception 'Target unavailable' using errcode = 'P0002'; end if;
  perform 1 from public.projects where id = v_project for key share;
  if not found then raise exception 'Project unavailable' using errcode = 'P0002'; end if;
  if p_kind <> 'photo-wall' and (p_actor_id is null or not private.is_project_member(v_project, p_actor_id)) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if exists (select 1 from public.project_photos p where p.id = p_id or private.storage_key_alias(p.image_path)
      = 'projects/' || v_project::text || '/photos/' || p_id::text || '.webp')
    or exists (select 1 from private.storage_legacy_review p where private.storage_key_alias(p.image_path)
      = 'projects/' || v_project::text || '/photos/' || p_id::text || '.webp') then
    raise exception 'Storage key already exists' using errcode = '22023';
  end if;
  insert into private.storage_objects(id, project_id, product_id, kind, actor_id, storage_key)
    values (p_id, v_project, v_product, p_kind, p_actor_id,
      'projects/' || v_project::text || '/photos/' || p_id::text || '.webp') on conflict (id) do nothing;
  select * into o from private.storage_objects where id = p_id for update;
  if o.project_id <> v_project or o.product_id <> v_product or o.kind <> p_kind
    or o.actor_id is distinct from p_actor_id or o.state <> 'pending' or o.expires_at <= now() then
    raise exception 'Reservation mismatch or expired' using errcode = '22023';
  end if;
  return jsonb_build_object('id', o.id, 'storage_key', o.storage_key, 'expires_at', o.expires_at);
end;
$$;
