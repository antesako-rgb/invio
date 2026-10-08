-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.manage_seating_plan(p_project_id uuid,p_plan_id uuid,p_revision bigint,p_operation text,p_name text default null,p_width_cm integer default null,p_height_cm integer default null,p_rsvp_invitation_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; begin
 perform private.lock_seating_project(p_project_id);
 if p_operation='create' then insert into public.seating_plans(project_id,name,width_cm,height_cm,rsvp_invitation_id) values(p_project_id,trim(p_name),p_width_cm,p_height_cm,p_rsvp_invitation_id) returning * into v;
 else v:=private.lock_seating_plan(p_plan_id,p_revision); if v.project_id<>p_project_id then raise exception 'Project mismatch' using errcode='42501'; end if;
 if p_operation='delete' then delete from public.seating_plans where id=v.id; return jsonb_build_object('id',v.id,'deleted',true); elsif p_operation='update' then
 if exists(select 1 from public.seating_tables where plan_id=v.id and (not private.seating_geometry_fits(shape,x_cm,y_cm,width_cm,height_cm,rotation_deg,p_width_cm,p_height_cm))) then raise exception 'Room too small' using errcode='22023'; end if;
 update public.seating_plans set name=trim(p_name),width_cm=p_width_cm,height_cm=p_height_cm,rsvp_invitation_id=p_rsvp_invitation_id,revision=revision+1,updated_at=now() where id=v.id returning * into v;
 else raise exception 'Invalid operation' using errcode='22023'; end if; end if; return to_jsonb(v); end $$;
