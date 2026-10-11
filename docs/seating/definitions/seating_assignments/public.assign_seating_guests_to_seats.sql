-- SAVE/REVIEW ONLY; use 008_manual_bulk_upgrade.sql for installation.
create function public.assign_seating_guests_to_seats(
 p_plan_id uuid,p_revision bigint,p_table_id uuid,p_seats jsonb
) returns bigint language plpgsql security definer set search_path='' as $manual$
declare v_plan public.seating_plans; v_ids uuid[]; v_capacity integer; v_next bigint; v_item record;
begin
 v_plan:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_revision<1 or p_revision>=9007199254740991 or p_table_id is null
  or p_seats is null or jsonb_typeof(p_seats)<>'array' then
  raise exception 'Invalid batch arguments' using errcode='22023';
 end if;
 if jsonb_array_length(p_seats)<1 or jsonb_array_length(p_seats)>100 then
  raise exception 'Invalid batch arguments' using errcode='22023';
 end if;
 if exists(select 1 from jsonb_array_elements(p_seats) e where jsonb_typeof(e)<>'object') then
  raise exception 'Invalid batch arguments' using errcode='22023';
 end if;
 if exists(select 1 from jsonb_array_elements(p_seats) e where
  (e-array['guest_id','seat_number'])<>'{}'::jsonb
  or jsonb_typeof(e->'guest_id') is distinct from 'string'
  or jsonb_typeof(e->'seat_number') is distinct from 'number') then
  raise exception 'Invalid batch arguments' using errcode='22023';
 end if;
 if exists(select 1 from jsonb_array_elements(p_seats) e where
  (e->>'guest_id')!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  or (e->>'seat_number')::numeric<>trunc((e->>'seat_number')::numeric)
  or (e->>'seat_number')::numeric not between 1 and 100) then
  raise exception 'Seat outside table capacity' using errcode='22023';
 end if;
 select array_agg((e->>'guest_id')::uuid) into v_ids from jsonb_array_elements(p_seats) e;
 if (select count(distinct id) from unnest(v_ids) g(id))<>cardinality(v_ids) then
  raise exception 'Invalid batch arguments' using errcode='22023';
 end if;
 if (select count(distinct (e->>'seat_number')::integer) from jsonb_array_elements(p_seats) e)<>cardinality(v_ids) then
  raise exception 'Seat occupied' using errcode='23505';
 end if;
 perform 1 from public.project_guests where project_id=v_plan.project_id and id=any(v_ids) order by id for share;
 if (select count(*) from public.project_guests where project_id=v_plan.project_id and id=any(v_ids) and archived_at is null)<>cardinality(v_ids) then
  raise exception 'Active person missing' using errcode='22023';
 end if;
 select capacity into v_capacity from public.seating_tables
  where project_id=v_plan.project_id and plan_id=v_plan.id and id=p_table_id for update;
 if not found then raise exception 'Table missing' using errcode='22023'; end if;
 if exists(select 1 from jsonb_array_elements(p_seats) e where (e->>'seat_number')::integer>v_capacity) then
  raise exception 'Seat outside table capacity' using errcode='22023';
 end if;
 if (select count(*) from public.seating_assignments where plan_id=v_plan.id and table_id=p_table_id)
  +(select count(*) from unnest(v_ids) g(id) where not exists(select 1 from public.seating_assignments a
   where a.plan_id=v_plan.id and a.table_id=p_table_id and a.project_guest_id=g.id))>v_capacity then
  raise exception 'Table full' using errcode='22023';
 end if;
 -- Occupied chairs cannot be displaced, even by another selected guest. No implicit swap.
 if exists(select 1 from jsonb_array_elements(p_seats) e join public.seating_assignments a
  on a.plan_id=v_plan.id and a.table_id=p_table_id and a.seat_number=(e->>'seat_number')::integer
  where a.project_guest_id<>(e->>'guest_id')::uuid) then
  raise exception 'Seat occupied' using errcode='23505';
 end if;
 insert into public.seating_plan_guests(project_id,plan_id,project_guest_id)
  select v_plan.project_id,v_plan.id,g.id from unnest(v_ids) g(id) on conflict(plan_id,project_guest_id) do nothing;
 for v_item in select (e->>'guest_id')::uuid guest_id,(e->>'seat_number')::integer seat_number from jsonb_array_elements(p_seats) e loop
  insert into public.seating_assignments(project_id,plan_id,project_guest_id,table_id,seat_number)
   values(v_plan.project_id,v_plan.id,v_item.guest_id,p_table_id,v_item.seat_number)
   on conflict(plan_id,project_guest_id) do update set table_id=excluded.table_id,seat_number=excluded.seat_number;
 end loop;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v_plan.id returning revision into v_next;
 return v_next;
end $manual$;
revoke all on function public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb) to authenticated;
