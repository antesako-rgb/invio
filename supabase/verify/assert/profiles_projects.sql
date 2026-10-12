-- READ ONLY, metadata-only PASS/FAIL for this prepared slice; no RPC calls.
-- Does not establish runtime authorization or concurrent behavior.
begin read only;
set local search_path=pg_catalog,public;
do $verify$
declare expected jsonb := $expected$
{
  "tables": [
    {
      "schema": "public",
      "name": "profiles",
      "owner": "postgres",
      "rls": true,
      "force_rls": false,
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "default": null,
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "email",
          "type": "text",
          "default": null,
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "first_name",
          "type": "text",
          "default": null,
          "identity": "",
          "not_null": false,
          "generated": ""
        },
        {
          "name": "last_name",
          "type": "text",
          "default": null,
          "identity": "",
          "not_null": false,
          "generated": ""
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "default": "now()",
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone",
          "default": "now()",
          "identity": "",
          "not_null": true,
          "generated": ""
        }
      ],
      "constraints": [
        {
          "name": "profiles_email_check",
          "type": "c",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "CHECK (((char_length(email) > 0) AND (email = lower(TRIM(BOTH FROM email)))))",
          "references": null
        },
        {
          "name": "profiles_email_key",
          "type": "u",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "UNIQUE (email)",
          "references": null
        },
        {
          "name": "profiles_first_name_check",
          "type": "c",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "CHECK (((first_name IS NULL) OR ((char_length(TRIM(BOTH FROM first_name)) >= 1) AND (char_length(TRIM(BOTH FROM first_name)) <= 100))))",
          "references": null
        },
        {
          "name": "profiles_id_fkey",
          "type": "f",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE",
          "references": "auth.users"
        },
        {
          "name": "profiles_last_name_check",
          "type": "c",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "CHECK (((last_name IS NULL) OR ((char_length(TRIM(BOTH FROM last_name)) >= 1) AND (char_length(TRIM(BOTH FROM last_name)) <= 100))))",
          "references": null
        },
        {
          "name": "profiles_pkey",
          "type": "p",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "PRIMARY KEY (id)",
          "references": null
        }
      ],
      "grants": [
        {
          "role": "authenticated",
          "grantable": false,
          "privilege": "SELECT"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "DELETE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "INSERT"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "MAINTAIN"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "REFERENCES"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "SELECT"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "TRIGGER"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "TRUNCATE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "UPDATE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "DELETE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "INSERT"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "MAINTAIN"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "REFERENCES"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "SELECT"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "TRIGGER"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "TRUNCATE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "UPDATE"
        }
      ],
      "column_grants": [
        {
          "role": "authenticated",
          "column": "first_name",
          "grantable": false,
          "privilege": "UPDATE"
        },
        {
          "role": "authenticated",
          "column": "last_name",
          "grantable": false,
          "privilege": "UPDATE"
        }
      ]
    },
    {
      "schema": "public",
      "name": "projects",
      "owner": "postgres",
      "rls": true,
      "force_rls": false,
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "default": "gen_random_uuid()",
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "owner_id",
          "type": "uuid",
          "default": null,
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "name",
          "type": "text",
          "default": null,
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "default": "now()",
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "updated_at",
          "type": "timestamp with time zone",
          "default": "now()",
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "type",
          "type": "text",
          "default": null,
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "custom_type",
          "type": "text",
          "default": null,
          "identity": "",
          "not_null": false,
          "generated": ""
        },
        {
          "name": "start_date",
          "type": "date",
          "default": null,
          "identity": "",
          "not_null": true,
          "generated": ""
        },
        {
          "name": "start_time",
          "type": "time without time zone",
          "default": null,
          "identity": "",
          "not_null": false,
          "generated": ""
        },
        {
          "name": "location_name",
          "type": "text",
          "default": null,
          "identity": "",
          "not_null": false,
          "generated": ""
        },
        {
          "name": "location_address",
          "type": "text",
          "default": null,
          "identity": "",
          "not_null": false,
          "generated": ""
        }
      ],
      "constraints": [
        {
          "name": "projects_custom_type_check",
          "type": "c",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "CHECK ((((type = 'other'::text) AND (custom_type IS NOT NULL) AND ((char_length(TRIM(BOTH FROM custom_type)) >= 1) AND (char_length(TRIM(BOTH FROM custom_type)) <= 100))) OR ((type <> 'other'::text) AND (custom_type IS NULL))))",
          "references": null
        },
        {
          "name": "projects_location_address_check",
          "type": "c",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "CHECK (((location_address IS NULL) OR ((char_length(TRIM(BOTH FROM location_address)) >= 1) AND (char_length(TRIM(BOTH FROM location_address)) <= 250))))",
          "references": null
        },
        {
          "name": "projects_location_name_check",
          "type": "c",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "CHECK (((location_name IS NULL) OR ((char_length(TRIM(BOTH FROM location_name)) >= 1) AND (char_length(TRIM(BOTH FROM location_name)) <= 150))))",
          "references": null
        },
        {
          "name": "projects_name_length_check",
          "type": "c",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 150)))",
          "references": null
        },
        {
          "name": "projects_owner_id_fkey",
          "type": "f",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE",
          "references": "profiles"
        },
        {
          "name": "projects_pkey",
          "type": "p",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "PRIMARY KEY (id)",
          "references": null
        },
        {
          "name": "projects_type_check",
          "type": "c",
          "deferred": false,
          "validated": true,
          "deferrable": false,
          "definition": "CHECK ((type = ANY (ARRAY['wedding'::text, 'birthday'::text, 'baptism'::text, 'communion'::text, 'confirmation'::text, 'business'::text, 'other'::text])))",
          "references": null
        }
      ],
      "grants": [
        {
          "role": "authenticated",
          "grantable": false,
          "privilege": "SELECT"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "DELETE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "INSERT"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "MAINTAIN"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "REFERENCES"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "SELECT"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "TRIGGER"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "TRUNCATE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "UPDATE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "DELETE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "INSERT"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "MAINTAIN"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "REFERENCES"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "SELECT"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "TRIGGER"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "TRUNCATE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "UPDATE"
        }
      ],
      "column_grants": []
    }
  ],
  "functions": [
    {
      "schema": "private",
      "name": "handle_new_user",
      "signature": "private.handle_new_user()",
      "identity_arguments": "",
      "result": "trigger",
      "arguments": "",
      "cost": 100,
      "rows": 0,
      "owner": "postgres",
      "security_definer": true,
      "settings": [
        "search_path=\"\""
      ],
      "volatility": "v",
      "parallel": "u",
      "strict": false,
      "leakproof": false,
      "language": "plpgsql",
      "body_lf_md5": "eb4228bb4d37aa48dcac41f7df01c039",
      "grants": [
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "EXECUTE"
        }
      ]
    },
    {
      "schema": "private",
      "name": "is_project_member",
      "signature": "private.is_project_member(uuid,uuid)",
      "identity_arguments": "p_project_id uuid, p_user_id uuid",
      "result": "boolean",
      "arguments": "p_project_id uuid, p_user_id uuid DEFAULT auth.uid()",
      "cost": 100,
      "rows": 0,
      "owner": "postgres",
      "security_definer": true,
      "settings": [
        "search_path=\"\""
      ],
      "volatility": "s",
      "parallel": "u",
      "strict": false,
      "leakproof": false,
      "language": "sql",
      "body_lf_md5": "456f8b2b83497c80b559709e36de7ec3",
      "grants": [
        {
          "role": "authenticated",
          "grantable": false,
          "privilege": "EXECUTE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "EXECUTE"
        }
      ]
    },
    {
      "schema": "private",
      "name": "is_project_owner",
      "signature": "private.is_project_owner(uuid,uuid)",
      "identity_arguments": "p_project_id uuid, p_user_id uuid",
      "result": "boolean",
      "arguments": "p_project_id uuid, p_user_id uuid DEFAULT auth.uid()",
      "cost": 100,
      "rows": 0,
      "owner": "postgres",
      "security_definer": true,
      "settings": [
        "search_path=\"\""
      ],
      "volatility": "s",
      "parallel": "u",
      "strict": false,
      "leakproof": false,
      "language": "sql",
      "body_lf_md5": "c09ce26452f19a1aa62ae11f32737bd9",
      "grants": [
        {
          "role": "authenticated",
          "grantable": false,
          "privilege": "EXECUTE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "EXECUTE"
        }
      ]
    },
    {
      "schema": "private",
      "name": "update_timestamp",
      "signature": "private.update_timestamp()",
      "identity_arguments": "",
      "result": "trigger",
      "arguments": "",
      "cost": 100,
      "rows": 0,
      "owner": "postgres",
      "security_definer": false,
      "settings": [
        "search_path=\"\""
      ],
      "volatility": "v",
      "parallel": "u",
      "strict": false,
      "leakproof": false,
      "language": "plpgsql",
      "body_lf_md5": "edfe945cb42f07db97719fd063f86a40",
      "grants": [
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "EXECUTE"
        }
      ]
    },
    {
      "schema": "public",
      "name": "create_project",
      "signature": "create_project(text,text,date,text,time without time zone,text,text)",
      "identity_arguments": "p_name text, p_type text, p_start_date date, p_custom_type text, p_start_time time without time zone, p_location_name text, p_location_address text",
      "result": "projects",
      "arguments": "p_name text, p_type text, p_start_date date, p_custom_type text DEFAULT NULL::text, p_start_time time without time zone DEFAULT NULL::time without time zone, p_location_name text DEFAULT NULL::text, p_location_address text DEFAULT NULL::text",
      "cost": 100,
      "rows": 0,
      "owner": "postgres",
      "security_definer": true,
      "settings": [
        "search_path=\"\""
      ],
      "volatility": "v",
      "parallel": "u",
      "strict": false,
      "leakproof": false,
      "language": "plpgsql",
      "body_lf_md5": "db6748e3e6ea4de378de9a645243ab1b",
      "grants": [
        {
          "role": "authenticated",
          "grantable": false,
          "privilege": "EXECUTE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "EXECUTE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "EXECUTE"
        }
      ]
    },
    {
      "schema": "public",
      "name": "delete_project",
      "signature": "delete_project(uuid)",
      "identity_arguments": "p_project_id uuid",
      "result": "void",
      "arguments": "p_project_id uuid",
      "cost": 100,
      "rows": 0,
      "owner": "postgres",
      "security_definer": true,
      "settings": [
        "search_path=\"\""
      ],
      "volatility": "v",
      "parallel": "u",
      "strict": false,
      "leakproof": false,
      "language": "plpgsql",
      "body_lf_md5": "4465b59415ae89c110a2d462d01f34e0",
      "grants": [
        {
          "role": "authenticated",
          "grantable": false,
          "privilege": "EXECUTE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "EXECUTE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "EXECUTE"
        }
      ]
    },
    {
      "schema": "public",
      "name": "update_project",
      "signature": "update_project(uuid,text,text,date,text,time without time zone,text,text)",
      "identity_arguments": "p_project_id uuid, p_name text, p_type text, p_start_date date, p_custom_type text, p_start_time time without time zone, p_location_name text, p_location_address text",
      "result": "projects",
      "arguments": "p_project_id uuid, p_name text, p_type text, p_start_date date, p_custom_type text DEFAULT NULL::text, p_start_time time without time zone DEFAULT NULL::time without time zone, p_location_name text DEFAULT NULL::text, p_location_address text DEFAULT NULL::text",
      "cost": 100,
      "rows": 0,
      "owner": "postgres",
      "security_definer": true,
      "settings": [
        "search_path=\"\""
      ],
      "volatility": "v",
      "parallel": "u",
      "strict": false,
      "leakproof": false,
      "language": "plpgsql",
      "body_lf_md5": "b2d043569ff932ba6a21bbea5713e977",
      "grants": [
        {
          "role": "authenticated",
          "grantable": false,
          "privilege": "EXECUTE"
        },
        {
          "role": "postgres",
          "grantable": false,
          "privilege": "EXECUTE"
        },
        {
          "role": "service_role",
          "grantable": false,
          "privilege": "EXECUTE"
        }
      ]
    }
  ],
  "indexes": [
    {
      "schema": "public",
      "table_name": "profiles",
      "name": "profiles_email_key",
      "definition": "CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email)",
      "primary": false,
      "unique": true,
      "valid": true,
      "ready": true
    },
    {
      "schema": "public",
      "table_name": "profiles",
      "name": "profiles_pkey",
      "definition": "CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)",
      "primary": true,
      "unique": true,
      "valid": true,
      "ready": true
    },
    {
      "schema": "public",
      "table_name": "projects",
      "name": "projects_owner_id_idx",
      "definition": "CREATE INDEX projects_owner_id_idx ON public.projects USING btree (owner_id)",
      "primary": false,
      "unique": false,
      "valid": true,
      "ready": true
    },
    {
      "schema": "public",
      "table_name": "projects",
      "name": "projects_pkey",
      "definition": "CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id)",
      "primary": true,
      "unique": true,
      "valid": true,
      "ready": true
    }
  ],
  "policies": [
    {
      "schema": "public",
      "table_name": "profiles",
      "name": "profiles_select",
      "command": "r",
      "permissive": true,
      "roles": [
        "authenticated"
      ],
      "using": "(id = auth.uid())",
      "check": null
    },
    {
      "schema": "public",
      "table_name": "profiles",
      "name": "profiles_update",
      "command": "w",
      "permissive": true,
      "roles": [
        "authenticated"
      ],
      "using": "(id = auth.uid())",
      "check": "(id = auth.uid())"
    },
    {
      "schema": "public",
      "table_name": "projects",
      "name": "projects_select",
      "command": "r",
      "permissive": true,
      "roles": [
        "authenticated"
      ],
      "using": "private.is_project_member(id)",
      "check": null
    }
  ],
  "triggers": [
    {
      "schema": "auth",
      "table_name": "users",
      "name": "on_auth_user_created",
      "enabled": "O",
      "definition": "CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION private.handle_new_user()",
      "function": "private.handle_new_user()"
    },
    {
      "schema": "public",
      "table_name": "profiles",
      "name": "set_profiles_updated_at",
      "enabled": "O",
      "definition": "CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.update_timestamp()",
      "function": "private.update_timestamp()"
    },
    {
      "schema": "public",
      "table_name": "projects",
      "name": "set_projects_updated_at",
      "enabled": "O",
      "definition": "CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION private.update_timestamp()",
      "function": "private.update_timestamp()"
    },
    {
      "schema": "public",
      "table_name": "projects",
      "name": "storage_project_deleted",
      "enabled": "O",
      "definition": "CREATE TRIGGER storage_project_deleted AFTER DELETE ON public.projects FOR EACH ROW EXECUTE FUNCTION private.storage_project_deleted()",
      "function": "private.storage_project_deleted()"
    }
  ],
  "schema_permissions": [
    {
      "schema": "private",
      "owner": "postgres",
      "anon_usage": false,
      "member_usage": false,
      "service_usage": false,
      "anon_create": false,
      "member_create": false,
      "service_create": false
    },
    {
      "schema": "public",
      "owner": "pg_database_owner",
      "anon_usage": true,
      "member_usage": true,
      "service_usage": true,
      "anon_create": false,
      "member_create": false,
      "service_create": false
    }
  ]
}
$expected$::jsonb;
actual jsonb;
begin
  select coalesce(jsonb_agg(to_jsonb(s) order by s.schema,s.name), '[]'::jsonb)
into actual
from (select n.nspname as schema,c.relname as name,pg_get_userbyid(c.relowner) as owner,c.relrowsecurity as rls,c.relforcerowsecurity as force_rls,
(select coalesce(jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'not_null',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'identity',a.attidentity,'generated',a.attgenerated) order by a.attnum),'[]') from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped) as columns,
(select coalesce(jsonb_agg(jsonb_build_object('name',con.conname,'type',con.contype,'definition',pg_get_constraintdef(con.oid),'validated',con.convalidated,'deferrable',con.condeferrable,'deferred',con.condeferred,'references',case when con.confrelid<>0 then con.confrelid::regclass::text end) order by con.conname),'[]') from pg_constraint con where con.conrelid=c.oid) as constraints,
(select coalesce(jsonb_agg(jsonb_build_object('role',case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,'privilege',a.privilege_type,'grantable',a.is_grantable) order by case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,a.privilege_type),'[]') from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a) as grants,
(select coalesce(jsonb_agg(jsonb_build_object('column',a.attname,'role',case when g.grantee=0 then 'PUBLIC' else pg_get_userbyid(g.grantee) end,'privilege',g.privilege_type,'grantable',g.is_grantable) order by a.attname,case when g.grantee=0 then 'PUBLIC' else pg_get_userbyid(g.grantee) end,g.privilege_type),'[]') from pg_attribute a cross join lateral aclexplode(a.attacl) g where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped) as column_grants
from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relkind='r' order by 1,2) s where s.schema='public' and s.name in ('profiles','projects');
  if actual is distinct from expected->'tables' then
    raise exception 'FAIL: profiles/projects tables catalog drift';
  end if;

  select coalesce(jsonb_agg(to_jsonb(s) - 'definition' - 'source_references' order by s.schema,s.signature), '[]'::jsonb)
into actual
from (select n.nspname as schema,p.proname as name,p.oid::regprocedure::text as signature,pg_get_function_identity_arguments(p.oid) as identity_arguments,pg_get_function_result(p.oid) as result,pg_get_function_arguments(p.oid) as arguments,p.procost as cost,p.prorows as rows,pg_get_userbyid(p.proowner) as owner,p.prosecdef as security_definer,p.proconfig as settings,p.provolatile as volatility,p.proparallel as parallel,p.proisstrict as strict,p.proleakproof as leakproof,(select lanname from pg_language where oid=p.prolang) as language,md5(replace(p.prosrc,chr(13),'')) as body_lf_md5,
(select coalesce(jsonb_agg(jsonb_build_object('role',case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,'privilege',a.privilege_type,'grantable',a.is_grantable) order by case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,a.privilege_type),'[]') from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a) as grants,
array(select distinct m[1] from regexp_matches(p.prosrc,'((?:public|private|auth|storage|vault|net|extensions)\.[a-zA-Z_][a-zA-Z_0-9]*)','g') m order by 1) as source_references,
case when p.proname in ('update_timestamp','handle_new_user','is_project_owner','is_project_member','create_project','update_project','delete_project') then pg_get_functiondef(p.oid) end as definition
from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and not exists(select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e') and p.prokind='f' order by 1,3) s where s.signature in ('private.handle_new_user()','private.is_project_member(uuid,uuid)','private.is_project_owner(uuid,uuid)','private.update_timestamp()','create_project(text,text,date,text,time without time zone,text,text)','delete_project(uuid)','update_project(uuid,text,text,date,text,time without time zone,text,text)');
  if actual is distinct from expected->'functions' then
    raise exception 'FAIL: profiles/projects functions catalog drift';
  end if;

  select coalesce(jsonb_agg(to_jsonb(s) order by s.schema,s.table_name,s.name), '[]'::jsonb)
into actual
from (select n.nspname as schema,c.relname as table_name,i.relname as name,pg_get_indexdef(i.oid) as definition,x.indisprimary as primary,x.indisunique as unique,x.indisvalid as valid,x.indisready as ready from pg_index x join pg_class i on i.oid=x.indexrelid join pg_class c on c.oid=x.indrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') order by 1,2,3) s where s.schema='public' and s.table_name in ('profiles','projects');
  if actual is distinct from expected->'indexes' then
    raise exception 'FAIL: profiles/projects indexes catalog drift';
  end if;

  select coalesce(jsonb_agg(to_jsonb(s) order by s.schema,s.table_name,s.name), '[]'::jsonb)
into actual
from (select n.nspname as schema,c.relname as table_name,p.polname as name,p.polcmd as command,p.polpermissive as permissive,to_jsonb(array(select case when r=0 then 'PUBLIC' else pg_get_userbyid(r) end from unnest(p.polroles) r order by 1)) as roles,pg_get_expr(p.polqual,p.polrelid) as using,pg_get_expr(p.polwithcheck,p.polrelid) as check from pg_policy p join pg_class c on c.oid=p.polrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') order by 1,2,3) s where s.schema='public' and s.table_name in ('profiles','projects');
  if actual is distinct from expected->'policies' then
    raise exception 'FAIL: profiles/projects policies catalog drift';
  end if;

  select coalesce(jsonb_agg(to_jsonb(s) order by s.schema,s.table_name,s.name), '[]'::jsonb)
into actual
from (select n.nspname as schema,c.relname as table_name,t.tgname as name,t.tgenabled as enabled,pg_get_triggerdef(t.oid) as definition,p.oid::regprocedure::text as function from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid join pg_namespace fn on fn.oid=p.pronamespace where not t.tgisinternal and (n.nspname in ('public','private') or (n.nspname in ('auth','storage') and fn.nspname in ('public','private'))) order by 1,2,3) s where (s.schema='public' and s.table_name in ('profiles','projects')) or (s.schema='auth' and s.name='on_auth_user_created');
  if actual is distinct from expected->'triggers' then
    raise exception 'FAIL: profiles/projects triggers catalog drift';
  end if;

  select coalesce(jsonb_agg(to_jsonb(s) order by s.schema), '[]'::jsonb)
into actual
from (select n.nspname as schema,pg_get_userbyid(n.nspowner) as owner,has_schema_privilege('anon',n.oid,'USAGE') as anon_usage,has_schema_privilege('authenticated',n.oid,'USAGE') as member_usage,has_schema_privilege('service_role',n.oid,'USAGE') as service_usage,has_schema_privilege('anon',n.oid,'CREATE') as anon_create,has_schema_privilege('authenticated',n.oid,'CREATE') as member_create,has_schema_privilege('service_role',n.oid,'CREATE') as service_create from pg_namespace n where n.nspname in ('public','private') order by 1) s where true;
  if actual is distinct from expected->'schema_permissions' then
    raise exception 'FAIL: profiles/projects schema_permissions catalog drift';
  end if;
end $verify$;
select true as profiles_projects_catalog_verified,
  false as reconstruction_runtime_tested, false as security_behavior_tested;
rollback;
