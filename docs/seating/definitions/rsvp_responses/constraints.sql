-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.rsvp_responses add constraint rsvp_responses_invitation_fkey FOREIGN KEY (project_id, invitation_id) REFERENCES invitations(project_id, id) ON DELETE CASCADE;
alter table public.rsvp_responses add constraint rsvp_responses_pkey PRIMARY KEY (id);
alter table public.rsvp_responses add constraint rsvp_responses_project_invitation_id_key UNIQUE (project_id, invitation_id, id);
alter table public.rsvp_responses add constraint rsvp_responses_recipient_fkey FOREIGN KEY (project_id, invitation_id, recipient_id) REFERENCES invitation_recipients(project_id, invitation_id, id) ON DELETE CASCADE;
alter table public.rsvp_responses add constraint rsvp_responses_recipient_key UNIQUE (recipient_id);
alter table public.rsvp_responses add constraint rsvp_responses_recipient_type_check CHECK ((((response_type = 'personalized'::text) AND (recipient_id IS NOT NULL)) OR ((response_type = 'generic'::text) AND (recipient_id IS NULL))));
alter table public.rsvp_responses add constraint rsvp_responses_response_type_check CHECK ((response_type = ANY (ARRAY['personalized'::text, 'generic'::text])));