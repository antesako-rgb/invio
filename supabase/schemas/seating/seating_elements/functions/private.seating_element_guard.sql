CREATE OR REPLACE FUNCTION private.seating_element_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v public.seating_plans;
begin
 if tg_op='UPDATE' then
  if (new.id,new.project_id,new.plan_id,new.kind) is distinct from (old.id,old.project_id,old.plan_id,old.kind) then raise exception 'Element identity immutable' using errcode='22023'; end if;
  if old.locked and (new.x_cm,new.y_cm,new.width_cm,new.height_cm,new.rotation_deg) is distinct from (old.x_cm,old.y_cm,old.width_cm,old.height_cm,old.rotation_deg) then raise exception 'Element locked' using errcode='22023'; end if;
 end if;
 select * into v from public.seating_plans where id=new.plan_id and project_id=new.project_id for update;
 if not found then raise exception 'Plan missing' using errcode='P0002'; end if;
 if not private.seating_element_valid(to_jsonb(new)-array['id','project_id','plan_id'],v.width_cm,v.height_cm) then raise exception 'Invalid element geometry' using errcode='22023'; end if;
 return new;
end $function$
;
ALTER FUNCTION private.seating_element_guard() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_element_guard() FROM PUBLIC, anon, authenticated, service_role;
