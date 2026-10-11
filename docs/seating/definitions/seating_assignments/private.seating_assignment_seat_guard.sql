-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function private.seating_assignment_seat_guard()
returns trigger language plpgsql security definer set search_path='' as $seat_guard$
declare v_capacity integer;
begin
 -- Serializes capacity checks even for trusted direct DML; clients still use RPCs.
 perform 1 from public.seating_plans where project_id=new.project_id and id=new.plan_id for update;
 if not found then raise exception 'Plan missing' using errcode='23503'; end if;
 select capacity into v_capacity from public.seating_tables
  where project_id=new.project_id and plan_id=new.plan_id and id=new.table_id for update;
 if not found then raise exception 'Table missing' using errcode='23503'; end if;
 if new.seat_number is not null and (new.seat_number<1 or new.seat_number>v_capacity) then
  raise exception 'Seat outside table capacity' using errcode='22023';
 end if;
 if (select count(*) from public.seating_assignments where plan_id=new.plan_id
     and table_id=new.table_id and project_guest_id<>new.project_guest_id)>=v_capacity then
  raise exception 'Table full' using errcode='22023';
 end if;
 return new;
end $seat_guard$;
