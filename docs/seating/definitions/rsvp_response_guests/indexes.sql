-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
CREATE INDEX rsvp_response_guests_invitation_guest_id_idx ON public.rsvp_response_guests USING btree (invitation_guest_id);
