-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
CREATE INDEX invitation_recipients_invitation_id_idx ON public.invitation_recipients USING btree (invitation_id);
