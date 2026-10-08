-- Continue SAME transaction from 001. No commit.
create index project_guests_project_idx on public.project_guests(project_id);
alter table public.project_guests enable row level security;
create policy project_guests_member_select on public.project_guests for select to authenticated using(private.is_project_member(project_id));
revoke all on public.project_guests from public,anon,authenticated;
grant select on public.project_guests to authenticated;

create index invitation_generic_guest_links_project_idx on public.invitation_generic_guest_links(project_id);
create index invitation_generic_guest_links_person_idx on public.invitation_generic_guest_links(project_guest_id);
alter table public.invitation_generic_guest_links enable row level security;
create policy invitation_generic_guest_links_member_select on public.invitation_generic_guest_links for select to authenticated using(private.is_project_member(project_id));
revoke all on public.invitation_generic_guest_links from public,anon,authenticated;
grant select on public.invitation_generic_guest_links to authenticated;

create index seating_plans_project_idx on public.seating_plans(project_id);
alter table public.seating_plans enable row level security;
create policy seating_plans_member_select on public.seating_plans for select to authenticated using(private.is_project_member(project_id));
revoke all on public.seating_plans from public,anon,authenticated;
grant select on public.seating_plans to authenticated;

create index seating_plan_guests_project_idx on public.seating_plan_guests(project_id);
create index seating_plan_guests_person_idx on public.seating_plan_guests(project_guest_id);
alter table public.seating_plan_guests enable row level security;
create policy seating_plan_guests_member_select on public.seating_plan_guests for select to authenticated using(private.is_project_member(project_id));
revoke all on public.seating_plan_guests from public,anon,authenticated;
grant select on public.seating_plan_guests to authenticated;

create index seating_tables_project_idx on public.seating_tables(project_id);
alter table public.seating_tables enable row level security;
create policy seating_tables_member_select on public.seating_tables for select to authenticated using(private.is_project_member(project_id));
revoke all on public.seating_tables from public,anon,authenticated;
grant select on public.seating_tables to authenticated;

create index seating_assignments_project_idx on public.seating_assignments(project_id);
create index seating_assignments_table_idx on public.seating_assignments(plan_id,table_id);
alter table public.seating_assignments enable row level security;
create policy seating_assignments_member_select on public.seating_assignments for select to authenticated using(private.is_project_member(project_id));
revoke all on public.seating_assignments from public,anon,authenticated;
grant select on public.seating_assignments to authenticated;
revoke all on function private.seating_authorize(uuid) from public,anon,authenticated,service_role;

revoke all on function private.lock_seating_project(uuid) from public,anon,authenticated,service_role;

revoke all on function public.manage_project_guest(uuid,uuid,text,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.manage_project_guest(uuid,uuid,text,text,text,text) to authenticated;
revoke all on function private.invitation_person_guard() from public,anon,authenticated,service_role;

revoke all on function private.sync_invitation_person_names() from public,anon,authenticated,service_role;

revoke all on function public.link_existing_invitation_guest(uuid,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.link_existing_invitation_guest(uuid,uuid,uuid) to authenticated;
revoke all on function public.link_generic_rsvp_guest(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.link_generic_rsvp_guest(uuid,uuid,boolean) to authenticated;
revoke all on function public.unlink_generic_rsvp_guest(uuid) from public,anon,authenticated,service_role;
grant execute on function public.unlink_generic_rsvp_guest(uuid) to authenticated;
revoke all on function public.delete_invitation_guest(uuid) from public,anon,authenticated,service_role;
grant execute on function public.delete_invitation_guest(uuid) to authenticated;
revoke all on function public.update_invitation_guest(uuid,uuid,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.update_invitation_guest(uuid,uuid,text,text,text) to authenticated;
revoke all on function public.create_invitation_guest(uuid,uuid,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.create_invitation_guest(uuid,uuid,text,text,text) to authenticated;
revoke all on function public.get_public_rsvp(text) from public,anon,authenticated,service_role;
grant execute on function public.get_public_rsvp(text) to anon,authenticated;
revoke all on function private.lock_seating_plan(uuid,bigint) from public,anon,authenticated,service_role;

revoke all on function public.manage_seating_plan(uuid,uuid,bigint,text,text,integer,integer,uuid) from public,anon,authenticated,service_role;
grant execute on function public.manage_seating_plan(uuid,uuid,bigint,text,text,integer,integer,uuid) to authenticated;
revoke all on function public.manage_seating_participant(uuid,bigint,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.manage_seating_participant(uuid,bigint,uuid,text) to authenticated;
revoke all on function public.manage_seating_table(uuid,bigint,uuid,text,text,text,integer,integer,integer,integer,integer,integer) from public,anon,authenticated,service_role;
grant execute on function public.manage_seating_table(uuid,bigint,uuid,text,text,text,integer,integer,integer,integer,integer,integer) to authenticated;
revoke all on function public.assign_seating_guest(uuid,bigint,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.assign_seating_guest(uuid,bigint,uuid,uuid) to authenticated;
revoke all on function private.seating_plan_guard() from public,anon,authenticated,service_role;

revoke all on function private.generic_guest_link_guard() from public,anon,authenticated,service_role;

-- NEW: active template catalog and trusted admin access.
create index seating_templates_catalog_idx on public.seating_templates(sort_order,id) where is_active=true;
alter table public.seating_templates enable row level security;
create policy seating_templates_select on public.seating_templates for select to authenticated using(is_active=true);
revoke all on public.seating_templates from public,anon,authenticated;
grant select on public.seating_templates to authenticated;
-- Same trusted admin boundary as invitation_templates; no browser admin role invented.
grant select,insert,update,delete on public.seating_templates to service_role;
revoke all on function private.validate_seating_template(jsonb,integer) from public,anon,authenticated,service_role;
revoke all on function private.seating_template_guard() from public,anon,authenticated,service_role;
revoke all on function public.create_seating_plan_from_template(uuid,uuid,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.create_seating_plan_from_template(uuid,uuid,text,uuid) to authenticated;

revoke all on function private.seating_geometry_fits(text,integer,integer,integer,integer,integer,integer,integer) from public,anon,authenticated,service_role;
