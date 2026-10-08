-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function private.lock_seating_project(p_project uuid) returns void language plpgsql security definer set search_path='' as $$ begin perform private.seating_authorize(p_project); perform 1 from public.projects where id=p_project for update; if not found then raise exception 'Project missing' using errcode='P0002'; end if; end $$;
