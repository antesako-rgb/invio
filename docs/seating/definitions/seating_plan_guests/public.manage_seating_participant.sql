-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.manage_seating_participant(p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_operation text) returns bigint language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; v_next bigint; begin v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_operation='add' then perform 1 from public.project_guests where project_id=v.project_id and id=p_guest_id and archived_at is null; if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 insert into public.seating_plan_guests values(v.project_id,v.id,p_guest_id);
 elsif p_operation='remove' then delete from public.seating_plan_guests where plan_id=v.id and project_guest_id=p_guest_id;
 else raise exception 'Invalid operation' using errcode='22023'; end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next; return v_next; end $$;
