-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.

create trigger sync_invitation_person_names after update of first_name,last_name on public.project_guests for each row when(old.first_name is distinct from new.first_name or old.last_name is distinct from new.last_name) execute function private.sync_invitation_person_names();
