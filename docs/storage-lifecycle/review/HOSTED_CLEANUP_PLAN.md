# Hosted cleanup — proposal only, NOT enabled

Keep STORAGE_CLEANUP_ENABLED unset/false until isolated concurrency/cascade/lease tests
and remote PUT bounds are verified. Controlled deletion of one finalized ready object
does not establish safe pending-reservation expiry. Current claim also sweeps pending
reservations; do not deploy a ready-only assumption without a reviewed implementation.

## Smallest approach for existing POST endpoint

Use the hosting provider's scheduler if it supports POST + Authorization headers.
On a VPS, a cron/systemd timer can perform POST every five minutes using a dedicated
secret held outside shell history/logs. For serverless hosting, an external POST
scheduler such as QStash can call the unchanged endpoint. Hosting/provider/plan is
not yet confirmed; do not install or configure a scheduler as part of this proposal.

Destination: https://YOUR_DOMAIN/api/internal/storage-cleanup
Method: POST
Authorization: Bearer <dedicated STORAGE_CLEANUP_SECRET, >=32 chars>
Secrets only in hosting and scheduler secret stores, never URL/query parameters.
Keep scheduler OFF until the enabling gate is satisfied. Start with one invocation,
verify expected object/job states and then consider a five-minute interval.

Current batch: up to three objects, sequential DELETE timeout 60s each; endpoint
maxDuration=300. Hosting and caller HTTP duration must actually support the measured
DB/Bunny time plus margin. Otherwise reduce batch, not merely declare maxDuration.
Lease is one hour; retry failures after 15 minutes, crashed workers after lease expiry.
Avoid overlapping invocations; DB claims serialize leases but gate contention returns
40001 and a worker may still be in flight. Scheduler delivery retries are not a
replacement for DB job leases. Prefer next scheduled tick initially over immediate retries.
Monitor failed count even on HTTP 200 (endpoint returns completed/failed); also monitor
500/503, pending age, lease expiry, attempts, quarantined rows and backlog. Do not log
Authorization, secrets or raw Bunny responses. Include an operator disable procedure:
stop scheduler FIRST, disable flag, then inspect in-flight work before DB freeze.

## If hosting is Vercel

Native Vercel Cron sends GET, whereas the current endpoint supports POST only.
Do not point native cron at it unchanged. Either keep external POST scheduling or
review a dedicated GET cron handler sharing the worker and validating CRON_SECRET.
This is a future code change; no GET mutation handler was added here. Native cron's
function duration limits and schedule availability depend on hosting plan.

References:
- https://vercel.com/docs/cron-jobs
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://upstash.com/docs/qstash/api-reference/schedules/create-a-schedule

## Actual test status

2026-10-07: isolated runner attempted, exit 2: initdb unavailable. No DB connection.
Concurrent document save/delete, project cascade, lease expiry/reclaim and failed
cleanup re-delivery are prepared SQL tests but NOT executed. Added assertions for
15-minute failure delay, rotated lease and done status, plus rollback after legacy DROP.
Available structural tests: 9/9 PASS. Mock storage tests: 12/12 PASS. No new Bunny
PUT/DELETE, hosted changes or database mutations were performed in this work.
