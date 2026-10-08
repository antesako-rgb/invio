-- READ ONLY, no template contents.
select conname,pg_get_constraintdef(oid) from pg_constraint where conrelid='public.seating_templates'::regclass;
select policyname,cmd,roles,qual from pg_policies where schemaname='public' and tablename='seating_templates';
select has_table_privilege('authenticated','public.seating_templates','INSERT') as client_write,has_table_privilege('anon','public.seating_templates','SELECT') as anon_read,has_table_privilege('service_role','public.seating_templates','UPDATE') as trusted_admin_write;
