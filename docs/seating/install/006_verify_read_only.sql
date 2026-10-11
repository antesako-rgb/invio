-- READ ONLY: after 006_seat_assignments_upgrade.sql, as postgres. No personal data.
-- true validity flags; public RPC member_execute=true; private helpers=false; anon/service_execute=false.
select count(*)=1 as seat_column_valid from information_schema.columns
 where table_schema='public' and table_name='seating_assignments' and column_name='seat_number'
 and data_type='integer' and is_nullable='YES' and column_default is null;

select conname,contype,convalidated,pg_get_constraintdef(oid) as definition
from pg_constraint where conrelid='public.seating_assignments'::regclass order by conname;
select count(*)=2 as seat_constraints_present_and_validated from pg_constraint
 where conrelid='public.seating_assignments'::regclass and convalidated
 and conname in ('seating_assignments_seat_range','seating_assignments_one_guest_per_seat');

select tgrelid::regclass as table_name,tgname,tgenabled,pg_get_triggerdef(oid) as definition
from pg_trigger where not tgisinternal
 and tgrelid in ('public.seating_assignments'::regclass,'public.seating_tables'::regclass)
order by tgname;
select count(*)=2 as seat_triggers_enabled from pg_trigger where not tgisinternal and tgenabled='O'
 and ((tgrelid='public.seating_assignments'::regclass and tgname='seating_assignment_seat_guard'
  and tgfoid='private.seating_assignment_seat_guard()'::regprocedure)
 or (tgrelid='public.seating_tables'::regclass and tgname='seating_table_seat_guard'
  and tgfoid='private.seating_table_seat_guard()'::regprocedure));

with expected(signature,client_api,source_md5) as (values
 ('public.assign_seating_guest(uuid,bigint,uuid,uuid)',true,'76f6e4e0f160dbb2aa4d2f014c6e952b'),
 ('public.assign_seating_guest_to_seat(uuid,bigint,uuid,uuid,integer)',true,'ad24a8d4e22110652b6da7c989804e2a'),
 ('private.assign_seating_guest_internal(uuid,bigint,uuid,uuid,integer,boolean)',false,'51d498ac17afe249bee0b378bf08f029'),
 ('private.seating_assignment_seat_guard()',false,'61421e7f66c2c8a160251e029819949b'),
 ('private.seating_table_seat_guard()',false,'311b9d82775b4007141e30e72c018774')
)
select e.signature,p.prosecdef,p.proconfig,
 coalesce(p.proowner='postgres'::regrole and p.prosecdef
  and p.proconfig=array['search_path=""']::text[]
  and md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))=e.source_md5,false) as function_matches_review,
 coalesce(has_function_privilege('anon',p.oid,'EXECUTE'),false) as anon_execute,
 coalesce(has_function_privilege('authenticated',p.oid,'EXECUTE'),false) as member_execute,
 coalesce(has_function_privilege('service_role',p.oid,'EXECUTE'),false) as service_execute,
 coalesce(has_function_privilege('authenticated',p.oid,'EXECUTE')=e.client_api
  and not has_function_privilege('anon',p.oid,'EXECUTE')
  and not has_function_privilege('service_role',p.oid,'EXECUTE'),false) as acl_matches_review
from expected e left join pg_proc p on p.oid=to_regprocedure(e.signature)
order by e.signature;

select c.relname as table_name,c.relrowsecurity as rls_enabled,p.policyname,p.roles,p.cmd,p.qual,
 has_table_privilege('authenticated',c.oid,'SELECT') as member_select,
 has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE') as member_write,
 has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') as anon_access
from pg_class c join pg_namespace n on n.oid=c.relnamespace
left join pg_policies p on p.schemaname=n.nspname and p.tablename=c.relname
where n.nspname='public' and c.relname in ('project_guests','seating_plans','seating_plan_guests','seating_tables','seating_assignments')
order by c.relname,p.policyname;

-- All three invalid_* values and tables_over_capacity must be 0.
select
 (select count(*) from public.seating_assignments a left join public.seating_tables t
  on t.project_id=a.project_id and t.plan_id=a.plan_id and t.id=a.table_id
  where t.id is null or (a.seat_number is not null and (a.seat_number<1 or a.seat_number>t.capacity))) as invalid_seats,
 (select count(*) from public.seating_assignments a left join public.seating_plan_guests g
  on g.project_id=a.project_id and g.plan_id=a.plan_id and g.project_guest_id=a.project_guest_id
  where g.project_guest_id is null) as invalid_participants,
 (select count(*) from (select plan_id,table_id,seat_number from public.seating_assignments
  where seat_number is not null group by plan_id,table_id,seat_number having count(*)>1) d) as invalid_duplicate_seats,
 (select count(*) from public.seating_tables t where (select count(*) from public.seating_assignments a
  where a.plan_id=t.plan_id and a.table_id=t.id)>t.capacity) as tables_over_capacity;

-- Immediately after 006: assignments_after equals assignments_before from preflight,
-- concrete_chairs=0 and table_only_assignments=assignments_after. Later real seat writes change these counts.
select count(*) as assignments_after,count(*) filter(where seat_number is null) as table_only_assignments,
 count(*) filter(where seat_number is not null) as concrete_chairs from public.seating_assignments;
