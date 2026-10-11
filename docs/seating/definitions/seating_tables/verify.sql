-- READ ONLY metadata only.
select conname,pg_get_constraintdef(oid) from pg_constraint where conrelid='public.seating_tables'::regclass;
select policyname,cmd,roles,qual from pg_policies where schemaname='public' and tablename='seating_tables';
select has_table_privilege('authenticated','public.seating_tables','SELECT') as member_select,has_table_privilege('authenticated','public.seating_tables','INSERT') as direct_insert,has_table_privilege('anon','public.seating_tables','SELECT') as anon_select;

-- 006 guard protects capacity/shape changes through existing manage_seating_table.
select tgrelid::regclass as table_name,tgname,tgenabled,pg_get_triggerdef(oid) as definition
from pg_trigger where not tgisinternal
 and tgrelid in ('public.seating_assignments'::regclass,'public.seating_tables'::regclass)
order by tgname;
select count(*)=2 as seat_triggers_enabled from pg_trigger where not tgisinternal and tgenabled='O'
 and ((tgrelid='public.seating_assignments'::regclass and tgname='seating_assignment_seat_guard'
  and tgfoid='private.seating_assignment_seat_guard()'::regprocedure)
 or (tgrelid='public.seating_tables'::regclass and tgname='seating_table_seat_guard'
  and tgfoid='private.seating_table_seat_guard()'::regprocedure));
