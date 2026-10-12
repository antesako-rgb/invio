-- MANUAL ONLY. Existing reviewed DEV model; not a clean TEST baseline.
-- Execute THIS file once OR follow the install link to this SAME file, never both.
-- Close seating editors first. Review DEV project identity in Dashboard.
begin;
set local search_path=pg_catalog,public;
set local lock_timeout='5s';
set local statement_timeout='30s';
lock table public.seating_plans,public.seating_templates in access exclusive mode;
do $preflight$
declare v record; p pg_proc;
begin
 if current_user<>'postgres' then raise exception 'Run as postgres'; end if;
 if to_regclass('public.seating_elements') is not null or to_regprocedure('public.manage_seating_element(uuid,bigint,uuid,text,jsonb)') is not null or to_regprocedure('private.seating_element_valid(jsonb,integer,integer)') is not null or to_regprocedure('private.seating_element_guard()') is not null then raise exception 'Elements model already present; run verify instead'; end if;
 for v in select * from jsonb_to_recordset($baseline$[{"signature":"public.create_seating_plan_from_template(uuid,uuid,text,uuid)","body_md5":"af977c103b89aa9743fca0cd34536200","security_definer":true,"acl":"{postgres=X/postgres,authenticated=X/postgres}"},{"signature":"public.manage_seating_plan(uuid,uuid,bigint,text,text,integer,integer,uuid)","body_md5":"53ac76e7db25553802860762744ac86e","security_definer":true,"acl":"{postgres=X/postgres,authenticated=X/postgres}"},{"signature":"public.manage_seating_table(uuid,bigint,uuid,text,text,text,integer,integer,integer,integer,integer,integer)","body_md5":"478a47439ea4d4094a89a4ca5ec45142","security_definer":true,"acl":"{postgres=X/postgres,authenticated=X/postgres}"},{"signature":"private.lock_seating_plan(uuid,bigint)","body_md5":"92e8c1d8e8e377943c9d8373d37e9990","security_definer":true,"acl":"{postgres=X/postgres}"},{"signature":"private.lock_seating_project(uuid)","body_md5":"afc87aa28cec1c1f49fd3538e6500da1","security_definer":true,"acl":"{postgres=X/postgres}"},{"signature":"private.seating_authorize(uuid)","body_md5":"36cf256df5cbd404712998b6cfed8707","security_definer":true,"acl":"{postgres=X/postgres}"},{"signature":"private.seating_geometry_fits(text,integer,integer,integer,integer,integer,integer,integer)","body_md5":"1189fbcd4fda859e7c6b42a9a42beff2","security_definer":false,"acl":"{postgres=X/postgres}"},{"signature":"private.seating_plan_guard()","body_md5":"fff202864e0aa86a7dfc1b43ac3ba971","security_definer":true,"acl":"{postgres=X/postgres}"},{"signature":"private.seating_template_guard()","body_md5":"00a73efea952ef30f234b6934819d455","security_definer":true,"acl":"{postgres=X/postgres}"},{"signature":"private.validate_seating_template(jsonb,integer)","body_md5":"1e75472be7b312b5ee38e29ab69df5cf","security_definer":true,"acl":"{postgres=X/postgres}"}]$baseline$::jsonb) as a(signature text,body_md5 text,security_definer boolean,acl text) loop
 select * into p from pg_proc where oid=to_regprocedure(v.signature);
 if not found then raise exception 'Baseline missing: %',v.signature; end if;
 if md5(replace(p.prosrc,chr(13),''))<>v.body_md5 or p.proowner<>'postgres'::regrole or p.prosecdef<>v.security_definer or p.proconfig is distinct from array['search_path=""']::text[] or p.proacl::text is distinct from v.acl then raise exception 'Baseline/security changed: %; review instead of bypassing guard',v.signature; end if;
 end loop;
 if not exists(select 1 from pg_constraint where conrelid='public.seating_templates'::regclass and conname='seating_templates_version_check' and pg_get_constraintdef(oid)='CHECK ((document_version = 1))' and convalidated)
 or not exists(select 1 from pg_constraint where conrelid='public.seating_plans'::regclass and contype='u' and pg_get_constraintdef(oid)='UNIQUE (project_id, id)') then raise exception 'Table baseline mismatch'; end if;
end $preflight$;


-- SOURCE supabase/schemas/seating/seating_elements/table.sql
CREATE TABLE public.seating_elements (
 id uuid DEFAULT gen_random_uuid() NOT NULL,
 project_id uuid NOT NULL, plan_id uuid NOT NULL, kind text NOT NULL, name text NOT NULL,
 x_cm integer NOT NULL, y_cm integer NOT NULL, width_cm integer NOT NULL, height_cm integer NOT NULL,
 rotation_deg integer DEFAULT 0 NOT NULL, z_index integer DEFAULT 0 NOT NULL, locked boolean DEFAULT false NOT NULL,
 CONSTRAINT seating_elements_pk PRIMARY KEY (id),
 CONSTRAINT seating_elements_plan_fk FOREIGN KEY (project_id,plan_id) REFERENCES public.seating_plans(project_id,id) ON DELETE CASCADE,
 CONSTRAINT seating_elements_name_check CHECK (char_length(trim(name)) BETWEEN 1 AND 150),
 CONSTRAINT seating_elements_position_check CHECK (x_cm BETWEEN 0 AND 100000 AND y_cm BETWEEN 0 AND 100000),
 CONSTRAINT seating_elements_rotation_check CHECK (rotation_deg BETWEEN 0 AND 359),
 CONSTRAINT seating_elements_order_check CHECK (z_index BETWEEN 0 AND 10000),
 CONSTRAINT seating_elements_dimensions_check CHECK (
 (kind='dance_floor' AND width_cm BETWEEN 200 AND 2000 AND height_cm BETWEEN 200 AND 2000) OR
 (kind='stage' AND width_cm BETWEEN 200 AND 2000 AND height_cm BETWEEN 120 AND 1200) OR
 (kind='dj_booth' AND width_cm BETWEEN 120 AND 500 AND height_cm BETWEEN 60 AND 300))
);
ALTER TABLE public.seating_elements OWNER TO postgres;


-- SOURCE supabase/schemas/seating/seating_elements/indexes.sql
CREATE INDEX seating_elements_plan_order_idx ON public.seating_elements(plan_id,z_index,id);
CREATE INDEX seating_elements_project_idx ON public.seating_elements(project_id);


-- SOURCE supabase/schemas/seating/seating_elements/grants.sql
REVOKE ALL ON TABLE public.seating_elements FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.seating_elements TO authenticated;


-- SOURCE supabase/schemas/seating/seating_elements/rls.sql
ALTER TABLE public.seating_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_elements NO FORCE ROW LEVEL SECURITY;
CREATE POLICY seating_elements_member_select ON public.seating_elements FOR SELECT TO authenticated USING (private.is_project_member(project_id));


-- SOURCE supabase/schemas/seating/seating_elements/functions/private.seating_element_valid.sql
-- Canonical expected definition. Remote application is manual only.
CREATE OR REPLACE FUNCTION private.seating_element_valid(p_element jsonb,p_room_width integer,p_room_height integer)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $function$
declare k text; w integer; h integer;
begin
 if p_element is null or jsonb_typeof(p_element)<>'object' then return false; end if;
 if not(p_element ?& array['kind','name','x_cm','y_cm','width_cm','height_cm','rotation_deg','z_index','locked'])
 or exists(select 1 from jsonb_object_keys(p_element) a where a not in ('kind','name','x_cm','y_cm','width_cm','height_cm','rotation_deg','z_index','locked')) then return false; end if;
 if jsonb_typeof(p_element->'kind') is distinct from 'string' or jsonb_typeof(p_element->'name') is distinct from 'string'
 or jsonb_typeof(p_element->'locked') is distinct from 'boolean' or char_length(trim(p_element->>'name')) not between 1 and 150 then return false; end if;
 if exists(select 1 from unnest(array['x_cm','y_cm','width_cm','height_cm','rotation_deg','z_index']) a where jsonb_typeof(p_element->a) is distinct from 'number' or (p_element->>a) !~ '^[0-9]{1,6}$') then return false; end if;
 k:=p_element->>'kind'; w:=(p_element->>'width_cm')::integer; h:=(p_element->>'height_cm')::integer;
 if not ((k='dance_floor' and w between 200 and 2000 and h between 200 and 2000)
 or (k='stage' and w between 200 and 2000 and h between 120 and 1200)
 or (k='dj_booth' and w between 120 and 500 and h between 60 and 300)) then return false; end if;
 return (p_element->>'z_index')::integer between 0 and 10000 and
 coalesce(private.seating_geometry_fits('rectangle',(p_element->>'x_cm')::integer,(p_element->>'y_cm')::integer,w,h,(p_element->>'rotation_deg')::integer,p_room_width,p_room_height),false);
end $function$;
ALTER FUNCTION private.seating_element_valid(jsonb,integer,integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_element_valid(jsonb,integer,integer) FROM PUBLIC, anon, authenticated, service_role;


-- SOURCE supabase/schemas/seating/seating_elements/functions/private.seating_element_guard.sql
-- Canonical expected definition. Remote application is manual only.
CREATE OR REPLACE FUNCTION private.seating_element_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
declare v public.seating_plans;
begin
 if tg_op='UPDATE' then
  if (new.id,new.project_id,new.plan_id,new.kind) is distinct from (old.id,old.project_id,old.plan_id,old.kind) then raise exception 'Element identity immutable' using errcode='22023'; end if;
  if old.locked and (new.x_cm,new.y_cm,new.width_cm,new.height_cm,new.rotation_deg) is distinct from (old.x_cm,old.y_cm,old.width_cm,old.height_cm,old.rotation_deg) then raise exception 'Element locked' using errcode='22023'; end if;
 end if;
 select * into v from public.seating_plans where id=new.plan_id and project_id=new.project_id for update;
 if not found then raise exception 'Plan missing' using errcode='P0002'; end if;
 if not private.seating_element_valid(to_jsonb(new)-array['id','project_id','plan_id'],v.width_cm,v.height_cm) then raise exception 'Invalid element geometry' using errcode='22023'; end if;
 return new;
end $function$;
ALTER FUNCTION private.seating_element_guard() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_element_guard() FROM PUBLIC, anon, authenticated, service_role;


-- SOURCE supabase/schemas/seating/seating_elements/triggers.sql
CREATE TRIGGER seating_element_guard BEFORE INSERT OR UPDATE ON public.seating_elements FOR EACH ROW EXECUTE FUNCTION private.seating_element_guard();


-- SOURCE supabase/schemas/seating/seating_elements/functions/public.manage_seating_element.sql
-- Canonical expected definition. Remote application is manual only.
CREATE OR REPLACE FUNCTION public.manage_seating_element(p_plan_id uuid,p_revision bigint,p_element_id uuid,p_operation text,p_element jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $function$
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
   insert into public.seating_elements(project_id,plan_id,kind,name,x_cm,y_cm,width_cm,height_cm,rotation_deg,z_index,locked)
   values(v.project_id,v.id,p_element->>'kind',trim(p_element->>'name'),(p_element->>'x_cm')::integer,(p_element->>'y_cm')::integer,(p_element->>'width_cm')::integer,(p_element->>'height_cm')::integer,(p_element->>'rotation_deg')::integer,(p_element->>'z_index')::integer,(p_element->>'locked')::boolean) returning id into v_id;
  else
   update public.seating_elements set kind=p_element->>'kind',name=trim(p_element->>'name'),x_cm=(p_element->>'x_cm')::integer,y_cm=(p_element->>'y_cm')::integer,width_cm=(p_element->>'width_cm')::integer,height_cm=(p_element->>'height_cm')::integer,rotation_deg=(p_element->>'rotation_deg')::integer,z_index=(p_element->>'z_index')::integer,locked=(p_element->>'locked')::boolean where id=e.id and plan_id=v.id; v_id:=e.id;
  end if;
 else raise exception 'Invalid operation' using errcode='22023'; end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next;
 return jsonb_build_object('id',v_id,'revision',v_next);
end $function$;
ALTER FUNCTION public.manage_seating_element(uuid,bigint,uuid,text,jsonb) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.manage_seating_element(uuid,bigint,uuid,text,jsonb) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.manage_seating_element(uuid,bigint,uuid,text,jsonb) TO authenticated;


-- SOURCE supabase/schemas/seating/seating_plans/functions/private.seating_plan_guard.sql
-- Canonical expected definition. Remote application is manual only.
CREATE OR REPLACE FUNCTION private.seating_plan_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ begin if new.id is distinct from old.id or new.project_id is distinct from old.project_id then raise exception 'Plan identity immutable' using errcode='22023'; end if; if new.rsvp_invitation_id is distinct from old.rsvp_invitation_id and new.revision=old.revision then new.revision:=old.revision+1;new.updated_at:=now(); end if; if (new.width_cm,new.height_cm) is distinct from (old.width_cm,old.height_cm) and exists(select 1 from public.seating_elements e where e.plan_id=new.id and not private.seating_geometry_fits('rectangle',e.x_cm,e.y_cm,e.width_cm,e.height_cm,e.rotation_deg,new.width_cm,new.height_cm)) then raise exception 'Room too small' using errcode='22023'; end if; return new; end $function$;
ALTER FUNCTION private.seating_plan_guard() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.seating_plan_guard() FROM PUBLIC, anon, authenticated, service_role;


-- SOURCE supabase/schemas/seating/seating_templates/functions/private.validate_seating_template.sql
-- Canonical expected definition. Remote application is manual only.
CREATE OR REPLACE FUNCTION private.validate_seating_template(p_document jsonb, p_version integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_item jsonb; v_width integer; v_height integer; v_x integer; v_y integer; v_w integer; v_h integer;
begin
 if (p_version is null or p_version not in (1,2)) or p_document is null or jsonb_typeof(p_document)<>'object' then raise exception 'Unsupported template document' using errcode='22023'; end if;
 if not(p_document ?& array['width_cm','height_cm','tables']) or exists(select 1 from jsonb_object_keys(p_document) k where k not in ('width_cm','height_cm','tables','elements')) then raise exception 'Invalid template fields' using errcode='22023'; end if;
 if jsonb_typeof(p_document->'width_cm')<>'number' or jsonb_typeof(p_document->'height_cm')<>'number' or (p_document->>'width_cm') !~ '^[0-9]{1,6}$' or (p_document->>'height_cm') !~ '^[0-9]{1,6}$' or jsonb_typeof(p_document->'tables')<>'array' then raise exception 'Invalid template dimensions' using errcode='22023'; end if;
 if (p_version=1 and p_document ? 'elements') or (p_version=2 and (not(p_document ? 'elements') or jsonb_typeof(p_document->'elements') is distinct from 'array')) then raise exception 'Invalid template elements' using errcode='22023'; end if;
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
 if p_version=2 then
  if jsonb_array_length(p_document->'elements')>200 then raise exception 'Element limit exceeded' using errcode='22023'; end if;
  for v_item in select value from jsonb_array_elements(p_document->'elements') loop
   if not private.seating_element_valid(v_item,v_width,v_height) then raise exception 'Invalid element geometry' using errcode='22023'; end if;
  end loop;
 end if;
end $function$;
ALTER FUNCTION private.validate_seating_template(jsonb,integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.validate_seating_template(jsonb,integer) FROM PUBLIC, anon, authenticated, service_role;


-- SOURCE supabase/schemas/seating/seating_templates/functions/public.create_seating_plan_from_template.sql
-- Canonical expected definition. Remote application is manual only.
CREATE OR REPLACE FUNCTION public.create_seating_plan_from_template(p_project_id uuid, p_template_id uuid, p_name text, p_rsvp_invitation_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
 if v_template.document_version=2 then
 for v_item in select value from jsonb_array_elements(v_template.document->'elements') loop
 insert into public.seating_elements(project_id,plan_id,kind,name,x_cm,y_cm,width_cm,height_cm,rotation_deg,z_index,locked)
 values(p_project_id,v_plan.id,v_item->>'kind',trim(v_item->>'name'),(v_item->>'x_cm')::integer,(v_item->>'y_cm')::integer,(v_item->>'width_cm')::integer,(v_item->>'height_cm')::integer,(v_item->>'rotation_deg')::integer,(v_item->>'z_index')::integer,(v_item->>'locked')::boolean);
 end loop;
 end if;
 return to_jsonb(v_plan);
end $function$;
ALTER FUNCTION public.create_seating_plan_from_template(uuid,uuid,text,uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_seating_plan_from_template(uuid,uuid,text,uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_seating_plan_from_template(uuid,uuid,text,uuid) TO authenticated;

ALTER TABLE public.seating_templates DROP CONSTRAINT seating_templates_version_check;
ALTER TABLE public.seating_templates ADD CONSTRAINT seating_templates_version_check CHECK (document_version IN (1,2));
-- Structural/security assertion before COMMIT; generated from the same verify.
do $verify$
declare actual jsonb; expected constant jsonb := $expected${"table":{"acl":[{"grantee":"authenticated","grantor":"postgres","grantable":false,"privilege":"SELECT"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"DELETE"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"INSERT"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"MAINTAIN"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"REFERENCES"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"SELECT"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"TRIGGER"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"TRUNCATE"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"UPDATE"}],"rls":true,"owner":"postgres","columns":[{"acl":null,"name":"id","type":"uuid","default":"gen_random_uuid()","not_null":true},{"acl":null,"name":"project_id","type":"uuid","default":null,"not_null":true},{"acl":null,"name":"plan_id","type":"uuid","default":null,"not_null":true},{"acl":null,"name":"kind","type":"text","default":null,"not_null":true},{"acl":null,"name":"name","type":"text","default":null,"not_null":true},{"acl":null,"name":"x_cm","type":"integer","default":null,"not_null":true},{"acl":null,"name":"y_cm","type":"integer","default":null,"not_null":true},{"acl":null,"name":"width_cm","type":"integer","default":null,"not_null":true},{"acl":null,"name":"height_cm","type":"integer","default":null,"not_null":true},{"acl":null,"name":"rotation_deg","type":"integer","default":"0","not_null":true},{"acl":null,"name":"z_index","type":"integer","default":"0","not_null":true},{"acl":null,"name":"locked","type":"boolean","default":"false","not_null":true}],"indexes":[{"def":"CREATE UNIQUE INDEX seating_elements_pk ON public.seating_elements USING btree (id)","name":"seating_elements_pk","ready":true,"valid":true},{"def":"CREATE INDEX seating_elements_plan_order_idx ON public.seating_elements USING btree (plan_id, z_index, id)","name":"seating_elements_plan_order_idx","ready":true,"valid":true},{"def":"CREATE INDEX seating_elements_project_idx ON public.seating_elements USING btree (project_id)","name":"seating_elements_project_idx","ready":true,"valid":true}],"policies":[{"name":"seating_elements_member_select","qual":"private.is_project_member(project_id)","check":null,"roles":["authenticated"],"command":"r","permissive":true}],"triggers":[{"def":"CREATE TRIGGER seating_element_guard BEFORE INSERT OR UPDATE ON public.seating_elements FOR EACH ROW EXECUTE FUNCTION private.seating_element_guard()","name":"seating_element_guard","enabled":"O"}],"force_rls":false,"constraints":[{"def":"CHECK ((((kind = 'dance_floor'::text) AND ((width_cm >= 200) AND (width_cm <= 2000)) AND ((height_cm >= 200) AND (height_cm <= 2000))) OR ((kind = 'stage'::text) AND ((width_cm >= 200) AND (width_cm <= 2000)) AND ((height_cm >= 120) AND (height_cm <= 1200))) OR ((kind = 'dj_booth'::text) AND ((width_cm >= 120) AND (width_cm <= 500)) AND ((height_cm >= 60) AND (height_cm <= 300)))))","name":"seating_elements_dimensions_check","deferred":false,"validated":true,"deferrable":false},{"def":"CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 150)))","name":"seating_elements_name_check","deferred":false,"validated":true,"deferrable":false},{"def":"CHECK (((z_index >= 0) AND (z_index <= 10000)))","name":"seating_elements_order_check","deferred":false,"validated":true,"deferrable":false},{"def":"PRIMARY KEY (id)","name":"seating_elements_pk","deferred":false,"validated":true,"deferrable":false},{"def":"FOREIGN KEY (project_id, plan_id) REFERENCES seating_plans(project_id, id) ON DELETE CASCADE","name":"seating_elements_plan_fk","deferred":false,"validated":true,"deferrable":false},{"def":"CHECK ((((x_cm >= 0) AND (x_cm <= 100000)) AND ((y_cm >= 0) AND (y_cm <= 100000))))","name":"seating_elements_position_check","deferred":false,"validated":true,"deferrable":false},{"def":"CHECK (((rotation_deg >= 0) AND (rotation_deg <= 359)))","name":"seating_elements_rotation_check","deferred":false,"validated":true,"deferrable":false}]},"functions":[{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_plan uuid, p_revision bigint","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"92e8c1d8e8e377943c9d8373d37e9990","language":"plpgsql","signature":"private.lock_seating_plan(uuid, bigint)","volatility":"v","return_type":"seating_plans","security_definer":true},{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_project uuid","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"afc87aa28cec1c1f49fd3538e6500da1","language":"plpgsql","signature":"private.lock_seating_project(uuid)","volatility":"v","return_type":"void","security_definer":true},{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_project uuid","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"36cf256df5cbd404712998b6cfed8707","language":"plpgsql","signature":"private.seating_authorize(uuid)","volatility":"v","return_type":"void","security_definer":true},{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"a1f295bc0e44fb08fac7c7736fe3a0f9","language":"plpgsql","signature":"private.seating_element_guard()","volatility":"v","return_type":"trigger","security_definer":true},{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_element jsonb, p_room_width integer, p_room_height integer","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"c0c12305bff713a896606b3b98ca1769","language":"plpgsql","signature":"private.seating_element_valid(jsonb, integer, integer)","volatility":"i","return_type":"boolean","security_definer":false},{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_shape text, p_x integer, p_y integer, p_width integer, p_height integer, p_rotation integer, p_room_width integer, p_room_height integer","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":true,"body_md5":"1189fbcd4fda859e7c6b42a9a42beff2","language":"plpgsql","signature":"private.seating_geometry_fits(text, integer, integer, integer, integer, integer, integer, integer)","volatility":"i","return_type":"boolean","security_definer":false},{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"e22cb116079d3181726f4189c9b714fc","language":"plpgsql","signature":"private.seating_plan_guard()","volatility":"v","return_type":"trigger","security_definer":true},{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"00a73efea952ef30f234b6934819d455","language":"plpgsql","signature":"private.seating_template_guard()","volatility":"v","return_type":"trigger","security_definer":true},{"acl":[{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_document jsonb, p_version integer","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"64badf5c02c3331b637b9c9d6921d5fc","language":"plpgsql","signature":"private.validate_seating_template(jsonb, integer)","volatility":"v","return_type":"void","security_definer":true},{"acl":[{"grantee":"authenticated","grantor":"postgres","grantable":false,"privilege":"EXECUTE"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_project_id uuid, p_template_id uuid, p_name text, p_rsvp_invitation_id uuid DEFAULT NULL::uuid","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"e43ee2cde7b2779ae8bedd572b534ec8","language":"plpgsql","signature":"public.create_seating_plan_from_template(uuid, uuid, text, uuid)","volatility":"v","return_type":"jsonb","security_definer":true},{"acl":[{"grantee":"authenticated","grantor":"postgres","grantable":false,"privilege":"EXECUTE"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_plan_id uuid, p_revision bigint, p_element_id uuid, p_operation text, p_element jsonb DEFAULT NULL::jsonb","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"2cbf04e042f25919f520c3d00c7683b9","language":"plpgsql","signature":"public.manage_seating_element(uuid, bigint, uuid, text, jsonb)","volatility":"v","return_type":"jsonb","security_definer":true},{"acl":[{"grantee":"authenticated","grantor":"postgres","grantable":false,"privilege":"EXECUTE"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_project_id uuid, p_plan_id uuid, p_revision bigint, p_operation text, p_name text DEFAULT NULL::text, p_width_cm integer DEFAULT NULL::integer, p_height_cm integer DEFAULT NULL::integer, p_rsvp_invitation_id uuid DEFAULT NULL::uuid","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"53ac76e7db25553802860762744ac86e","language":"plpgsql","signature":"public.manage_seating_plan(uuid, uuid, bigint, text, text, integer, integer, uuid)","volatility":"v","return_type":"jsonb","security_definer":true},{"acl":[{"grantee":"authenticated","grantor":"postgres","grantable":false,"privilege":"EXECUTE"},{"grantee":"postgres","grantor":"postgres","grantable":false,"privilege":"EXECUTE"}],"args":"p_plan_id uuid, p_revision bigint, p_table_id uuid, p_operation text, p_name text DEFAULT NULL::text, p_shape text DEFAULT NULL::text, p_capacity integer DEFAULT NULL::integer, p_x_cm integer DEFAULT NULL::integer, p_y_cm integer DEFAULT NULL::integer, p_width_cm integer DEFAULT NULL::integer, p_height_cm integer DEFAULT NULL::integer, p_rotation_deg integer DEFAULT 0","kind":"f","owner":"postgres","config":["search_path=\"\""],"strict":false,"body_md5":"478a47439ea4d4094a89a4ca5ec45142","language":"plpgsql","signature":"public.manage_seating_table(uuid, bigint, uuid, text, text, text, integer, integer, integer, integer, integer, integer)","volatility":"v","return_type":"jsonb","security_definer":true}],"plan_trigger":"CREATE TRIGGER seating_plan_guard BEFORE UPDATE ON public.seating_plans FOR EACH ROW EXECUTE FUNCTION private.seating_plan_guard()","template_trigger":"CREATE TRIGGER seating_template_guard BEFORE INSERT OR UPDATE ON public.seating_templates FOR EACH ROW EXECUTE FUNCTION private.seating_template_guard()","template_version_constraint":"CHECK ((document_version = ANY (ARRAY[1, 2])))"}$expected$::jsonb;
begin
 select jsonb_build_object(
 'table', (select jsonb_build_object('owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,
 'columns',(select jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'not_null',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'acl',a.attacl::text) order by a.attnum) from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped),
 'constraints',(select jsonb_agg(jsonb_build_object('name',q.conname,'def',pg_get_constraintdef(q.oid),'validated',q.convalidated,'deferrable',q.condeferrable,'deferred',q.condeferred) order by q.conname) from pg_constraint q where q.conrelid=c.oid and q.contype<>'n'),
 'indexes',(select jsonb_agg(jsonb_build_object('name',i.indexrelid::regclass::text,'def',pg_get_indexdef(i.indexrelid),'valid',i.indisvalid,'ready',i.indisready) order by i.indexrelid::regclass::text) from pg_index i where i.indrelid=c.oid),
 'policies',(select jsonb_agg(jsonb_build_object('name',q.polname,'command',q.polcmd,'permissive',q.polpermissive,'qual',pg_get_expr(q.polqual,q.polrelid),'check',pg_get_expr(q.polwithcheck,q.polrelid),'roles',array(select rolname from pg_roles where oid=any(q.polroles) order by rolname)) order by q.polname) from pg_policy q where q.polrelid=c.oid),
 'acl',(select jsonb_agg(jsonb_build_object('grantee',case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,'grantor',pg_get_userbyid(a.grantor),'privilege',a.privilege_type,'grantable',a.is_grantable) order by a.grantee=0,pg_get_userbyid(a.grantee),a.privilege_type) from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a),
 'triggers',(select jsonb_agg(jsonb_build_object('name',t.tgname,'def',pg_get_triggerdef(t.oid),'enabled',t.tgenabled) order by t.tgname) from pg_trigger t where t.tgrelid=c.oid and not t.tgisinternal))
 from pg_class c where c.oid=to_regclass('public.seating_elements')),
 'functions',(select jsonb_agg(jsonb_build_object('signature',n.nspname||'.'||p.proname||'('||oidvectortypes(p.proargtypes)||')','body_md5',md5(replace(p.prosrc,chr(13),'')),'owner',pg_get_userbyid(p.proowner),'security_definer',p.prosecdef,'config',p.proconfig,'return_type',format_type(p.prorettype,null),'language',(select lanname from pg_language where oid=p.prolang),'kind',p.prokind,'strict',p.proisstrict,'volatility',p.provolatile,'args',pg_get_function_arguments(p.oid),
 'acl',(select jsonb_agg(jsonb_build_object('grantee',case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,'grantor',pg_get_userbyid(a.grantor),'privilege',a.privilege_type,'grantable',a.is_grantable) order by a.grantee=0,pg_get_userbyid(a.grantee),a.privilege_type) from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a)) order by n.nspname,p.proname)
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.proname in ('manage_seating_plan','manage_seating_table','manage_seating_element','seating_element_valid','seating_element_guard','seating_plan_guard','validate_seating_template','create_seating_plan_from_template','lock_seating_plan','lock_seating_project','seating_authorize','seating_geometry_fits','seating_template_guard')),
 'template_version_constraint',(select pg_get_constraintdef(oid) from pg_constraint where conrelid='public.seating_templates'::regclass and conname='seating_templates_version_check'),
 'plan_trigger',(select pg_get_triggerdef(oid) from pg_trigger where tgrelid='public.seating_plans'::regclass and tgname='seating_plan_guard' and tgenabled='O'),
 'template_trigger',(select pg_get_triggerdef(oid) from pg_trigger where tgrelid='public.seating_templates'::regclass and tgname='seating_template_guard' and tgenabled='O')
) into actual;
 if actual is distinct from expected then raise exception 'FAIL: seating elements source/schema/security mismatch; run inspect and compare expected manifest'; end if;
end $verify$;
-- Signature of existing RPCs is unchanged. Expose the new RPC after commit.
notify pgrst,'reload schema';
commit;
