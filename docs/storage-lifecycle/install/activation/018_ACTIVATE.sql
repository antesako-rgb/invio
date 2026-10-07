-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create or replace function private.invitation_document_photo_ids(p_document jsonb)
returns setof uuid language plpgsql immutable set search_path = '' as $$
declare page jsonb; slot jsonb; collection text; photo_id uuid;
begin
  if jsonb_typeof(p_document) is distinct from 'object'
    or jsonb_typeof(p_document->'theme') is distinct from 'string'
    or jsonb_typeof(p_document->'pages') is distinct from 'array' then
    raise exception 'Invalid invitation document' using errcode = '22023';
  end if;
  for page in select value from jsonb_array_elements(p_document->'pages') loop
    if jsonb_typeof(page) is distinct from 'object'
      or jsonb_typeof(page->'type') is distinct from 'string' or nullif(btrim(page->>'type'),'') is null
      or jsonb_typeof(page->'layout') is distinct from 'string' or nullif(btrim(page->>'layout'),'') is null
      or jsonb_typeof(page->'photos') is distinct from 'array' then
      raise exception 'Invalid invitation page' using errcode = '22023';
    end if;
    foreach collection in array array['photos', 'unplacedPhotos'] loop
      if collection = 'unplacedPhotos' and not (page ? collection) then continue; end if;
      if jsonb_typeof(page->collection) is distinct from 'array' then
        raise exception 'Invalid photo collection' using errcode = '22023';
      end if;
      for slot in select value from jsonb_array_elements(page->collection) loop
        if jsonb_typeof(slot) is distinct from 'object' or not (slot ? 'photoId') then
          raise exception 'Invalid photo slot' using errcode = '22023';
        end if;
        if slot->'photoId' = 'null'::jsonb then continue; end if;
        if jsonb_typeof(slot->'photoId') is distinct from 'string' then
          raise exception 'Invalid photo ID' using errcode = '22023';
        end if;
        begin photo_id := (slot->>'photoId')::uuid;
        exception when invalid_text_representation then
          raise exception 'Invalid photo ID' using errcode = '22023'; end;
        return next photo_id;
      end loop;
    end loop;
  end loop;
end;
$$;

create trigger storage_document_guard before insert or update of document, project_id on public.invitations
for each row execute function private.storage_document_guard();

create trigger storage_document_guard before insert or update of document, project_id on public.digital_albums
for each row execute function private.storage_document_guard();

create trigger storage_photo_guard before insert or update or delete on public.project_photos
for each row execute function private.storage_photo_guard();

create trigger storage_link_guard before insert or update or delete on public.invitation_photos
for each row execute function private.storage_link_guard();

create trigger storage_link_guard before insert or update or delete on public.digital_album_photos
for each row execute function private.storage_link_guard();

create trigger storage_link_guard before insert or update or delete on public.photo_wall_photos
for each row execute function private.storage_link_guard();

create trigger storage_unlinked after delete on public.invitation_photos
for each row execute function private.storage_unlinked();

create trigger storage_unlinked after delete on public.digital_album_photos
for each row execute function private.storage_unlinked();

create trigger storage_unlinked after delete on public.photo_wall_photos
for each row execute function private.storage_unlinked();

create trigger storage_project_deleted after delete on public.projects
for each row execute function private.storage_project_deleted();

revoke execute on function public.create_invitation_photo(uuid,text,bigint,text),
  public.create_digital_album_photo(uuid,text,bigint,text) from public, anon, authenticated, service_role;

grant execute on function public.storage_reserve_upload(uuid,text,uuid,text,uuid),
  public.storage_finalize_upload(uuid,bigint,text), public.storage_request_cleanup(uuid),
  public.storage_claim_cleanup(integer), public.storage_finish_cleanup(uuid,uuid,boolean) to service_role;

commit;
