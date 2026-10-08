-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.manage_project_guest(p_project_id uuid,p_guest_id uuid,p_operation text,p_first_name text default null,p_last_name text default null,p_notes text default null) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin perform private.lock_seating_project(p_project_id);
 if p_operation='create' then
 insert into public.project_guests(project_id,first_name,last_name,notes) values(p_project_id,trim(p_first_name),nullif(trim(p_last_name),''),nullif(trim(p_notes),'')) returning id into v_id; return v_id;
 end if;
 perform 1 from public.project_guests where project_id=p_project_id and id=p_guest_id for update;
 if not found then raise exception 'Guest missing' using errcode='P0002'; end if;
 case p_operation
 when 'update' then update public.project_guests set first_name=trim(p_first_name),last_name=nullif(trim(p_last_name),''),notes=nullif(trim(p_notes),''),updated_at=now() where id=p_guest_id;
 when 'archive' then update public.project_guests set archived_at=now(),updated_at=now() where id=p_guest_id;
 when 'restore' then update public.project_guests set archived_at=null,updated_at=now() where id=p_guest_id;
 when 'delete' then
 if private.is_project_owner(p_project_id,auth.uid()) is not true then raise exception 'Owner required' using errcode='42501'; end if;
 if exists(select 1 from public.invitation_guests where project_id=p_project_id and project_guest_id=p_guest_id) or exists(select 1 from public.invitation_generic_guest_links where project_id=p_project_id and project_guest_id=p_guest_id) or exists(select 1 from public.seating_plan_guests where project_id=p_project_id and project_guest_id=p_guest_id) then raise exception 'Person still linked' using errcode='23503'; end if;
 delete from public.project_guests where id=p_guest_id;
 else raise exception 'Invalid operation' using errcode='22023'; end case;
 return p_guest_id;
end $$;
