-- READ ONLY
select conname,pg_get_constraintdef(oid) from pg_constraint where conrelid='public.invitation_guest_groups'::regclass;
