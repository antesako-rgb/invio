-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
revoke all on public.seating_assignments from public,anon,authenticated;
grant select on public.seating_assignments to authenticated;
revoke all on function public.assign_seating_guest(uuid,bigint,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guest(uuid,bigint,uuid,uuid) to authenticated;
