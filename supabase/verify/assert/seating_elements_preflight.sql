-- READ ONLY. Catalog baseline; does not invoke an application RPC.
begin read only;
set local search_path=pg_catalog,public;
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

select true as seating_elements_preflight_passed;
rollback;
