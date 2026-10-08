-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
revoke all on public.project_guests from public,anon,authenticated;
grant select on public.project_guests to authenticated;
revoke all on function public.manage_project_guest(uuid,uuid,text,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.manage_project_guest(uuid,uuid,text,text,text,text) to authenticated;
revoke all on function private.sync_invitation_person_names() from public,anon,authenticated,service_role;
