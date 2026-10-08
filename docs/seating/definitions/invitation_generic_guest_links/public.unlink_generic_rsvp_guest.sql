-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.unlink_generic_rsvp_guest(p_response_guest_id uuid) returns void language plpgsql security definer set search_path='' as $$ declare v_project uuid; begin select project_id into v_project from public.rsvp_response_guests where id=p_response_guest_id; perform private.lock_seating_project(v_project); delete from public.invitation_generic_guest_links where response_guest_id=p_response_guest_id; end $$;
