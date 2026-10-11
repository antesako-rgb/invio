-- Additive AFTER 007. Not executed on live DB. No data migration or table changes.
-- Run 008 preflight first. Whole file once as postgres; on error ROLLBACK and inspect.
begin;
set local search_path=pg_catalog,public;
lock table public.projects,public.project_guests,public.seating_plans,public.seating_plan_guests,public.seating_tables,public.seating_assignments in access exclusive mode;
do $preflight$
declare v record; p pg_proc;
begin
 if current_user<>'postgres' then raise exception 'Run reviewed upgrade as postgres'; end if;
 if current_setting('server_version_num')::integer<150000 then raise exception 'PostgreSQL 15+ required'; end if;
 if to_regprocedure('public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb)') is not null then
  raise exception '008 already installed: run verify, do not repeat upgrade';
 end if;
 for v in select * from (values ('public.assign_seating_guests(uuid,bigint,uuid[],uuid,text)','c94862c5435203fb7009f58f6ac83ee8',true),
 ('private.lock_seating_plan(uuid,bigint)','d9e93383f3f0a64e0a3e5a810eeca238',true),
 ('private.lock_seating_project(uuid)','afc87aa28cec1c1f49fd3538e6500da1',true),
 ('private.seating_authorize(uuid)','36cf256df5cbd404712998b6cfed8707',true),
 ('private.assign_seating_guest_internal(uuid,bigint,uuid,uuid,integer,boolean)','51d498ac17afe249bee0b378bf08f029',true),
 ('private.seating_assignment_seat_guard()','61421e7f66c2c8a160251e029819949b',true),
 ('private.seating_table_seat_guard()','311b9d82775b4007141e30e72c018774',true),
 ('public.assign_seating_guest_to_seat(uuid,bigint,uuid,uuid,integer)','ad24a8d4e22110652b6da7c989804e2a',true)) f(signature,source_md5,definer) loop
  select * into p from pg_proc where oid=to_regprocedure(v.signature);
  if not found then raise exception '006 baseline missing: %',v.signature; end if;
  if p.proowner<>'postgres'::regrole or p.prosecdef<>v.definer
   or p.proconfig is distinct from array['search_path=""']::text[]
   or p.prolang<>(select oid from pg_language where lanname='plpgsql')
   or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>v.source_md5
   or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
   or has_function_privilege('authenticated',p.oid,'EXECUTE')<>(left(v.signature,7)='public.') then
   raise exception '006 function/security baseline changed: %',v.signature;
  end if;
 end loop;
 if not exists(select 1 from pg_attribute where attrelid='public.seating_assignments'::regclass
  and attname='seat_number' and atttypid='integer'::regtype and not attnotnull and not atthasdef and not attisdropped)
  or not exists(select 1 from pg_constraint where conrelid='public.seating_assignments'::regclass
   and convalidated and contype='u' and pg_get_constraintdef(oid)='UNIQUE (plan_id, table_id, seat_number)')
  or not exists(select 1 from pg_constraint where conrelid='public.seating_plan_guests'::regclass
   and convalidated and contype='p' and pg_get_constraintdef(oid)='PRIMARY KEY (plan_id, project_guest_id)') then
  raise exception '006 seat column/unique or membership PK missing';
 end if;
 if (select count(*) from pg_trigger where not tgisinternal and tgenabled='O' and (
  (tgrelid='public.seating_assignments'::regclass and tgname='seating_assignment_seat_guard'
   and tgfoid='private.seating_assignment_seat_guard()'::regprocedure)
  or (tgrelid='public.seating_tables'::regclass and tgname='seating_table_seat_guard'
   and tgfoid='private.seating_table_seat_guard()'::regprocedure)))<>2 then raise exception '006 guards missing'; end if;
 for v in select c.oid,c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('project_guests','seating_plans','seating_plan_guests','seating_tables','seating_assignments') loop
  if not v.relrowsecurity or (select count(*) from pg_policy where polrelid=v.oid)<>1
   or not exists(select 1 from pg_policy q where q.polrelid=v.oid and q.polcmd='r' and q.polpermissive
    and q.polroles=array['authenticated'::regrole::oid] and pg_get_expr(q.polqual,q.polrelid)='private.is_project_member(project_id)')
   or has_table_privilege('anon',v.oid,'SELECT,INSERT,UPDATE,DELETE')
   or not has_table_privilege('authenticated',v.oid,'SELECT')
   or has_table_privilege('authenticated',v.oid,'INSERT,UPDATE,DELETE') then raise exception 'RLS/ACL changed: %',v.relname; end if;
 end loop;
 if exists(select 1 from public.seating_tables t where (select count(*) from public.seating_assignments a where a.plan_id=t.plan_id and a.table_id=t.id)>t.capacity)
  or exists(select 1 from public.seating_assignments a join public.seating_tables t on t.plan_id=a.plan_id and t.id=a.table_id where a.seat_number<1 or a.seat_number>t.capacity) then raise exception 'Existing invalid seating data'; end if;
end $preflight$;create function public.assign_seating_guests_to_seats(
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
do $verify$
declare p pg_proc;
begin
 select * into p from pg_proc where oid=to_regprocedure('public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb)');
 if not found then raise exception '008 RPC missing'; end if;
 if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
  or p.prorettype<>'bigint'::regtype or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>'31a6854903f834bb73f062cc70e2f217'
  or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
  or not has_function_privilege('authenticated',p.oid,'EXECUTE') then raise exception '008 RPC/security mismatch'; end if;
end $verify$;
notify pgrst,'reload schema';
commit;
