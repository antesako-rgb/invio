-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
revoke all on public.seating_plans from public,anon,authenticated;
grant select on public.seating_plans to authenticated;
revoke all on function private.seating_authorize(uuid) from public,anon,authenticated,service_role;
revoke all on function private.lock_seating_project(uuid) from public,anon,authenticated,service_role;
revoke all on function private.lock_seating_plan(uuid,bigint) from public,anon,authenticated,service_role;
revoke all on function public.manage_seating_plan(uuid,uuid,bigint,text,text,integer,integer,uuid) from public,anon,authenticated,service_role;
grant execute on function public.manage_seating_plan(uuid,uuid,bigint,text,text,integer,integer,uuid) to authenticated;
revoke all on function private.seating_plan_guard() from public,anon,authenticated,service_role;
