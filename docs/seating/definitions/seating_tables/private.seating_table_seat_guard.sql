-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function private.seating_table_seat_guard()
returns trigger language plpgsql security definer set search_path='' as $seat_guard$
begin
 if new.capacity is not distinct from old.capacity and new.shape is not distinct from old.shape then
  return new;
 end if;
 perform 1 from public.seating_plans where project_id=new.project_id and id=new.plan_id for update;
 if not found then raise exception 'Plan missing' using errcode='23503'; end if;
 if (select count(*) from public.seating_assignments where plan_id=new.plan_id and table_id=new.id)>new.capacity then
  raise exception 'Capacity below occupancy' using errcode='22023';
 end if;
 if exists(select 1 from public.seating_assignments
  where plan_id=new.plan_id and table_id=new.id and seat_number>new.capacity) then
  raise exception 'Seat would be removed' using errcode='22023';
 end if;
 if new.shape is distinct from old.shape and exists(select 1 from public.seating_assignments
  where plan_id=new.plan_id and table_id=new.id and seat_number is not null) then
  raise exception 'Seated guests prevent shape change' using errcode='22023';
 end if;
 return new;
end $seat_guard$;
