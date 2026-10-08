-- SAVE / REVIEW ONLY. Live catalog export 2026-10-08; DO NOT EXECUTE again.
CREATE OR REPLACE FUNCTION private.digital_album_document_photo_ids(p_document jsonb)
 RETURNS SETOF uuid
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$

declare
  v_page jsonb;
  v_slot jsonb;
  v_collection text;
  v_id uuid;

begin

  -- =========================================
  -- Document Validation
  -- =========================================

  if p_document is null
    or jsonb_typeof(
      p_document
    ) is distinct from 'object'
    or jsonb_typeof(
      p_document -> 'theme'
    ) is distinct from 'string'
    or jsonb_typeof(
      p_document -> 'pages'
    ) is distinct from 'array' then

    raise exception
      'Invalid album document.'
      using errcode = '22023';

  end if;


  -- =========================================
  -- Pages
  -- =========================================

  for v_page in

    select value
    from jsonb_array_elements(
      p_document -> 'pages'
    )

  loop

    if jsonb_typeof(
      v_page
    ) is distinct from 'object'
      or jsonb_typeof(
        v_page -> 'photos'
      ) is distinct from 'array' then

      raise exception
        'Invalid album page photos.'
        using errcode = '22023';

    end if;


    -- =========================================
    -- Photo Collections
    -- =========================================

    foreach v_collection in array
      array[
        'photos',
        'unplacedPhotos'
      ]

    loop

      -- Legacy documents may not contain
      -- unplacedPhotos.

      if v_collection = 'unplacedPhotos'
        and not (
          v_page ? v_collection
        ) then
        continue;
      end if;

      if jsonb_typeof(
        v_page -> v_collection
      ) is distinct from 'array' then

        raise exception
          'Invalid album photo slots.'
          using errcode = '22023';

      end if;


      -- =========================================
      -- Photo Slots
      -- =========================================

      for v_slot in

        select value
        from jsonb_array_elements(
          v_page -> v_collection
        )

      loop

        if jsonb_typeof(
          v_slot
        ) is distinct from 'object'
          or not (
            v_slot ? 'photoId'
          ) then

          raise exception
            'Invalid album photo slot.'
            using errcode = '22023';

        end if;

        if v_slot -> 'photoId' =
          'null'::jsonb then
          continue;
        end if;

        if jsonb_typeof(
          v_slot -> 'photoId'
        ) is distinct from 'string' then

          raise exception
            'Invalid album photo ID.'
            using errcode = '22023';

        end if;


        -- =========================================
        -- UUID
        -- =========================================

        begin

          v_id :=
            (
              v_slot ->> 'photoId'
            )::uuid;

        exception
          when invalid_text_representation then

            raise exception
              'Invalid album photo ID.'
              using errcode = '22023';

        end;

        return next
          v_id;

      end loop;

    end loop;

  end loop;

end;

$function$
;
