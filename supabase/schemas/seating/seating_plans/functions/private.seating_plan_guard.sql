CREATE OR REPLACE FUNCTION private.seating_plan_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ begin if new.id is distinct from old.id or new.project_id is distinct from old.project_id then raise exception 'Plan identity immutable' using errcode='22023'; end if; if new.rsvp_invitation_id is distinct from old.rsvp_invitation_id and new.revision=old.revision then new.revision:=old.revision+1;new.updated_at:=now(); end if; if (new.width_cm,new.height_cm) is distinct from (old.width_cm,old.height_cm) and exists(select 1 from public.seating_elements e where e.plan_id=new.id and not private.seating_geometry_fits('rectangle',e.x_cm,e.y_cm,e.width_cm,e.height_cm,e.rotation_deg,new.width_cm,new.height_cm)) then raise exception 'Room too small' using errcode='22023'; end if; return new; end $function$
;
ALTER FUNCTION private.seating_plan_guard() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_plan_guard() FROM PUBLIC, anon, authenticated, service_role;
