-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
CREATE OR REPLACE FUNCTION private.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$

begin
  new.updated_at = now();

  return new;
end;

$function$;
ALTER FUNCTION private.update_timestamp() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.update_timestamp() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.update_timestamp() TO postgres;
