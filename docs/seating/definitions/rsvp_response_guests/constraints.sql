-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.rsvp_response_guests add constraint rsvp_response_guests_answers_check CHECK ((jsonb_typeof(answers) = 'object'::text));
alter table public.rsvp_response_guests add constraint rsvp_response_guests_first_name_check CHECK (((first_name IS NULL) OR ((char_length(TRIM(BOTH FROM first_name)) >= 1) AND (char_length(TRIM(BOTH FROM first_name)) <= 100))));
alter table public.rsvp_response_guests add constraint rsvp_response_guests_guest_source_check CHECK ((((invitation_guest_id IS NOT NULL) AND (first_name IS NULL) AND (last_name IS NULL)) OR ((invitation_guest_id IS NULL) AND (first_name IS NOT NULL))));
alter table public.rsvp_response_guests add constraint rsvp_response_guests_invitation_guest_fkey FOREIGN KEY (project_id, invitation_id, invitation_guest_id) REFERENCES invitation_guests(project_id, invitation_id, id) ON DELETE CASCADE;
alter table public.rsvp_response_guests add constraint rsvp_response_guests_last_name_check CHECK (((last_name IS NULL) OR ((char_length(TRIM(BOTH FROM last_name)) >= 1) AND (char_length(TRIM(BOTH FROM last_name)) <= 100))));
alter table public.rsvp_response_guests add constraint rsvp_response_guests_pkey PRIMARY KEY (id);
alter table public.rsvp_response_guests add constraint rsvp_response_guests_response_fkey FOREIGN KEY (project_id, invitation_id, response_id) REFERENCES rsvp_responses(project_id, invitation_id, id) ON DELETE CASCADE;
alter table public.rsvp_response_guests add constraint rsvp_response_guests_response_guest_key UNIQUE (response_id, invitation_guest_id);
alter table public.rsvp_response_guests add constraint rsvp_response_guests_status_check CHECK ((status = ANY (ARRAY['attending'::text, 'not_attending'::text])));
alter table public.rsvp_response_guests add constraint rsvp_response_guests_link_identity unique(project_id,invitation_id,response_id,id);