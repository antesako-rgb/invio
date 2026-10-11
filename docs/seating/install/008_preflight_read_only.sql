-- READ ONLY. After installed 007, as postgres.
begin read only;
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
end $preflight$;rollback;
