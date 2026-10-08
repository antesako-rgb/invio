-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
CREATE UNIQUE INDEX invitation_guests_one_primary_per_recipient_idx ON public.invitation_guests USING btree (recipient_id) WHERE (is_primary = true);
CREATE INDEX invitation_guests_recipient_id_idx ON public.invitation_guests USING btree (recipient_id);
