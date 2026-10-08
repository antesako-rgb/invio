-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.invitation_recipients add constraint invitation_recipients_email_check CHECK (((email IS NULL) OR (((char_length(TRIM(BOTH FROM email)) >= 3) AND (char_length(TRIM(BOTH FROM email)) <= 320)) AND (email = lower(TRIM(BOTH FROM email))))));
alter table public.invitation_recipients add constraint invitation_recipients_phone_check CHECK (((phone IS NULL) OR ((char_length(TRIM(BOTH FROM phone)) >= 1) AND (char_length(TRIM(BOTH FROM phone)) <= 50))));
alter table public.invitation_recipients add constraint invitation_recipients_pkey PRIMARY KEY (id);
alter table public.invitation_recipients add constraint invitation_recipients_project_invitation_fkey FOREIGN KEY (project_id, invitation_id) REFERENCES invitations(project_id, id) ON DELETE CASCADE;
alter table public.invitation_recipients add constraint invitation_recipients_project_invitation_id_key UNIQUE (project_id, invitation_id, id);
alter table public.invitation_recipients add constraint invitation_recipients_token_hash_check CHECK ((char_length(TRIM(BOTH FROM token_hash)) = 64));
alter table public.invitation_recipients add constraint invitation_recipients_token_hash_key UNIQUE (token_hash);