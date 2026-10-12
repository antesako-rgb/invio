-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
CREATE OR REPLACE FUNCTION private.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name
  )
  values (
    new.id,

    lower(
      trim(new.email)
    ),

    nullif(
      trim(
        new.raw_user_meta_data ->> 'first_name'
      ),
      ''
    ),

    nullif(
      trim(
        new.raw_user_meta_data ->> 'last_name'
      ),
      ''
    )
  );

  return new;
end;

$function$;
ALTER FUNCTION private.handle_new_user() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.handle_new_user() TO postgres;
