-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function private.sync_invitation_person_names() returns trigger language plpgsql security definer set search_path='' as $$ begin update public.invitation_guests set first_name=new.first_name,last_name=new.last_name,updated_at=now() where project_guest_id=new.id and project_id=new.project_id; return new; end $$;
