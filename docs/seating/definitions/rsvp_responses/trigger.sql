-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- Existing timestamp trigger unchanged.
CREATE TRIGGER trg_rsvp_responses_update_timestamp BEFORE UPDATE ON public.rsvp_responses FOR EACH ROW EXECUTE FUNCTION private.update_timestamp();
