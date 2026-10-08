-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.invitation_generic_guest_links enable row level security;
create policy invitation_generic_guest_links_member_select on public.invitation_generic_guest_links for select to authenticated using(private.is_project_member(project_id));
