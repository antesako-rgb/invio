CREATE OR REPLACE FUNCTION private.seating_authorize(p_project uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ begin if auth.uid() is null or private.is_project_member(p_project,auth.uid()) is not true then raise exception 'Access denied' using errcode='42501'; end if; end $function$
;
ALTER FUNCTION private.seating_authorize(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_authorize(uuid) FROM PUBLIC, anon, authenticated, service_role;
