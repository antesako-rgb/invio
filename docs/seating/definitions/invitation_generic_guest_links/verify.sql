-- READ ONLY metadata only.
select conname,pg_get_constraintdef(oid) from pg_constraint where conrelid='public.invitation_generic_guest_links'::regclass;
select policyname,cmd,roles,qual from pg_policies where schemaname='public' and tablename='invitation_generic_guest_links';
select has_table_privilege('authenticated','public.invitation_generic_guest_links','SELECT') as member_select,has_table_privilege('authenticated','public.invitation_generic_guest_links','INSERT') as direct_insert,has_table_privilege('anon','public.invitation_generic_guest_links','SELECT') as anon_select;
