-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create index invitation_generic_guest_links_project_idx on public.invitation_generic_guest_links(project_id);
create index invitation_generic_guest_links_person_idx on public.invitation_generic_guest_links(project_guest_id);
