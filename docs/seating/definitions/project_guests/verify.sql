-- READ ONLY metadata only.
select conname,pg_get_constraintdef(oid) from pg_constraint where conrelid='public.project_guests'::regclass;
select policyname,cmd,roles,qual from pg_policies where schemaname='public' and tablename='project_guests';
select has_table_privilege('authenticated','public.project_guests','SELECT') as member_select,has_table_privilege('authenticated','public.project_guests','INSERT') as direct_insert,has_table_privilege('anon','public.project_guests','SELECT') as anon_select;
