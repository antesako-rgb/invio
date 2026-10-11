-- SAVE/REVIEW ONLY. Install using 007_bulk_seating_upgrade.sql.
create function public.assign_seating_guests(
 p_plan_id uuid,p_revision bigint,p_guest_ids uuid[],p_table_id uuid,p_mode text
) returns bigint language plpgsql security definer set search_path='' as $batch$
declare
 v_plan public.seating_plans;
 v_guest uuid;
 v_capacity integer;
 v_seat integer;
 v_next bigint;
begin
 v_plan := private.lock_seating_plan(p_plan_id,p_revision);
 if p_revision<1 or p_revision>=9007199254740991 or p_guest_ids is null
  or cardinality(p_guest_ids)<1 or cardinality(p_guest_ids)>100
  or array_ndims(p_guest_ids)<>1 or array_position(p_guest_ids,null) is not null
  or (select count(distinct id) from unnest(p_guest_ids) g(id))<>cardinality(p_guest_ids)
  or p_mode is null or p_mode not in ('auto','include')
  or (p_mode='include' and p_table_id is not null)
  or (p_mode<>'include' and p_table_id is null) then
  raise exception 'Invalid batch arguments' using errcode='22023';
 end if;
 -- Same project and active identity are checked before ANY membership/assignment change.
 perform 1 from public.project_guests where project_id=v_plan.project_id and id=any(p_guest_ids)
  order by id for share;
 if (select count(*) from public.project_guests where project_id=v_plan.project_id
  and id=any(p_guest_ids) and archived_at is null)<>cardinality(p_guest_ids) then
  raise exception 'Active person missing' using errcode='22023';
 end if;
 if p_mode<>'include' then
  select capacity into v_capacity from public.seating_tables
   where project_id=v_plan.project_id and plan_id=v_plan.id and id=p_table_id for update;
  if not found then raise exception 'Table missing' using errcode='22023'; end if;
  -- NULL-seat members also consume capacity. Existing target members are counted only once.
  if (select count(*) from public.seating_assignments where plan_id=v_plan.id and table_id=p_table_id)
   + (select count(*) from unnest(p_guest_ids) g(id) where not exists(
    select 1 from public.seating_assignments a where a.plan_id=v_plan.id and a.table_id=p_table_id and a.project_guest_id=g.id))>v_capacity then
   raise exception 'Table full' using errcode='22023';
  end if;
 end if;
 insert into public.seating_plan_guests(project_id,plan_id,project_guest_id)
  select v_plan.project_id,v_plan.id,g.id from unnest(p_guest_ids) g(id)
  on conflict(plan_id,project_guest_id) do nothing;
 if p_mode<>'include' then
  -- Input order matches the preview. Retain each existing concrete target seat.
  foreach v_guest in array p_guest_ids loop
   v_seat := null;
   if p_mode='auto' then
    select seat_number into v_seat from public.seating_assignments
     where plan_id=v_plan.id and table_id=p_table_id and project_guest_id=v_guest;
    if v_seat is null then
     select n into v_seat from generate_series(1,v_capacity) s(n)
      where not exists(select 1 from public.seating_assignments a
       where a.plan_id=v_plan.id and a.table_id=p_table_id and a.seat_number=s.n)
      order by n limit 1;
     if v_seat is null then raise exception 'Table full' using errcode='22023'; end if;
    end if;
   end if;
   insert into public.seating_assignments(project_id,plan_id,project_guest_id,table_id,seat_number)
    values(v_plan.project_id,v_plan.id,v_guest,p_table_id,v_seat)
    on conflict(plan_id,project_guest_id) do update set table_id=excluded.table_id,seat_number=excluded.seat_number;
  end loop;
 end if;
 update public.seating_plans set revision=revision+1,updated_at=now()
  where id=v_plan.id returning revision into v_next;
 return v_next;
end $batch$;
revoke all on function public.assign_seating_guests(uuid,bigint,uuid[],uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guests(uuid,bigint,uuid[],uuid,text) to authenticated;
