CREATE OR REPLACE FUNCTION private.lock_seating_project(p_project uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ begin perform private.seating_authorize(p_project); perform 1 from public.projects where id=p_project for update; if not found then raise exception 'Project missing' using errcode='P0002'; end if; end $function$
;
ALTER FUNCTION private.lock_seating_project(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.lock_seating_project(uuid) FROM PUBLIC, anon, authenticated, service_role;
