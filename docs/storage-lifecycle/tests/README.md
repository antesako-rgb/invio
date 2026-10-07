# Operator staging checks (not executed by this agent)

Local PostgreSQL runner: `python -B docs/storage-lifecycle/tools/run_postgres_tests.py --run-isolated`.
Optional `--pg-bin` points to an installed local PostgreSQL bin directory.
Attempted here: **NOT RUN, initdb unavailable**, no DB connection made.
The runner creates a new local cluster; it accepts no existing database/remote URL.
Prepared assertions use the actual proposed migrations on a synthetic minimal schema.
They cover global ambiguity without quarantine, independent retained references,
cascade/rollback, gate contention and parent-first/gate-first races.
This is not a full Supabase clone; real-schema staging remains necessary.

Use a disposable database clone and a fake Bunny adapter/object map. Do NOT run
these cases against production users or real Bunny objects. Run 000/003 verify
scripts separately; they are read-only and do not exercise mutations.

| Case | Expected result |
| --- | --- |
| Anonymous/authenticated call to each new storage RPC | EXECUTE denied. |
| Authenticated call to old arbitrary-path create RPCs | EXECUTE denied after 002. |
| Server reservation for non-member, foreign product, absent project | Rejected before mocked PUT. |
| Public wall disabled/unpublished at reserve | Rejected before mocked PUT. |
| Wall becomes unpublished/member removed between reserve and finalize | Finalization denied, reservation retained for expiry; no immediate DELETE. |
| Direct service insert into project_photos without matching ready reservation | Guard denies registration. |
| Same reservation ID/target/actor repeated | Same key; no second ledger row. |
| Different actor/target replay of reservation ID | Rejected. |
| Same finalize after simulated response timeout following commit | Same result, one photo row and one association. |
| Failed optimization/PUT/no finalization | Pending survives; no cleanup before expiry + grace. |
| Finalization races expiry cleanup | One serialized outcome: ready referenced object OR deleting reservation; no resurrection. |
| One photo linked to invitation, album and wall | Removing one association does not authorize DELETE. |
| Concurrent add link versus last unlink/queue | Link succeeds first and prevents cleanup OR state becomes deleting first and link fails. |
| Concurrent document save referencing photo versus unlink | Parent locking prevents accepted dangling reference; deadlock victims abort/retry. |
| Retained/unplaced photo slot | Counts as a reference. |
| Cascade delete invitation/album | Only genuinely unreferenced managed objects become jobs; shared objects remain. |
| Cascade delete whole project | Private ledger/job survives; legacy metadata is archived; no bulk directory DELETE. |
| Pre-cutover two photo IDs with same normalized key | Retained, never bulk adopted. If a managed key has an alias, quarantine it. |
| Legacy encoded/dot-segment path | Physical cleanup blocked, including after archival; referenced ready objects and valid links stay usable. |
| Dangling document reference with missing public photo row | Ledger ID still detects visible and retained references, in invitation and album. |
| Gate contention while holding parent row | Retryable 40001 instead of waiting for the advisory gate; transaction rollback preserves data. |
| Legacy row without reservation | Unlink allowed within original project; physical cleanup never authorized. |
| New managed identity/path/project modified | Guard rejects the change. |
| Worker failure | Job retries after delay; key never exposed to browser. |
| Worker crashes after mocked DELETE before ACK | Lease expiry allows repeat; mocked 404 is success. |
| Stale worker ACK after another claim | Lease mismatch rejected. |
| Worker restarted after project deletion | Can claim persisted job without resolving deleted project. |
| Multiple workers | Lease ownership prevents normal duplicate execution; expiry retries are idempotent. |
| Invalid legacy document elsewhere | Reference parser failure prevents cleanup rather than guessing. |
| Scheduler absent/disabled/wrong secret | No claim or DELETE; endpoint rejects request. |

Measure reserve/finalize/unlink/sweep latency and lock waits with realistic
document/photo counts. The initial global transaction gate favors simple safety
over maximum throughput. Record staging outcomes before approving production.

Remote PUT assumptions and cleanup activation blockers are documented separately
in `review/REMOTE_PUT.md`; SQL tests do not verify those provider guarantees.

## New scenarios (prepared, NOT RUN)

`postgres/completion_and_documents.sql`: every non-ready state in invitation/album
visible/retained references, parent/photo ID changes for all three association
kinds, expired token, replaced token, quarantine-preserving ACK, valid failure
retry and valid success. The isolated runner adds multi-session tests for both
document save guards, concurrent parent reassignment, lease expiry while waiting
on the job row, and quarantine committed while ACK waits on the object row.

Do not execute these files on Supabase. The fake schema intentionally omits some
real RPC bodies; run actual-schema staging separately before production approval.
