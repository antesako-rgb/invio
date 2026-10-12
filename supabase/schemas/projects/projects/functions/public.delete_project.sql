-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
CREATE OR REPLACE FUNCTION public.delete_project(p_project_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare
  v_user_id uuid;
  v_deleted_id uuid;

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
  -- Permission
  -- =========================================

  if not private.is_project_owner(
    p_project_id,
    v_user_id
  ) then
    raise exception
      'Project not found or access denied.'
      using errcode = '42501';
  end if;


  -- =========================================
  -- Delete Project
  -- =========================================

  delete from public.projects
  where id =
    p_project_id
  returning id
  into v_deleted_id;


  -- =========================================
  -- Not Found
  -- =========================================

  if v_deleted_id is null then
    raise exception
      'Project not found.'
      using errcode = 'P0002';
  end if;

end;

$function$;
ALTER FUNCTION public.delete_project(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.delete_project(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_project(uuid) TO postgres;
GRANT EXECUTE ON FUNCTION public.delete_project(uuid) TO service_role;
