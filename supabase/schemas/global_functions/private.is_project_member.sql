-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
CREATE OR REPLACE FUNCTION private.is_project_member(p_project_id uuid, p_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

  select
    private.is_project_owner(
      p_project_id,
      p_user_id
    )
    or exists (
      select 1
      from public.project_collaborators
      where project_id = p_project_id
        and profile_id = p_user_id
    );

$function$;
ALTER FUNCTION private.is_project_member(uuid,uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.is_project_member(uuid,uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_project_member(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_project_member(uuid,uuid) TO postgres;
