-- READ ONLY metadata only.
select conname,pg_get_constraintdef(oid) from pg_constraint where conrelid='public.seating_assignments'::regclass;
select policyname,cmd,roles,qual from pg_policies where schemaname='public' and tablename='seating_assignments';
select has_table_privilege('authenticated','public.seating_assignments','SELECT') as member_select,has_table_privilege('authenticated','public.seating_assignments','INSERT') as direct_insert,has_table_privilege('anon','public.seating_assignments','SELECT') as anon_select;
