-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.assign_seating_guest(
 p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_table_id uuid
) returns bigint language plpgsql security definer set search_path='' as $assignment$
begin
 return private.assign_seating_guest_internal(p_plan_id,p_revision,p_guest_id,p_table_id,null,true);
end $assignment$;
