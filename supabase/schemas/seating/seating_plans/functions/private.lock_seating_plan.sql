CREATE OR REPLACE FUNCTION private.lock_seating_plan(p_plan uuid, p_revision bigint)
 RETURNS seating_plans
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v public.seating_plans; v_project uuid; begin select project_id into v_project from public.seating_plans where id=p_plan; perform private.lock_seating_project(v_project); select * into v from public.seating_plans where id=p_plan for update; if not found then raise exception 'Plan missing' using errcode='P0002'; end if; if p_revision is null or v.revision<>p_revision then raise exception 'Revision conflict' using errcode='PT409'; end if; return v; end $function$
;
ALTER FUNCTION private.lock_seating_plan(uuid,bigint) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.lock_seating_plan(uuid,bigint) FROM PUBLIC, anon, authenticated, service_role;
