-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.manage_seating_table(p_plan_id uuid,p_revision bigint,p_table_id uuid,p_operation text,p_name text default null,p_shape text default null,p_capacity integer default null,p_x_cm integer default null,p_y_cm integer default null,p_width_cm integer default null,p_height_cm integer default null,p_rotation_deg integer default 0) returns jsonb language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; v_id uuid; v_next bigint; begin v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_operation in ('update','delete') then perform 1 from public.seating_tables where plan_id=v.id and id=p_table_id; if not found then raise exception 'Table missing' using errcode='P0002'; end if; end if;
 if p_operation='delete' then delete from public.seating_tables where plan_id=v.id and id=p_table_id; v_id:=p_table_id;
 elsif p_operation in ('create','update') then
 if p_x_cm is null or p_y_cm is null or p_width_cm is null or p_height_cm is null or p_capacity is null or p_shape is null or p_rotation_deg is null or not private.seating_geometry_fits(p_shape,p_x_cm,p_y_cm,p_width_cm,p_height_cm,p_rotation_deg,v.width_cm,v.height_cm) or (p_shape='round' and p_width_cm<>p_height_cm) then raise exception 'Invalid table geometry' using errcode='22023'; end if;
 if p_operation='create' then insert into public.seating_tables(project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg) values(v.project_id,v.id,trim(p_name),p_shape,p_capacity,p_x_cm,p_y_cm,p_width_cm,p_height_cm,p_rotation_deg) returning id into v_id;
 else
 if (select count(*) from public.seating_assignments where plan_id=v.id and table_id=p_table_id)>p_capacity then raise exception 'Capacity below occupancy' using errcode='22023'; end if;
 update public.seating_tables set name=trim(p_name),shape=p_shape,capacity=p_capacity,x_cm=p_x_cm,y_cm=p_y_cm,width_cm=p_width_cm,height_cm=p_height_cm,rotation_deg=p_rotation_deg where plan_id=v.id and id=p_table_id; v_id:=p_table_id;
 end if;
 else raise exception 'Invalid operation' using errcode='22023'; end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next; return jsonb_build_object('id',v_id,'revision',v_next); end $$;
