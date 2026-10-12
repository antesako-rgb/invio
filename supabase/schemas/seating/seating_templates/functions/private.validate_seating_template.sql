CREATE OR REPLACE FUNCTION private.validate_seating_template(p_document jsonb, p_version integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_item jsonb; v_width integer; v_height integer; v_x integer; v_y integer; v_w integer; v_h integer;
begin
 if (p_version is null or p_version<>2) or p_document is null or jsonb_typeof(p_document)<>'object' then raise exception 'Unsupported template document' using errcode='22023'; end if;
 if not(p_document ?& array['width_cm','height_cm','tables','elements','appearance']) or exists(select 1 from jsonb_object_keys(p_document) k where k not in ('width_cm','height_cm','tables','elements','appearance')) then raise exception 'Invalid template fields' using errcode='22023'; end if;
 if jsonb_typeof(p_document->'width_cm')<>'number' or jsonb_typeof(p_document->'height_cm')<>'number' or (p_document->>'width_cm') !~ '^[0-9]{1,6}$' or (p_document->>'height_cm') !~ '^[0-9]{1,6}$' or jsonb_typeof(p_document->'tables')<>'array' then raise exception 'Invalid template dimensions' using errcode='22023'; end if;
 if jsonb_typeof(p_document->'elements') is distinct from 'array' then raise exception 'Invalid template elements' using errcode='22023'; end if;
 if not private.seating_appearance_valid('room',p_document->'appearance') then raise exception 'Invalid room appearance' using errcode='22023';end if;
 v_width:=(p_document->>'width_cm')::integer;v_height:=(p_document->>'height_cm')::integer;
 if v_width not between 100 and 100000 or v_height not between 100 and 100000 or jsonb_array_length(p_document->'tables')>200 then raise exception 'Template limits exceeded' using errcode='22023'; end if;
 for v_item in select value from jsonb_array_elements(p_document->'tables') loop
 if jsonb_typeof(v_item)<>'object' then raise exception 'Invalid template table' using errcode='22023'; end if;
 if not(v_item ?& array['name','shape','capacity','x_cm','y_cm','width_cm','height_cm','rotation_deg']) or exists(select 1 from jsonb_object_keys(v_item) k where k not in ('name','shape','capacity','x_cm','y_cm','width_cm','height_cm','rotation_deg')) then raise exception 'Invalid table fields' using errcode='22023'; end if;
 if jsonb_typeof(v_item->'name')<>'string' or char_length(trim(v_item->>'name')) not between 1 and 150 or jsonb_typeof(v_item->'shape')<>'string' or (v_item->>'shape') not in ('round','rectangle') then raise exception 'Invalid table identity' using errcode='22023'; end if;
 if exists(select 1 from unnest(array['capacity','x_cm','y_cm','width_cm','height_cm','rotation_deg']) k where jsonb_typeof(v_item->k)<>'number' or (v_item->>k) !~ '^[0-9]{1,6}$') then raise exception 'Invalid table numbers' using errcode='22023'; end if;
 v_x:=(v_item->>'x_cm')::integer;v_y:=(v_item->>'y_cm')::integer;v_w:=(v_item->>'width_cm')::integer;v_h:=(v_item->>'height_cm')::integer;
 if (v_item->>'capacity')::integer not between 1 and 100 or (v_item->>'rotation_deg')::integer not between 0 and 359 or v_w not between 10 and 10000 or v_h not between 10 and 10000 or not private.seating_geometry_fits(v_item->>'shape',v_x,v_y,v_w,v_h,(v_item->>'rotation_deg')::integer,v_width,v_height) or ((v_item->>'shape')='round' and v_w<>v_h) then raise exception 'Invalid table geometry' using errcode='22023'; end if;
 end loop;
  if jsonb_array_length(p_document->'elements')>200 then raise exception 'Element limit exceeded' using errcode='22023'; end if;
  for v_item in select value from jsonb_array_elements(p_document->'elements') loop
   if not(v_item ? 'appearance') or not private.seating_element_valid(v_item,v_width,v_height) then raise exception 'Invalid element geometry' using errcode='22023'; end if;
  end loop;
end $function$
;
ALTER FUNCTION private.validate_seating_template(jsonb,integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.validate_seating_template(jsonb,integer) FROM PUBLIC, anon, authenticated, service_role;
