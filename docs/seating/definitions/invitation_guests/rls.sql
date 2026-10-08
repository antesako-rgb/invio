-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- UNCHANGED
alter table public.invitation_guests enable row level security;
create policy invitation_guests_select on public.invitation_guests as PERMISSIVE for SELECT to authenticated using(private.is_project_member(project_id));