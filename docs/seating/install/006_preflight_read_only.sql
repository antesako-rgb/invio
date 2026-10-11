-- READ ONLY: before 006_seat_assignments_upgrade.sql. No personal data or writes.
-- All ready_* values must be true before applying the upgrade.
select current_user='postgres' as ready_postgres,
 current_setting('server_version_num')::integer>=150000 as ready_postgresql_15,
 not exists(select 1 from information_schema.columns where table_schema='public'
  and table_name='seating_assignments' and column_name='seat_number') as ready_not_installed;

with expected(signature,source_md5,security_definer) as (values
 ('public.assign_seating_guest(uuid,bigint,uuid,uuid)','15bf3fdd3411caf8879db382b0d21858',true),
 ('public.manage_seating_table(uuid,bigint,uuid,text,text,text,integer,integer,integer,integer,integer,integer)','bdc0e7b8c9ec70ceec525356e93feabb',true),
 ('private.lock_seating_plan(uuid,bigint)','d9e93383f3f0a64e0a3e5a810eeca238',true),
 ('private.lock_seating_project(uuid)','afc87aa28cec1c1f49fd3538e6500da1',true),
 ('private.seating_authorize(uuid)','36cf256df5cbd404712998b6cfed8707',true),
 ('private.seating_geometry_fits(text,integer,integer,integer,integer,integer,integer,integer)','35b2a3061c7388ff36da53716ff58ddd',false)
)
select e.signature,e.source_md5 as reviewed_source_md5,
 md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g')) as current_source_md5,
 coalesce(p.proowner='postgres'::regrole and l.lanname='plpgsql'
  and p.prosecdef=e.security_definer and p.proconfig=array['search_path=""']::text[]
  and md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))=e.source_md5,false) as ready_baseline,
 coalesce(not has_function_privilege('anon',p.oid,'EXECUTE')
  and not has_function_privilege('service_role',p.oid,'EXECUTE')
  and has_function_privilege('authenticated',p.oid,'EXECUTE')=(left(e.signature,7)='public.'),false) as ready_function_acl
from expected e left join pg_proc p on p.oid=to_regprocedure(e.signature)
left join pg_language l on l.oid=p.prolang order by e.signature;

select c.relname,c.relrowsecurity,
 (select count(*) from pg_policy p where p.polrelid=c.oid) as policy_count,
 exists(select 1 from pg_policy p where p.polrelid=c.oid and p.polcmd='r'
  and p.polpermissive and p.polroles=array['authenticated'::regrole::oid]
  and pg_get_expr(p.polqual,p.polrelid)='private.is_project_member(project_id)') as ready_member_policy,
 not has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') as ready_no_anon_access,
 has_table_privilege('authenticated',c.oid,'SELECT')
  and not has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE') as ready_client_select_only
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('project_guests','seating_plans','seating_plan_guests','seating_tables','seating_assignments')
order by c.relname;

select count(*) as assignments_before from public.seating_assignments;
select count(*) as tables_over_capacity -- Expected 0.
from public.seating_tables t where (select count(*) from public.seating_assignments a
 where a.plan_id=t.plan_id and a.table_id=t.id)>t.capacity;

select c.conname,c.contype,c.convalidated,pg_get_constraintdef(c.oid) as definition
from pg_constraint c where c.conrelid in ('public.seating_assignments'::regclass,'public.seating_tables'::regclass)
order by c.conrelid::regclass::text,c.conname;
select tgrelid::regclass as table_name,tgname,tgenabled,pg_get_triggerdef(oid) as definition
from pg_trigger where tgrelid in ('public.seating_assignments'::regclass,'public.seating_tables'::regclass)
 and not tgisinternal; -- Baseline expects no user triggers on these two tables.
