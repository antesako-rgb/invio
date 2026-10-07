-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/storage_lifecycle/006_private.storage_has_references.sql
create function private.storage_has_references(p_key text) returns boolean
language sql stable set search_path = '' as $$
  with object_ids as (
    select id from private.storage_objects where storage_key = p_key
    union
    select id from public.project_photos where private.storage_key_alias(image_path) = p_key
    union
    select photo_id from private.storage_legacy_review where private.storage_key_alias(image_path) = p_key
  )
  select
    exists (select 1 from public.invitation_photos r join object_ids o on o.id = r.photo_id)
    or exists (select 1 from public.digital_album_photos r join object_ids o on o.id = r.photo_id)
    or exists (select 1 from public.photo_wall_photos r join object_ids o on o.id = r.photo_id)
    or exists (select 1 from public.invitations i
      cross join lateral private.invitation_document_photo_ids(i.document) ids(photo_id)
      join object_ids o on o.id = ids.photo_id)
    or exists (select 1 from public.digital_albums a
      cross join lateral private.digital_album_document_photo_ids(a.document) ids(photo_id)
      join object_ids o on o.id = ids.photo_id);
$$;
