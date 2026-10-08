-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- Existing timestamp trigger unchanged.
CREATE TRIGGER set_invitation_guest_groups_updated_at BEFORE UPDATE ON public.invitation_guest_groups FOR EACH ROW EXECUTE FUNCTION private.update_timestamp();
