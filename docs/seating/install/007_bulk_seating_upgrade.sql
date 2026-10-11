-- Incremental AFTER 006. Not executed on live DB. Whole file once as postgres.
-- First run 007_preflight_read_only.sql. On error ROLLBACK and inspect.
-- Adds RPC only. No guest/assignment data migration or table changes.
begin;
set local search_path=pg_catalog,public;
lock table public.projects,public.project_guests,public.seating_plans,public.seating_plan_guests,public.seating_tables,public.seating_assignments in access exclusive mode;
do $preflight$
declare v record; p pg_proc;
begin
 if current_user<>'postgres' then raise exception 'Run reviewed upgrade as postgres'; end if;
 if current_setting('server_version_num')::integer<150000 then raise exception 'PostgreSQL 15+ required'; end if;
 if to_regprocedure('public.assign_seating_guests(uuid,bigint,uuid[],uuid,text)') is not null then
  raise exception '007 already installed: run verify, do not repeat upgrade';
 end if;
 for v in select * from (values ('private.lock_seating_plan(uuid,bigint)','d9e93383f3f0a64e0a3e5a810eeca238',true),
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
end $preflight$;
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
do $verify$
declare p pg_proc;
begin
 select * into p from pg_proc where oid=to_regprocedure('public.assign_seating_guests(uuid,bigint,uuid[],uuid,text)');
 if not found then raise exception '007 RPC missing'; end if;
 if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
  or p.prorettype<>'bigint'::regtype or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>'c94862c5435203fb7009f58f6ac83ee8'
  or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
  or not has_function_privilege('authenticated',p.oid,'EXECUTE') then raise exception '007 RPC/security mismatch'; end if;
end $verify$;
notify pgrst,'reload schema';
commit;
