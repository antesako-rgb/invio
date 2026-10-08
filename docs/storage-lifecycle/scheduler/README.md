# Signed Supabase Cron — REVIEW ONLY, not installed/activated

Application now accepts signed requests ONLY; old Bearer requests return 401.
Keep STORAGE_CLEANUP_ENABLED=false in Vercel and no active job during rollout.

Protocol (UTF-8, LF, no trailing newline):
memora-cleanup-v1\nPOST\n/api/internal/storage-cleanup\n<unix-seconds>\n<uuid-v4>\n<sha256-exact-body-hex>
Body is exactly {} (UTF-8 bytes 7b7d). SQL hashes convert_to(body::text,'UTF8')
from the same JSONB value passed to pg_net. pg_net 0.20.4 enqueues those bytes:
https://github.com/supabase/pg_net/blob/v0.20.4/sql/pg_net.sql
The endpoint hashes the raw received Buffer before any JSON parsing; extra whitespace
or different bytes are rejected. HMAC-SHA256 uses the literal UTF-8 key, not hex-decoded.
Headers: x-cleanup-timestamp, x-cleanup-id, x-cleanup-signature (64 lowercase hex).
Signature window: age <=120s, future skew <=30s; query strings rejected. Queue delay
beyond window is safely rejected. The 240-second HTTP timeout does not extend signature
validity. Next cron tick creates a fresh request.

## Manual order

1. Vault/pgcrypto metadata audit must pass; 004 reads no credential values.
   Current MCP OAuth refresh failed: live Vault privileges are NOT confirmed.
2. Review maintenance/021_signed_cleanup_requests.sql; execute manually as postgres.
   It creates protected private nonce table, service-only consume RPC, owner-only
   private signer. It aborts if either vault.secrets or vault.decrypted_secrets is absent, on
   PUBLIC/anon/authenticated-readable Vault, or missing extensions hmac/digest.
   No job/HTTP request/key insertion occurs. Initial install/SQL020 stays unchanged.
3. Regenerate public types and replace consumeCleanupRequest narrow planned RPC boundary
   with generated Args; until then missing/malformed RPC fails closed. Deploy app disabled.
4. In Vault dashboard store SAME value as Vercel STORAGE_CLEANUP_SECRET, named
   memora_storage_cleanup_secret. Never write it into SQL, code, logs or this document.
5. Review/run scheduler/002_create_inactive_job.sql; creates inactive five-minute job.
   A job already present causes an error: inspect/pause manually, never silently replace.
6. 004 verify signer EXECUTE postgres-only, consume service-only, job active=false.
7. Signed controlled test and actual DB concurrency test before separately approved activation.
   No activation SQL included and no settings were changed here.

## Security and replay

Key is decrypted only inside fixed, no-argument private signer. It is never returned,
logged or placed in pg_net queue. Queue contains a short-lived signature, not a reusable
key. Signed method/path/body prevents modification. UNIQUE nonce INSERT commits before
worker; ON CONFLICT returns false for repeated ID. DB also checks timestamp, consumed
rows kept 10 minutes then lazily pruned on verified requests. No project/product FK.
Failure after consume burns ID; no retry with same ID, next tick uses a new request.

Queue readers can replay an intact signature BEFORE the legitimate delivery, winning
that same authorized operation once. Replay prevention cannot prevent first-use racing.
They can also mutate pg_net queue/drop deliveries due to platform permissions. This is
availability risk, not disclosure of signing key or permission to alter signed content.
Treat DB LOGIN roles as trusted; net/vault/private excluded from Data API. Owners/admins
with Vault access inherently can read key. No platform-owned grants were changed.
Official constraint: https://supabase.com/docs/guides/troubleshooting/database-roles-can-read-request-headers-queued-by-pg_net-ad6357

## Status

15 mock tests and targeted TypeScript pass. 9 organization tests pass. SQL021, HMAC
cross-language vector (tests/postgres/signed_request_vector.sql), real DB concurrent
nonce/cascade/lease tests NOT executed. The Node vector covers a non-ASCII UTF-8 key,
exact raw body bytes, canonical string and inclusive 120s/30s boundaries.
No SQL mutation, queue creation, secret read/write, cleanup, scheduler or Bunny DELETE.
Previous production 401 is not used as proof this new signed protocol is deployed.

## Vault role distinction

Operator reports only service_role has Vault USAGE/SELECT; this is administrative
access, permitted by SQL021 guard and not automatically revoked. service_role
still cannot EXECUTE the private signer. PUBLIC table/column SELECT and effective
anon/authenticated SELECT remain blocked. Current live wrapper/Data API inspection
is unconfirmed because MCP OAuth refresh fails. Run 004 metadata checks and inspect
Dashboard Data API exposed schemas before rollout; no result/NULL is not proof.
Function candidates require body/dependency review, including indirect/dynamic wrappers.
