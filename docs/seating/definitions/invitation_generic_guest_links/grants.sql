-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
revoke all on public.invitation_generic_guest_links from public,anon,authenticated;
grant select on public.invitation_generic_guest_links to authenticated;
revoke all on function public.link_generic_rsvp_guest(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.link_generic_rsvp_guest(uuid,uuid,boolean) to authenticated;
revoke all on function public.unlink_generic_rsvp_guest(uuid) from public,anon,authenticated,service_role;
grant execute on function public.unlink_generic_rsvp_guest(uuid) to authenticated;
revoke all on function private.generic_guest_link_guard() from public,anon,authenticated,service_role;
