-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
CREATE TRIGGER set_invitation_guests_updated_at BEFORE UPDATE ON public.invitation_guests FOR EACH ROW EXECUTE FUNCTION private.update_timestamp();
create trigger invitation_person_guard before insert or update on public.invitation_guests for each row execute function private.invitation_person_guard();
