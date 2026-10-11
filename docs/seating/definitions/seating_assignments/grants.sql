-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
revoke all on public.seating_assignments from public,anon,authenticated;
grant select on public.seating_assignments to authenticated;
revoke all on function private.assign_seating_guest_internal(uuid,bigint,uuid,uuid,integer,boolean) from public,anon,authenticated,service_role;
revoke all on function private.seating_assignment_seat_guard() from public,anon,authenticated,service_role;
revoke all on function public.assign_seating_guest(uuid,bigint,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guest(uuid,bigint,uuid,uuid) to authenticated;
revoke all on function public.assign_seating_guest_to_seat(uuid,bigint,uuid,uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guest_to_seat(uuid,bigint,uuid,uuid,integer) to authenticated;
revoke all on function public.assign_seating_guests(uuid,bigint,uuid[],uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guests(uuid,bigint,uuid[],uuid,text) to authenticated;
revoke all on function public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb) to authenticated;
