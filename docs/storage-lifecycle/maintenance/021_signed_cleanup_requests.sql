-- REVIEW ONLY; NOT EXECUTED. As postgres; cleanup disabled, cron paused.
begin;
do $guard$
begin
 if to_regclass('vault.secrets') is null or to_regclass('vault.decrypted_secrets') is null then
  raise exception 'Required Vault objects are missing';
 end if;
 if to_regprocedure('extensions.hmac(bytea,bytea,text)') is null
 or to_regprocedure('extensions.digest(bytea,text)') is null then
  raise exception 'Confirm actual pgcrypto schema/signatures before install';
 end if;
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='vault' and c.relname in ('secrets','decrypted_secrets') and (
 has_any_column_privilege('anon',c.oid,'SELECT') or
 has_any_column_privilege('authenticated',c.oid,'SELECT') or
 exists(select 1 from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
 where a.grantee=0 and a.privilege_type='SELECT'))) then
  raise exception 'Vault is readable by PUBLIC, anon or authenticated; do not install signer until rights are secured';
 end if;
 -- Administrative service_role Vault access is reported separately; never revoked here.
 -- PUBLIC column grants must also fail closed, even without a table-level grant.
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 join pg_attribute a on a.attrelid=c.oid
 cross join lateral aclexplode(a.attacl) x
 where n.nspname='vault' and c.relname in ('secrets','decrypted_secrets')
 and x.grantee=0 and x.privilege_type='SELECT') then
  raise exception 'Vault has PUBLIC column SELECT grants';
 end if;
end;
$guard$;
create table private.storage_cleanup_request_ids (
 request_id uuid primary key,
 issued_at bigint not null,
 consumed_at timestamptz not null default clock_timestamp()
);
alter table private.storage_cleanup_request_ids enable row level security;
create policy deny_clients on private.storage_cleanup_request_ids as restrictive for all to public
 using (false) with check (false);
revoke all on private.storage_cleanup_request_ids from public, anon, authenticated, service_role;
create function public.storage_consume_cleanup_request(p_request_id uuid,p_timestamp bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
declare inserted integer; current_epoch bigint;
begin
 current_epoch := floor(extract(epoch from clock_timestamp()))::bigint;
 if p_request_id is null or p_timestamp is null or p_timestamp>current_epoch+30
 or p_timestamp<current_epoch-120 then return false; end if;
 -- Retain ten minutes beyond the entire accepted window; expired signed requests
 -- remain invalid even once their nonce row is pruned.
 delete from private.storage_cleanup_request_ids where issued_at<current_epoch-600;
 insert into private.storage_cleanup_request_ids(request_id,issued_at)
 values(p_request_id,p_timestamp) on conflict do nothing;
 get diagnostics inserted = row_count;
 return inserted=1;
end;
$$;
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
revoke all on function public.storage_consume_cleanup_request(uuid,bigint) from public,anon,authenticated;
grant execute on function public.storage_consume_cleanup_request(uuid,bigint) to service_role;
revoke all on function private.enqueue_signed_storage_cleanup() from public,anon,authenticated,service_role;
commit;
