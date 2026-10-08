-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- UNCHANGED
alter table public.invitation_guest_groups enable row level security;
create policy invitation_guest_groups_select on public.invitation_guest_groups as PERMISSIVE for SELECT to authenticated using(private.is_project_member(project_id));