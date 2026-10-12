CREATE OR REPLACE FUNCTION private.seating_template_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin perform private.validate_seating_template(new.document,new.document_version);new.updated_at:=now();return new;end $function$
;
ALTER FUNCTION private.seating_template_guard() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_template_guard() FROM PUBLIC, anon, authenticated, service_role;
