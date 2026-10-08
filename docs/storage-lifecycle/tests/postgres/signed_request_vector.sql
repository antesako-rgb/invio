-- ONLY isolated test DB. Fixed PUBLIC TEST KEY, never a production credential.
do $$ declare canonical text; signature text;
begin
 if encode(convert_to(('{}'::jsonb)::text,'UTF8'),'hex') <> '7b7d' then raise exception 'Body serialization mismatch'; end if;
 canonical := 'memora-cleanup-v1' || chr(10) || 'POST' || chr(10) || '/api/internal/storage-cleanup' || chr(10) || '1800000000' || chr(10) || '00000000-0000-4000-8000-000000000001' || chr(10) || encode(extensions.digest(convert_to(('{}'::jsonb)::text,'UTF8'),'sha256'),'hex');
 signature := encode(extensions.hmac(convert_to(canonical,'UTF8'),convert_to('test-key-ž-😀-not-a-production-secret','UTF8'),'sha256'),'hex');
 if signature <> '632cbdb2e1cb37d3cff9f32ff19e6ebe20e10dbccf2522e823884eab160b8d8a' then raise exception 'SQL/Node canonical HMAC mismatch'; end if;
end $$;
