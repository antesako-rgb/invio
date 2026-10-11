-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
revoke all on public.seating_plan_guests from public,anon,authenticated;
grant select on public.seating_plan_guests to authenticated;
revoke all on function public.manage_seating_participant(uuid,bigint,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.manage_seating_participant(uuid,bigint,uuid,text) to authenticated;
revoke all on function public.sync_seating_rsvp_guests(uuid,uuid,bigint) from public,anon,authenticated,service_role;
grant execute on function public.sync_seating_rsvp_guests(uuid,uuid,bigint) to authenticated;
revoke all on function public.include_generic_seating_guest(uuid,bigint,uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.include_generic_seating_guest(uuid,bigint,uuid,uuid,boolean) to authenticated;
