CREATE OR REPLACE FUNCTION private.seating_appearance_valid(p_target text, p_value jsonb) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path='' AS $function$
begin perform private.normalize_seating_appearance(p_target,p_value);return true;exception when invalid_parameter_value then return false;end
$function$;
ALTER FUNCTION private.seating_appearance_valid(text, jsonb) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_appearance_valid(text, jsonb) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.seating_appearance_valid(text, jsonb) TO service_role;
