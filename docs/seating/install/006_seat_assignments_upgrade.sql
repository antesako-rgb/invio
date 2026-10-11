-- REVIEWED CANDIDATE: incremental upgrade AFTER installed 001-004. NOT EXECUTED ON LIVE DB.
-- Run 006_preflight_read_only.sql first. Stop seating writes and take a backup.
-- Execute this WHOLE file once as postgres on one connection. Only the final line commits.
-- On error ROLLBACK and inspect; do not skip guards or rerun the original install bundle.
begin;
set local search_path=pg_catalog,public;
lock table public.projects,public.project_guests,public.seating_plans,public.seating_plan_guests,
 public.seating_tables,public.seating_assignments in access exclusive mode;
do $preflight$
declare v record; v_proc pg_proc;
begin
 if current_user<>'postgres' then raise exception 'Run reviewed upgrade as postgres'; end if;
 if current_setting('server_version_num')::integer<150000 then raise exception 'PostgreSQL 15+ required'; end if;
 if exists(select 1 from pg_attribute where attrelid='public.seating_assignments'::regclass
  and attname='seat_number' and not attisdropped) then
  raise exception '006 already installed or seat_number exists: inspect before upgrade';
 end if;
 for v in select * from (values
 ('public.assign_seating_guest(uuid,bigint,uuid,uuid)','15bf3fdd3411caf8879db382b0d21858',true),
 ('public.manage_seating_table(uuid,bigint,uuid,text,text,text,integer,integer,integer,integer,integer,integer)','bdc0e7b8c9ec70ceec525356e93feabb',true),
 ('private.lock_seating_plan(uuid,bigint)','d9e93383f3f0a64e0a3e5a810eeca238',true),
 ('private.lock_seating_project(uuid)','afc87aa28cec1c1f49fd3538e6500da1',true),
 ('private.seating_authorize(uuid)','36cf256df5cbd404712998b6cfed8707',true),
 ('private.seating_geometry_fits(text,integer,integer,integer,integer,integer,integer,integer)','35b2a3061c7388ff36da53716ff58ddd',false)
 ) e(signature,source_md5,security_definer) loop
  select * into v_proc from pg_proc where oid=to_regprocedure(v.signature);
  if not found then raise exception 'Baseline function missing: %',v.signature; end if;
  if v_proc.proowner<>'postgres'::regrole or v_proc.prosecdef<>v.security_definer
   or v_proc.proconfig is distinct from array['search_path=""']::text[]
   or v_proc.prolang<>(select oid from pg_language where lanname='plpgsql')
   or md5(regexp_replace(v_proc.prosrc,'[[:space:]]+',' ','g'))<>v.source_md5 then
   raise exception 'Baseline changed: %; review instead of removing guard',v.signature;
  end if;
  if has_function_privilege('anon',v_proc.oid,'EXECUTE')
   or has_function_privilege('service_role',v_proc.oid,'EXECUTE')
   or has_function_privilege('authenticated',v_proc.oid,'EXECUTE')<>(left(v.signature,7)='public.') then
   raise exception 'Baseline function ACL changed: %',v.signature;
  end if;
 end loop;
 if to_regprocedure('private.assign_seating_guest_internal(uuid,bigint,uuid,uuid,integer,boolean)') is not null
  or to_regprocedure('private.seating_assignment_seat_guard()') is not null
  or to_regprocedure('private.seating_table_seat_guard()') is not null
  or to_regprocedure('public.assign_seating_guest_to_seat(uuid,bigint,uuid,uuid,integer)') is not null then
  raise exception '006 function name already exists: inspect before upgrade';
 end if;
 if exists(select 1 from pg_trigger where tgrelid in
  ('public.seating_assignments'::regclass,'public.seating_tables'::regclass) and not tgisinternal) then
  raise exception 'Unexpected existing seating assignment/table trigger';
 end if;
 if (select count(*) from pg_constraint where conrelid='public.seating_assignments'::regclass
  and convalidated and (
   (conname='seating_assignments_c1' and contype='p'
    and pg_get_constraintdef(oid)='PRIMARY KEY (plan_id, project_guest_id)')
   or (conname='seating_assignments_c2' and contype='f'
    and pg_get_constraintdef(oid)='FOREIGN KEY (project_id, plan_id, project_guest_id) REFERENCES seating_plan_guests(project_id, plan_id, project_guest_id) ON DELETE CASCADE')
   or (conname='seating_assignments_c3' and contype='f'
    and pg_get_constraintdef(oid)='FOREIGN KEY (project_id, plan_id, table_id) REFERENCES seating_tables(project_id, plan_id, id) ON DELETE CASCADE')
  ))<>3 then raise exception 'Assignment PK/FK baseline changed'; end if;
 if not exists(select 1 from pg_constraint where conrelid='public.seating_tables'::regclass
  and conname='seating_tables_c4' and convalidated and contype='c'
  and pg_get_constraintdef(oid)='CHECK (((capacity >= 1) AND (capacity <= 100)))') then
  raise exception 'Table capacity constraint baseline changed';
 end if;
 for v in select c.oid,c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('project_guests','seating_plans','seating_plan_guests','seating_tables','seating_assignments') loop
  if not v.relrowsecurity or (select count(*) from pg_policy where polrelid=v.oid)<>1
   or not exists(select 1 from pg_policy p where p.polrelid=v.oid and p.polcmd='r'
    and p.polpermissive and p.polroles=array['authenticated'::regrole::oid]
    and pg_get_expr(p.polqual,p.polrelid)='private.is_project_member(project_id)')
   or has_table_privilege('anon',v.oid,'SELECT,INSERT,UPDATE,DELETE')
   or not has_table_privilege('authenticated',v.oid,'SELECT')
   or has_table_privilege('authenticated',v.oid,'INSERT,UPDATE,DELETE') then
   raise exception 'Member RLS/ACL baseline changed: %',v.relname;
  end if;
 end loop;
 if exists(select 1 from public.seating_tables t where (select count(*) from public.seating_assignments a
  where a.plan_id=t.plan_id and a.table_id=t.id)>t.capacity) then
  raise exception 'Existing table exceeds capacity: inspect before upgrade';
 end if;
end $preflight$;

-- Transaction-local snapshots contain IDs only; they disappear on COMMIT/ROLLBACK.
create temporary table seating_006_assignments_before on commit drop as
 select project_id,plan_id,project_guest_id,table_id from public.seating_assignments;
create temporary table seating_006_plans_before on commit drop as
 select id,project_id,revision from public.seating_plans;

-- Existing assignments remain table-only (NULL seat_number). No automatic seating.
alter table public.seating_assignments add column seat_number integer;
alter table public.seating_assignments add constraint seating_assignments_seat_range
 check(seat_number is null or seat_number between 1 and 100);
alter table public.seating_assignments add constraint seating_assignments_one_guest_per_seat
 unique(plan_id,table_id,seat_number);

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

-- Same signature/output as 001-004. Same table preserves a chair; moving clears it.
create or replace function public.assign_seating_guest(
 p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_table_id uuid
) returns bigint language plpgsql security definer set search_path='' as $assignment$
begin
 return private.assign_seating_guest_internal(p_plan_id,p_revision,p_guest_id,p_table_id,null,true);
end $assignment$;

create or replace function public.assign_seating_guest_to_seat(
 p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_table_id uuid,p_seat_number integer
) returns bigint language plpgsql security definer set search_path='' as $assignment$
begin
 return private.assign_seating_guest_internal(p_plan_id,p_revision,p_guest_id,p_table_id,p_seat_number,false);
end $assignment$;

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

create trigger seating_assignment_seat_guard before insert or update
 on public.seating_assignments for each row execute function private.seating_assignment_seat_guard();
create trigger seating_table_seat_guard before update of capacity,shape
 on public.seating_tables for each row execute function private.seating_table_seat_guard();

-- manage_seating_table body/signature stays unchanged; its UPDATE invokes the table guard.
-- Member SELECT policies and table grants stay unchanged; only authenticated gets the new RPC.
revoke all on function private.assign_seating_guest_internal(uuid,bigint,uuid,uuid,integer,boolean) from public,anon,authenticated,service_role;
revoke all on function private.seating_assignment_seat_guard() from public,anon,authenticated,service_role;
revoke all on function private.seating_table_seat_guard() from public,anon,authenticated,service_role;
revoke all on function public.assign_seating_guest(uuid,bigint,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guest(uuid,bigint,uuid,uuid) to authenticated;
revoke all on function public.assign_seating_guest_to_seat(uuid,bigint,uuid,uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guest_to_seat(uuid,bigint,uuid,uuid,integer) to authenticated;

do $verify$
declare v record;
begin
 if exists(select project_id,plan_id,project_guest_id,table_id from public.seating_assignments
   except select * from pg_temp.seating_006_assignments_before)
  or exists(select * from pg_temp.seating_006_assignments_before
   except select project_id,plan_id,project_guest_id,table_id from public.seating_assignments)
  or exists(select 1 from public.seating_assignments where seat_number is not null) then
  raise exception 'Existing assignments changed during 006';
 end if;
 if exists(select id,project_id,revision from public.seating_plans
   except select * from pg_temp.seating_006_plans_before)
  or exists(select * from pg_temp.seating_006_plans_before
   except select id,project_id,revision from public.seating_plans) then
  raise exception 'Existing plan revisions changed during 006';
 end if;
 if not exists(select 1 from pg_attribute where attrelid='public.seating_assignments'::regclass
  and attname='seat_number' and atttypid='integer'::regtype and not attnotnull
  and not atthasdef and not attisdropped) then raise exception 'Invalid seat column'; end if;
 if (select count(*) from pg_constraint where conrelid='public.seating_assignments'::regclass
  and convalidated and conname in ('seating_assignments_seat_range','seating_assignments_one_guest_per_seat'))<>2 then
  raise exception 'Seat constraints missing';
 end if;
 if (select count(*) from pg_trigger where not tgisinternal and tgenabled='O' and (
  (tgrelid='public.seating_assignments'::regclass and tgname='seating_assignment_seat_guard'
   and tgfoid='private.seating_assignment_seat_guard()'::regprocedure)
  or (tgrelid='public.seating_tables'::regclass and tgname='seating_table_seat_guard'
   and tgfoid='private.seating_table_seat_guard()'::regprocedure)))<>2 then
  raise exception 'Seat triggers missing';
 end if;
 for v in select * from (values
  ('public.assign_seating_guest(uuid,bigint,uuid,uuid)',true),
  ('public.assign_seating_guest_to_seat(uuid,bigint,uuid,uuid,integer)',true),
  ('private.assign_seating_guest_internal(uuid,bigint,uuid,uuid,integer,boolean)',false),
  ('private.seating_assignment_seat_guard()',false),
  ('private.seating_table_seat_guard()',false)
 ) f(signature,client_api) loop
  if not exists(select 1 from pg_proc where oid=to_regprocedure(v.signature) and prosecdef
   and proowner='postgres'::regrole and proconfig=array['search_path=""']::text[])
   or has_function_privilege('anon',v.signature,'EXECUTE')
   or has_function_privilege('service_role',v.signature,'EXECUTE')
   or has_function_privilege('authenticated',v.signature,'EXECUTE')<>v.client_api then
   raise exception 'Unexpected function security/ACL: %',v.signature;
  end if;
 end loop;
end $verify$;

-- Delivered only after COMMIT; refreshes PostgREST's RPC/schema cache.
notify pgrst,'reload schema';
commit;
