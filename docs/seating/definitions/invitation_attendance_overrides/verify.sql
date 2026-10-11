-- READ ONLY. Full source/security verification: VERIFY_ATTENDANCE_MODEL_READ_ONLY.sql.
select has_table_privilege('authenticated','public.invitation_attendance_overrides','SELECT') as member_select,
 has_table_privilege('authenticated','public.invitation_attendance_overrides','INSERT,UPDATE,DELETE') as member_write,
 has_table_privilege('anon','public.invitation_attendance_overrides','SELECT,INSERT,UPDATE,DELETE') as anon_access;
select has_function_privilege('authenticated','public.set_invitation_guest_attendance(uuid,uuid,text)','EXECUTE') as member_execute,
 has_function_privilege('anon','public.set_invitation_guest_attendance(uuid,uuid,text)','EXECUTE') as anon_execute,
 has_function_privilege('service_role','public.set_invitation_guest_attendance(uuid,uuid,text)','EXECUTE') as service_execute;
