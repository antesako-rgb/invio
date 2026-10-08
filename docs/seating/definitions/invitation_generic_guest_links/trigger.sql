-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.

create trigger generic_guest_link_guard before insert or update on public.invitation_generic_guest_links for each row execute function private.generic_guest_link_guard();
