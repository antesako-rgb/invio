-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
CREATE OR REPLACE FUNCTION public.create_project(p_name text, p_type text, p_start_date date, p_custom_type text DEFAULT NULL::text, p_start_time time without time zone DEFAULT NULL::time without time zone, p_location_name text DEFAULT NULL::text, p_location_address text DEFAULT NULL::text)
 RETURNS public.projects
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare
  v_user_id uuid;

  v_project
    public.projects;

  v_type text;
  v_custom_type text;

  v_location_name text;
  v_location_address text;

  v_photo_wall_public_id text;

begin

  -- =========================================
  -- Authentication
  -- =========================================

  v_user_id :=
    auth.uid();

  if v_user_id is null then
    raise exception
      'Authentication required.'
      using errcode = '42501';
  end if;


  -- =========================================
  -- Normalize
  -- =========================================

  v_type :=
    nullif(
      trim(p_type),
      ''
    );

  v_custom_type :=
    nullif(
      trim(p_custom_type),
      ''
    );

  v_location_name :=
    nullif(
      trim(p_location_name),
      ''
    );

  v_location_address :=
    nullif(
      trim(p_location_address),
      ''
    );


  -- =========================================
  -- Project Name Validation
  -- =========================================

  if nullif(
    trim(p_name),
    ''
  ) is null then
    raise exception
      'Project name is required.'
      using errcode = '22023';
  end if;

  if char_length(
    trim(p_name)
  ) > 150 then
    raise exception
      'Project name must not exceed 150 characters.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Event Type Validation
  -- =========================================

  if v_type is null then
    raise exception
      'Event type is required.'
      using errcode = '22023';
  end if;

  if v_type not in (
    'wedding',
    'birthday',
    'baptism',
    'communion',
    'confirmation',
    'business',
    'other'
  ) then
    raise exception
      'Unsupported event type.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Custom Type Validation
  -- =========================================

  if v_type = 'other'
    and v_custom_type is null
  then
    raise exception
      'Custom event type is required.'
      using errcode = '22023';
  end if;

  if v_type <> 'other'
    and v_custom_type is not null
  then
    raise exception
      'Custom event type is allowed only for type "other".'
      using errcode = '22023';
  end if;

  if v_custom_type is not null
    and char_length(
      v_custom_type
    ) > 100
  then
    raise exception
      'Custom event type must not exceed 100 characters.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Start Date Validation
  -- =========================================

  if p_start_date is null then
    raise exception
      'Event start date is required.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Location Validation
  -- =========================================

  if v_location_name is not null
    and char_length(
      v_location_name
    ) > 150
  then
    raise exception
      'Location name must not exceed 150 characters.'
      using errcode = '22023';
  end if;

  if v_location_address is not null
    and char_length(
      v_location_address
    ) > 250
  then
    raise exception
      'Location address must not exceed 250 characters.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Create Project
  -- =========================================

  insert into public.projects (
    owner_id,
    name,
    type,
    custom_type,
    start_date,
    start_time,
    location_name,
    location_address
  )
  values (
    v_user_id,
    trim(p_name),
    v_type,
    v_custom_type,
    p_start_date,
    p_start_time,
    v_location_name,
    v_location_address
  )
  returning *
  into v_project;


  -- =========================================
  -- Photo Wall Public ID
  -- =========================================

  v_photo_wall_public_id :=
    encode(
      extensions.gen_random_bytes(16),
      'hex'
    );


  -- =========================================
  -- Create Photo Wall
  -- =========================================

  insert into public.photo_walls (
    project_id,
    public_id,
    name
  )
  values (
    v_project.id,
    v_photo_wall_public_id,
    v_project.name
  );


  -- =========================================
  -- Return Project
  -- =========================================

  return v_project;

end;

$function$;
ALTER FUNCTION public.create_project(text,text,date,text,time without time zone,text,text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_project(text,text,date,text,time without time zone,text,text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_project(text,text,date,text,time without time zone,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_project(text,text,date,text,time without time zone,text,text) TO postgres;
GRANT EXECUTE ON FUNCTION public.create_project(text,text,date,text,time without time zone,text,text) TO service_role;
