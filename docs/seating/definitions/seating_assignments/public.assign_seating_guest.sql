-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.assign_seating_guest(p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_table_id uuid) returns bigint language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; v_capacity integer; v_next bigint; begin v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_table_id is null then delete from public.seating_assignments where plan_id=v.id and project_guest_id=p_guest_id;
 else
 perform 1 from public.project_guests where project_id=v.project_id and id=p_guest_id and archived_at is null; if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 select capacity into v_capacity from public.seating_tables where plan_id=v.id and id=p_table_id; if not found then raise exception 'Table missing' using errcode='22023'; end if;
 if (select count(*) from public.seating_assignments where plan_id=v.id and table_id=p_table_id and project_guest_id<>p_guest_id)>=v_capacity then raise exception 'Table full' using errcode='22023'; end if;
 insert into public.seating_assignments values(v.project_id,v.id,p_guest_id,p_table_id) on conflict(plan_id,project_guest_id) do update set table_id=excluded.table_id;
 end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next; return v_next; end $$;
