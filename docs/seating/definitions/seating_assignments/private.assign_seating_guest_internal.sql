-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function private.assign_seating_guest_internal(
 p_plan_id uuid, p_revision bigint, p_guest_id uuid, p_table_id uuid,
 p_seat_number integer, p_preserve_existing_seat boolean
) returns bigint language plpgsql security definer set search_path='' as $assignment$
declare
 v_plan public.seating_plans;
 v_existing public.seating_assignments;
 v_has_existing boolean;
 v_archived timestamptz;
 v_capacity integer;
 v_seat integer;
 v_next bigint;
begin
 v_plan := private.lock_seating_plan(p_plan_id,p_revision);
 if p_guest_id is null or p_preserve_existing_seat is null then
  raise exception 'Invalid assignment arguments' using errcode='22023';
 end if;
 if p_table_id is null then
  if p_seat_number is not null then
   raise exception 'Seat requires a table' using errcode='22023';
  end if;
  delete from public.seating_assignments where plan_id=v_plan.id and project_guest_id=p_guest_id;
 else
  select * into v_existing from public.seating_assignments
   where plan_id=v_plan.id and project_guest_id=p_guest_id for update;
  v_has_existing := found;
  select archived_at into v_archived from public.project_guests
   where project_id=v_plan.project_id and id=p_guest_id for share;
  if not found then raise exception 'Person missing' using errcode='22023'; end if;
  -- Archived people may release their existing chair, but may not gain/move assignments.
  if v_archived is not null and not (
   not p_preserve_existing_seat and p_seat_number is null and v_has_existing
   and v_existing.table_id=p_table_id
  ) then raise exception 'Active person missing' using errcode='22023'; end if;
  perform 1 from public.seating_plan_guests
   where project_id=v_plan.project_id and plan_id=v_plan.id and project_guest_id=p_guest_id;
  if not found then raise exception 'Participant missing' using errcode='23503'; end if;
  select capacity into v_capacity from public.seating_tables
   where project_id=v_plan.project_id and plan_id=v_plan.id and id=p_table_id for update;
  if not found then raise exception 'Table missing' using errcode='22023'; end if;
  v_seat := p_seat_number;
  if p_preserve_existing_seat and v_has_existing and v_existing.table_id=p_table_id then
   v_seat := v_existing.seat_number;
  end if;
  if v_seat is not null and (v_seat<1 or v_seat>v_capacity) then
   raise exception 'Seat outside table capacity' using errcode='22023';
  end if;
  if v_seat is not null and exists (
   select 1 from public.seating_assignments where plan_id=v_plan.id
    and table_id=p_table_id and seat_number=v_seat and project_guest_id<>p_guest_id
  ) then raise exception 'Seat occupied' using errcode='23505'; end if;
  if (select count(*) from public.seating_assignments where plan_id=v_plan.id
       and table_id=p_table_id and project_guest_id<>p_guest_id)>=v_capacity then
   raise exception 'Table full' using errcode='22023';
  end if;
  insert into public.seating_assignments(project_id,plan_id,project_guest_id,table_id,seat_number)
   values(v_plan.project_id,v_plan.id,p_guest_id,p_table_id,v_seat)
   on conflict(plan_id,project_guest_id) do update
    set table_id=excluded.table_id,seat_number=excluded.seat_number;
 end if;
 update public.seating_plans set revision=revision+1,updated_at=now()
  where id=v_plan.id returning revision into v_next;
 return v_next;
end $assignment$;
