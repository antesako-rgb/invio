-- SAVE / REVIEW ONLY. SQL021 APPLIED by operator; do not execute separately.
create function private.enqueue_signed_storage_cleanup() returns bigint
language plpgsql security definer set search_path = '' as $$
declare signing_key text; issued text; request_id text; body jsonb := '{}'::jsonb; body_bytes bytea; canonical text; signature text;
begin
 select decrypted_secret into strict signing_key from vault.decrypted_secrets
 where name='memora_storage_cleanup_secret';
 if signing_key is null or length(signing_key)<32 then
  raise exception 'Signing configuration unavailable';
 end if;
 -- pg_net 0.20.4 serializes POST jsonb using convert_to(body::text,'UTF8').
 body_bytes := convert_to(body::text,'UTF8');
 if body_bytes <> decode('7b7d','hex') then raise exception 'Unexpected body serialization'; end if;
 issued := floor(extract(epoch from clock_timestamp()))::bigint::text;
 request_id := gen_random_uuid()::text;
 canonical := 'memora-cleanup-v1' || chr(10) || 'POST' || chr(10) ||
 '/api/internal/storage-cleanup' || chr(10) || issued || chr(10) || request_id || chr(10) ||
 encode(extensions.digest(body_bytes,'sha256'),'hex');
 signature := encode(extensions.hmac(convert_to(canonical,'UTF8'),convert_to(signing_key,'UTF8'),'sha256'),'hex');
 -- Only signature and nonsecret metadata enter the queue; NEVER the signing key.
 return net.http_post(url:='https://invio-phi.vercel.app/api/internal/storage-cleanup',
 body:=body, headers:=jsonb_build_object('Content-Type','application/json',
 'x-cleanup-timestamp',issued,'x-cleanup-id',request_id,'x-cleanup-signature',signature),
 timeout_milliseconds:=240000);
exception when others then
 -- Sanitize underlying Vault/HTTP errors; do not expose key-bearing expressions.
 raise exception 'Signed cleanup enqueue failed';
end;
$$;
