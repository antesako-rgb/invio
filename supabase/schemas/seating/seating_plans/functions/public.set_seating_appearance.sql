CREATE OR REPLACE FUNCTION public.set_seating_appearance(p_plan_id uuid, p_revision bigint, p_target text, p_object_id uuid, p_appearance jsonb, p_all boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $function$
declare v public.seating_plans; e public.seating_elements; normalized jsonb; plan_appearance jsonb; next_revision bigint;
begin
 v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_all is distinct from false then raise exception 'Invalid appearance target' using errcode='22023';end if;
 plan_appearance:=v.appearance;
 if p_target='room' and p_object_id is null then
  -- Validate the patch before merging: arrays/scalars must not silently replace an object.
  perform private.normalize_seating_appearance('room',p_appearance);
  plan_appearance:=private.normalize_seating_appearance('room',v.appearance||p_appearance);
 elsif p_target='table_theme' and p_object_id is null then
  normalized:=private.normalize_seating_appearance('table_theme',p_appearance);
  plan_appearance:=private.normalize_seating_appearance('room',v.appearance||normalized);
 elsif p_target='element' and p_object_id is not null then
  select * into e from public.seating_elements where id=p_object_id and plan_id=v.id and project_id=v.project_id;
  if not found then raise exception 'Element missing' using errcode='P0002';end if;
  normalized:=private.normalize_seating_appearance(e.kind,p_appearance);
  update public.seating_elements set appearance=normalized where id=e.id and plan_id=v.id;
 else raise exception 'Invalid appearance target' using errcode='22023';end if;
 -- One plan write/revision, irrespective of the number of existing or future tables.
 update public.seating_plans set appearance=plan_appearance,revision=revision+1,updated_at=now() where id=v.id returning revision into next_revision;
 return jsonb_build_object('revision',next_revision,'affected',1);
end
$function$;
ALTER FUNCTION public.set_seating_appearance(uuid, bigint, text, uuid, jsonb, boolean) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.set_seating_appearance(uuid, bigint, text, uuid, jsonb, boolean) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_seating_appearance(uuid, bigint, text, uuid, jsonb, boolean) TO authenticated;
