# Storage findings: corrections and verification status

The proposed migrations and generated reference files have been updated before
application. Nothing was executed on Supabase or Bunny.

| Finding | Correction | Actual verification |
| --- | --- | --- |
| Global legacy ambiguity quarantines live objects | References win first. Global ambiguity blocks deletion/leases without changing ready states or valid links. | Implemented; PostgreSQL fixture prepared, NOT RUN. |
| References depend on public photo row | Reference IDs come from private ledger, public aliases and legacy archive; document checks are independent of public row existence, including retained slots. | Implemented; invitation and album dangling retained-slot assertions prepared, NOT RUN. |
| Gate/parent lock cycle | Nonblocking pg_try_advisory_xact_lock aborts contention with retryable 40001, avoiding waiting for the gate while holding parent rows. Same-transaction reentrancy remains valid. | Implemented; two multi-session tests prepared, NOT RUN. |
| Remote PUT after local timeout | Assumptions and stop conditions documented in review/REMOTE_PUT.md. Cleanup remains disabled by default. | Provider and hosting behavior NOT confirmed. |

Exact aliases on an unreferenced object, or a real reference discovered after an
object entered deleting, can still require individual quarantine. Unrelated
global ambiguity no longer changes the state of ready managed objects.

No initdb/pg_ctl/psql or Docker was found in this environment. The isolated runner
returned NOT RUN before any connection. SQL compilation, cascade/trigger order,
transaction snapshot visibility, rollback and concurrency therefore remain
UNVERIFIED. Local reference/mock tests are not PostgreSQL execution tests.

The runner initializes its own loopback cluster and synthetic schema. Even after
it passes, test against a disposable clone of the actual schema: the fixture
does not reproduce every existing Supabase RPC, RLS policy or production load.

Before production: execute isolated PostgreSQL tests, inspect lock/cascade
results, validate the real schema in staging, and confirm the remote PUT bounds.
Do not enable cleanup while its remote upload assumptions remain unproven.

## Additional corrections before execution

- Invitation/album document INSERT and document/project UPDATE now use
  `storage_document_guard`: the same gate, both document helpers, retained slots,
  managed ID/alias lookup (including archived aliases), ready state and project.
  Existing RPC membership and photo association validation remain authoritative.
- Association UPDATE cannot change photo ID or parent ID for any of the three
  product types. Metadata updates remain allowed; relocation requires unlink/link.
- Cleanup completion locks object before job, checks deleting state, then checks
  current token and actual expiry using clock_timestamp AFTER both locks. Expired,
  replaced or quarantined completion returns 22023 without changes. Duplicate ACK
  after committed success is rejected; the completed job remains unchanged.
- Completion rejection cannot undo an already executed Bunny DELETE. Physical
  deletion/provider coordination assumptions remain separate and unverified.

Prepared PostgreSQL tests now include non-ready document references, all three
association identities, and multi-session document/cleanup, parent reassignment,
lease-expiry-during-lock-wait and quarantine-before-ACK races. These are NOT RUN:
local initdb is unavailable. No SQL concurrency/cascade correctness is claimed.
