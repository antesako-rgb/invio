-- SAVE/REVIEW ONLY. Proposed definition; not installed. Use numbered install package, not definitions.
revoke all on public.seating_templates from public,anon,authenticated;
grant select on public.seating_templates to authenticated;
-- Same trusted admin boundary as invitation_templates; no browser admin role invented.
grant select,insert,update,delete on public.seating_templates to service_role;
revoke all on function private.validate_seating_template(jsonb,integer) from public,anon,authenticated,service_role;
revoke all on function private.seating_template_guard() from public,anon,authenticated,service_role;
revoke all on function public.create_seating_plan_from_template(uuid,uuid,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.create_seating_plan_from_template(uuid,uuid,text,uuid) to authenticated;
