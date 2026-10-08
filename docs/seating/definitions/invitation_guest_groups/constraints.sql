-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.invitation_guest_groups add constraint invitation_guest_groups_invitation_fkey FOREIGN KEY (project_id, invitation_id) REFERENCES invitations(project_id, id) ON DELETE CASCADE;
alter table public.invitation_guest_groups add constraint invitation_guest_groups_name_check CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 150)));
alter table public.invitation_guest_groups add constraint invitation_guest_groups_pkey PRIMARY KEY (id);
alter table public.invitation_guest_groups add constraint invitation_guest_groups_project_invitation_id_key UNIQUE (project_id, invitation_id, id);