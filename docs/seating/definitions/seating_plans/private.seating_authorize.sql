-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function private.seating_authorize(p_project uuid) returns void language plpgsql security definer set search_path='' as $$ begin if auth.uid() is null or private.is_project_member(p_project,auth.uid()) is not true then raise exception 'Access denied' using errcode='42501'; end if; end $$;
