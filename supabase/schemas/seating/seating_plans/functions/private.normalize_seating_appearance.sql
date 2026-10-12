CREATE OR REPLACE FUNCTION private.normalize_seating_appearance(p_target text, p_value jsonb) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $function$
declare keys text[]; defaults jsonb; v jsonb; k text;
begin
 if p_value is null or jsonb_typeof(p_value)<>'object' then raise exception 'Invalid appearance' using errcode='22023'; end if;
 case p_target
 when 'room' then defaults:='{"floor_style":"neutral","table_theme":"generic"}';
 when 'table_theme' then defaults:='{"table_theme":"generic"}';
 when 'dance_floor' then defaults:='{"style":"classic_parquet"}';
 when 'stage','dj_booth' then defaults:='{}';
 else raise exception 'Invalid appearance target' using errcode='22023'; end case;
 if exists(select 1 from jsonb_object_keys(p_value) a where not(defaults ? a)) then raise exception 'Invalid appearance fields' using errcode='22023'; end if;
 v:=defaults||p_value;
 for k in select jsonb_object_keys(v) loop
   if jsonb_typeof(v->k)<>'string' then raise exception 'Invalid appearance value' using errcode='22023'; end if;
   case k
   when 'floor_style' then keys:=array['neutral','light_oak','dark_oak','marble','tiles','concrete'];
   when 'table_theme' then keys:=array['generic','classic_ivory','rustic_green','modern_white','elegant_gold'];
   when 'style' then keys:=array['classic_parquet','herringbone','dark_wood','white','black_white','minimal'];
   end case;
   if not((v->>k)=any(keys)) then raise exception 'Invalid appearance value' using errcode='22023'; end if;
 end loop;return v;
end
$function$;
ALTER FUNCTION private.normalize_seating_appearance(text, jsonb) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.normalize_seating_appearance(text, jsonb) FROM PUBLIC, anon, authenticated, service_role;
