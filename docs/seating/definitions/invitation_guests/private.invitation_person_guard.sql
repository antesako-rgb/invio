-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function private.invitation_person_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare v_person public.project_guests;
begin
 if tg_op='INSERT' and new.project_guest_id is null then
 insert into public.project_guests(project_id,first_name,last_name) values(new.project_id,new.first_name,new.last_name) returning id into new.project_guest_id;
 end if;
 if tg_op='UPDATE' and (new.project_id is distinct from old.project_id or new.invitation_id is distinct from old.invitation_id or new.project_guest_id is distinct from old.project_guest_id or new.id is distinct from old.id) then raise exception 'Guest identity immutable' using errcode='22023'; end if;
 select * into v_person from public.project_guests where project_id=new.project_id and id=new.project_guest_id;
 if not found then raise exception 'Person missing' using errcode='23503'; end if;
 if tg_op='INSERT' and v_person.archived_at is not null then raise exception 'Person archived' using errcode='22023'; end if;
 -- Stored compatibility names are derived snapshots. Only project_guests can edit names.
 new.first_name:=v_person.first_name; new.last_name:=v_person.last_name; return new;
end $$;
