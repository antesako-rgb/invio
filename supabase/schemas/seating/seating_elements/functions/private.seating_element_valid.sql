CREATE OR REPLACE FUNCTION private.seating_element_valid(p_element jsonb, p_room_width integer, p_room_height integer)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare k text; w integer; h integer;
begin
 if p_element is null or jsonb_typeof(p_element)<>'object' then return false; end if;
 if not(p_element ?& array['kind','name','x_cm','y_cm','width_cm','height_cm','rotation_deg','z_index','locked'])
 or exists(select 1 from jsonb_object_keys(p_element) a where a not in ('kind','name','x_cm','y_cm','width_cm','height_cm','rotation_deg','z_index','locked','appearance')) then return false; end if;
 if jsonb_typeof(p_element->'kind') is distinct from 'string' or jsonb_typeof(p_element->'name') is distinct from 'string'
 or jsonb_typeof(p_element->'locked') is distinct from 'boolean' or char_length(trim(p_element->>'name')) not between 1 and 150 then return false; end if;
 if exists(select 1 from unnest(array['x_cm','y_cm','width_cm','height_cm','rotation_deg','z_index']) a where jsonb_typeof(p_element->a) is distinct from 'number' or (p_element->>a) !~ '^[0-9]{1,6}$') then return false; end if;
 if p_element ? 'appearance' and not private.seating_appearance_valid(p_element->>'kind',p_element->'appearance') then return false;end if;
 k:=p_element->>'kind'; w:=(p_element->>'width_cm')::integer; h:=(p_element->>'height_cm')::integer;
 if not ((k='dance_floor' and w between 200 and 2000 and h between 200 and 2000)
 or (k='stage' and w between 200 and 2000 and h between 120 and 1200)
 or (k='dj_booth' and w between 120 and 500 and h between 60 and 300)) then return false; end if;
 return (p_element->>'z_index')::integer between 0 and 10000 and
 coalesce(private.seating_geometry_fits('rectangle',(p_element->>'x_cm')::integer,(p_element->>'y_cm')::integer,w,h,(p_element->>'rotation_deg')::integer,p_room_width,p_room_height),false);
end $function$
;
ALTER FUNCTION private.seating_element_valid(jsonb,integer,integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_element_valid(jsonb,integer,integer) FROM PUBLIC, anon, authenticated, service_role;
