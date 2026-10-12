CREATE OR REPLACE FUNCTION public.manage_seating_element(p_plan_id uuid, p_revision bigint, p_element_id uuid, p_operation text, p_element jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v public.seating_plans; e public.seating_elements; v_id uuid; v_next bigint;
begin
 v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_operation in ('update','delete') then
  select * into e from public.seating_elements where id=p_element_id and plan_id=v.id and project_id=v.project_id;
  if not found then raise exception 'Element missing' using errcode='P0002'; end if;
 end if;
 if p_operation='delete' then
  delete from public.seating_elements where id=e.id and plan_id=v.id; v_id:=e.id;
 elsif p_operation in ('create','update') then
  if not private.seating_element_valid(p_element,v.width_cm,v.height_cm) then raise exception 'Invalid element geometry' using errcode='22023'; end if;
  if p_operation='create' then
   if p_element_id is not null then raise exception 'Invalid element identity' using errcode='22023'; end if;
   if (select count(*) from public.seating_elements where plan_id=v.id)>=200 then raise exception 'Element limit exceeded' using errcode='22023'; end if;
   insert into public.seating_elements(project_id,plan_id,kind,name,x_cm,y_cm,width_cm,height_cm,rotation_deg,z_index,locked,appearance)
   values(v.project_id,v.id,p_element->>'kind',trim(p_element->>'name'),(p_element->>'x_cm')::integer,(p_element->>'y_cm')::integer,(p_element->>'width_cm')::integer,(p_element->>'height_cm')::integer,(p_element->>'rotation_deg')::integer,(p_element->>'z_index')::integer,(p_element->>'locked')::boolean,private.normalize_seating_appearance(p_element->>'kind',coalesce(p_element->'appearance','{}'::jsonb))) returning id into v_id;
  else
   update public.seating_elements set kind=p_element->>'kind',name=trim(p_element->>'name'),x_cm=(p_element->>'x_cm')::integer,y_cm=(p_element->>'y_cm')::integer,width_cm=(p_element->>'width_cm')::integer,height_cm=(p_element->>'height_cm')::integer,rotation_deg=(p_element->>'rotation_deg')::integer,z_index=(p_element->>'z_index')::integer,locked=(p_element->>'locked')::boolean,appearance=case when p_element ? 'appearance' then private.normalize_seating_appearance(p_element->>'kind',p_element->'appearance') else e.appearance end where id=e.id and plan_id=v.id; v_id:=e.id;
  end if;
 else raise exception 'Invalid operation' using errcode='22023'; end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next;
 return jsonb_build_object('id',v_id,'revision',v_next);
end $function$
;
ALTER FUNCTION public.manage_seating_element(uuid,bigint,uuid,text,jsonb) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.manage_seating_element(uuid,bigint,uuid,text,jsonb) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.manage_seating_element(uuid,bigint,uuid,text,jsonb) TO authenticated;
