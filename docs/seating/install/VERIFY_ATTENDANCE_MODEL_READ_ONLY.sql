-- READ ONLY after attendance setup. No personal data returned.
begin read only;
set local search_path=pg_catalog,public;
do $verify_attendance$
declare v record; p pg_proc;
begin
 if not exists(select 1 from pg_class where oid=to_regclass('public.invitation_attendance_overrides') and relowner='postgres'::regrole and relrowsecurity)
  or has_table_privilege('anon','public.invitation_attendance_overrides','SELECT,INSERT,UPDATE,DELETE')
  or has_table_privilege('service_role','public.invitation_attendance_overrides','SELECT,INSERT,UPDATE,DELETE')
  or has_table_privilege('authenticated','public.invitation_attendance_overrides','INSERT,UPDATE,DELETE')
  or not has_table_privilege('authenticated','public.invitation_attendance_overrides','SELECT') then raise exception 'Attendance table ACL/RLS mismatch'; end if;
 if (select count(*) from pg_policy where polrelid='public.invitation_attendance_overrides'::regclass)<>1
  or not exists(select 1 from pg_policy where polrelid='public.invitation_attendance_overrides'::regclass
   and polcmd='r' and polpermissive and polroles=array['authenticated'::regrole::oid]
   and pg_get_expr(polqual,polrelid)='private.is_project_member(project_id)') then raise exception 'Attendance policy mismatch'; end if;
 if not exists(select 1 from pg_constraint where conrelid='public.invitation_attendance_overrides'::regclass
  and conname='invitation_attendance_overrides_pk' and contype='p' and convalidated
  and pg_get_constraintdef(oid)='PRIMARY KEY (invitation_id, project_guest_id)')
  or not exists(select 1 from pg_constraint where conrelid='public.invitation_attendance_overrides'::regclass
   and conname='invitation_attendance_overrides_guest_fk' and contype='f' and convalidated
   and pg_get_constraintdef(oid)='FOREIGN KEY (project_id, invitation_id, project_guest_id) REFERENCES invitation_guests(project_id, invitation_id, project_guest_id) ON DELETE CASCADE')
  or not exists(select 1 from pg_constraint where conrelid='public.invitation_attendance_overrides'::regclass
   and contype='c' and convalidated and pg_get_constraintdef(oid)='CHECK ((status = ANY (ARRAY[''attending''::text, ''not_attending''::text])))') then raise exception 'Attendance constraints mismatch'; end if;
 for v in select * from (values
  ('public.set_invitation_guest_attendance(uuid,uuid,text)','0fd98e43a878269ea5516aa41a63d432'),
  ('public.include_generic_seating_guest(uuid,bigint,uuid,uuid,boolean)','8dcd1be7d7057a9673ed37258f91edf0'),
  ('public.sync_seating_rsvp_guests(uuid,uuid,bigint)','1b16d2e5c77298818ce30af56b05577e')
 ) f(signature,source_md5) loop
  select * into p from pg_proc where oid=to_regprocedure(v.signature);
  if not found then raise exception 'Attendance RPC missing: %',v.signature; end if;
  if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
   or p.prorettype<>'jsonb'::regtype or p.prolang<>(select oid from pg_language where lanname='plpgsql')
   or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>v.source_md5
   or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
   or not has_function_privilege('authenticated',p.oid,'EXECUTE') then raise exception 'Attendance RPC/security mismatch: %',v.signature; end if;
 end loop;
end $verify_attendance$;
select true as attendance_model_verified,true as member_execute;
rollback;
