-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- EXISTING table grants unchanged; migration does not reset platform rights.
revoke all on function private.invitation_person_guard() from public,anon,authenticated,service_role;
revoke all on function public.link_existing_invitation_guest(uuid,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.link_existing_invitation_guest(uuid,uuid,uuid) to authenticated;
revoke all on function public.delete_invitation_guest(uuid) from public,anon,authenticated,service_role;
grant execute on function public.delete_invitation_guest(uuid) to authenticated;
revoke all on function public.update_invitation_guest(uuid,uuid,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.update_invitation_guest(uuid,uuid,text,text,text) to authenticated;
revoke all on function public.create_invitation_guest(uuid,uuid,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.create_invitation_guest(uuid,uuid,text,text,text) to authenticated;
