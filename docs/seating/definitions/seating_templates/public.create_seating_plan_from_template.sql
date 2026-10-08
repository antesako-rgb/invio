-- SAVE/REVIEW ONLY. Proposed definition; not installed. Use numbered install package, not definitions.
create or replace function public.create_seating_plan_from_template(p_project_id uuid,p_template_id uuid,p_name text,p_rsvp_invitation_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $template$
declare v_template public.seating_templates;v_plan public.seating_plans;v_item jsonb;
begin
 perform private.lock_seating_project(p_project_id);
 select * into v_template from public.seating_templates where id=p_template_id and is_active for share;
 if not found then raise exception 'Active template missing' using errcode='P0002'; end if;
 perform private.validate_seating_template(v_template.document,v_template.document_version);
 insert into public.seating_plans(project_id,name,rsvp_invitation_id,width_cm,height_cm)
 values(p_project_id,trim(p_name),p_rsvp_invitation_id,(v_template.document->>'width_cm')::integer,(v_template.document->>'height_cm')::integer) returning * into v_plan;
 for v_item in select value from jsonb_array_elements(v_template.document->'tables') loop
 insert into public.seating_tables(project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg)
 values(p_project_id,v_plan.id,trim(v_item->>'name'),v_item->>'shape',(v_item->>'capacity')::integer,(v_item->>'x_cm')::integer,(v_item->>'y_cm')::integer,(v_item->>'width_cm')::integer,(v_item->>'height_cm')::integer,(v_item->>'rotation_deg')::integer);
 end loop;
 return to_jsonb(v_plan);
end $template$;
