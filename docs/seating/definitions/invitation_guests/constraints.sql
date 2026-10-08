-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.invitation_guests add constraint invitation_guests_first_name_check CHECK (((char_length(TRIM(BOTH FROM first_name)) >= 1) AND (char_length(TRIM(BOTH FROM first_name)) <= 100)));
alter table public.invitation_guests add constraint invitation_guests_group_fkey FOREIGN KEY (project_id, invitation_id, group_id) REFERENCES invitation_guest_groups(project_id, invitation_id, id) ON DELETE SET NULL (group_id);
alter table public.invitation_guests add constraint invitation_guests_invitation_fkey FOREIGN KEY (project_id, invitation_id) REFERENCES invitations(project_id, id) ON DELETE CASCADE;
alter table public.invitation_guests add constraint invitation_guests_last_name_check CHECK (((last_name IS NULL) OR ((char_length(TRIM(BOTH FROM last_name)) >= 1) AND (char_length(TRIM(BOTH FROM last_name)) <= 100))));
alter table public.invitation_guests add constraint invitation_guests_notes_check CHECK (((notes IS NULL) OR (char_length(notes) <= 2000)));
alter table public.invitation_guests add constraint invitation_guests_pkey PRIMARY KEY (id);
alter table public.invitation_guests add constraint invitation_guests_project_invitation_id_key UNIQUE (project_id, invitation_id, id);
alter table public.invitation_guests add constraint invitation_guests_recipient_fkey FOREIGN KEY (project_id, invitation_id, recipient_id) REFERENCES invitation_recipients(project_id, invitation_id, id) ON DELETE SET NULL (recipient_id);
alter table public.invitation_guests add constraint invitation_guests_project_person_fk foreign key(project_id,project_guest_id) references public.project_guests(project_id,id) on delete no action deferrable initially deferred;
alter table public.invitation_guests add constraint invitation_guests_one_person_per_invitation unique(invitation_id,project_guest_id);
alter table public.invitation_guests add constraint invitation_guests_person_identity unique(project_id,invitation_id,project_guest_id);
