-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- Existing timestamp trigger unchanged.
CREATE TRIGGER trg_invitation_recipients_update_timestamp BEFORE UPDATE ON public.invitation_recipients FOR EACH ROW EXECUTE FUNCTION private.update_timestamp();
