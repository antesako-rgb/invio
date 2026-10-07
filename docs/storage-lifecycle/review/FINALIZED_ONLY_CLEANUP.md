> Current status (2026-10-07): SQL020 applied; function body and grants verified read-only. Application deploy and scheduler setup still pending. Cleanup remains disabled. Earlier pending-SQL instructions below are historical.

# Finalized-only cleanup — prepared, not applied (2026-10-07)

The previous automatic 24h+1h expiry was a retention assumption, not proof that
Bunny stopped a timed-out PUT. Official upload reference was requested but its
redirect could not be read by the browsing tool. Official SDK documentation was
read at https://github.com/BunnyWay/BunnyCDN.PHP.Storage; it supplies upload/delete
operations but no verified cancellation or remote-completion bound. No such
guarantee is asserted here. No Bunny request was made in this task.

## Implementation

Application cleanup requires finalized=true on EVERY claimed object; missing or
false proof rejects the entire batch before DELETE. Old claim results now fail
closed. SQL 020 replaces the existing claim with a finalized-only policy:
ready sweep only where result IS NOT NULL; lease only where deleting AND result
IS NOT NULL. result is the durable receipt committed by storage_finalize_upload
AFTER the application received a successful PUT response. The application sends
one PUT and does not retry it or reuse keys. DB result itself is not returned.

Expired/ambiguous pending uploads stay retained. Previously queued ambiguous
objects also remain ineligible even when deleting/jobs exist. No auto adoption,
reconstruction or deletion. A timeout or failed finalize does not authorize DELETE.
This prevents deleting an object before a possible delayed PUT. It deliberately
does not promise automatic reclamation of abandoned bytes. Manual reconciliation
requires proven upload quiescence/provider evidence; no 404 or elapsed time is
accepted as proof. ready-only automatic cleanup can be operated without that
provider guarantee once SQL and remaining DB tests are verified.

## Manual order

1. Keep local/hosted cleanup false and scheduler paused.
2. Review maintenance/020_finalized_only_cleanup.sql. Execute manually as postgres,
   entire begin/commit, once. No table migration or data rewrite.
3. Verify pg_get_functiondef and grants; new claims include finalized=true and the
   selection requires result IS NOT NULL. Do not invoke a claim for read-only verify.
4. Deploy changed application; generated signature remains unchanged (JSON parsed at runtime).
5. Run isolated PostgreSQL concurrency/cascade/lease tests before claiming full completion.
6. Follow Vercel Hobby settings one step at a time; no scheduler is currently enabled.

rollback_freeze is emergency operational shutdown, NOT an install requirement.
It revokes five service_role RPC grants and would disable uploads if run. Current
read-only grants prove the freeze is NOT active. rollback_prepare_only is obsolete
for an installed active system and must NOT be run. Install 001-018 and DROP019
were applied; never replay. SQL020 is the only new pending SQL in this task.

Tests: 13 mock tests PASS including missing/false proof => no DELETE; targeted TS
and ESLint PASS. SQL020 compilation/concurrency not executed: no isolated PostgreSQL.
Initial SQL snapshots/definitions remain historical until reviewed SQL020 application;
update current definition afterwards rather than pretending DB already changed.
