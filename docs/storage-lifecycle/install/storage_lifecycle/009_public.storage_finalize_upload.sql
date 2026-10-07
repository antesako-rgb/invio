-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create function public.storage_finalize_upload(p_id uuid, p_file_size bigint, p_description text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare o private.storage_objects; r jsonb; v_project uuid; v_photo public.project_photos;
begin
  perform private.storage_lock();
  select * into o from private.storage_objects where id = p_id for update;
  if not found then raise exception 'Reservation not found' using errcode = 'P0002'; end if;
  if o.state = 'ready' then return o.result; end if; -- Idempotent after possible commit.
  if o.state <> 'pending' or o.expires_at <= now() or p_file_size is null or p_file_size <= 0
    or char_length(p_description) > 300 then
    raise exception 'Invalid or expired upload' using errcode = '22023';
  end if;
  if o.kind = 'invitation' then
    select project_id into v_project from public.invitations where id = o.product_id for key share;
  elsif o.kind = 'digital-album' then
    select project_id into v_project from public.digital_albums where id = o.product_id for key share;
  else
    select project_id into v_project from public.photo_walls where id = o.product_id
      and is_public and published_at is not null for share;
  end if;
  if v_project is distinct from o.project_id then raise exception 'Target unavailable' using errcode = 'P0002'; end if;
  perform 1 from public.projects where id = o.project_id for key share;
  if not found then raise exception 'Project unavailable' using errcode = 'P0002'; end if;
  if o.kind <> 'photo-wall' and not private.is_project_member(o.project_id, o.actor_id) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  update private.storage_objects set state = 'ready' where id = o.id;
  insert into public.project_photos(id, project_id, image_path, file_size, source_type, source_id)
    values (o.id, o.project_id, o.storage_key, p_file_size, o.kind, o.product_id) returning * into v_photo;
  if o.kind = 'invitation' then
    insert into public.invitation_photos(invitation_id, photo_id, description)
      values (o.product_id, o.id, nullif(btrim(p_description), '')) returning to_jsonb(invitation_photos.*) into r;
    r := jsonb_build_object('kind', o.kind, 'relation', r);
  elsif o.kind = 'digital-album' then
    insert into public.digital_album_photos(album_id, photo_id, description)
      values (o.product_id, o.id, nullif(btrim(p_description), '')) returning to_jsonb(digital_album_photos.*) into r;
    r := jsonb_build_object('kind', o.kind, 'relation', r);
  else
    insert into public.photo_wall_photos(photo_wall_id, photo_id, description, is_favorite)
      values (o.product_id, o.id, nullif(btrim(p_description), ''), false);
    r := jsonb_build_object('kind', o.kind, 'photo', jsonb_build_object(
      'id', o.id, 'photoWallId', o.product_id, 'imagePath', o.storage_key,
      'fileSize', p_file_size, 'description', nullif(btrim(p_description), ''),
      'isFavorite', false, 'createdAt', v_photo.created_at));
  end if;
  update private.storage_objects set result = r where id = o.id;
  return r;
end;
$$;

revoke all on function public.storage_finalize_upload(uuid,bigint,text) from public, anon, authenticated, service_role;

commit;
