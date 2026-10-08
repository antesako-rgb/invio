-- READ ONLY metadata only.
select conname,pg_get_constraintdef(oid) from pg_constraint where conrelid='public.seating_plans'::regclass;
select policyname,cmd,roles,qual from pg_policies where schemaname='public' and tablename='seating_plans';
select has_table_privilege('authenticated','public.seating_plans','SELECT') as member_select,has_table_privilege('authenticated','public.seating_plans','INSERT') as direct_insert,has_table_privilege('anon','public.seating_plans','SELECT') as anon_select;
