-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/activation/018_ACTIVATE.sql
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
