> Current status (2026-10-07): SQL020 applied; function body and grants verified read-only. Application deploy and scheduler setup still pending. Cleanup remains disabled. Earlier pending-SQL instructions below are historical.

> Hosting confirmed: Vercel Hobby. Current concrete instructions: [VERCEL_HOBBY_SETUP.md](VERCEL_HOBBY_SETUP.md). Earlier unknown-host notes below are historical.

# Current next steps — 2026-10-07

Done: install 001-018 applied; legacy create-photo RPCs removed (live read-only
confirmation); generated types have storage RPCs and no legacy RPCs. Types normalized
to UTF-8 after user's regeneration. No obsolete production callers found.
Definitions omit legacy grants; operational freeze revokes only new lifecycle RPCs.
Applied DROP archived in history, not a pending task. Never replay initial install.

Controlled test already succeeded: one finalized object deleted, job done, shared
album image retained. Cleanup remains disabled. No cleanup/hosting settings changed.

Remaining: isolated PostgreSQL concurrency/cascade/lease tests (initdb unavailable),
remote PUT expiry bound or a reviewed ready-only worker contract, and hosting decision.
No production hosting configuration found: no .vercel/project.json, vercel.json,
Netlify/Railway/Render/Docker deployment config. PDF x-vercel-protection-bypass handling
is a capability, not proof of deployment. Need hosting provider, plan and production domain.

Current endpoint requires POST, Authorization Bearer STORAGE_CLEANUP_SECRET (>=32),
STORAGE_CLEANUP_ENABLED=true, server SUPABASE_SECRET_KEY and BUNNY_STORAGE_ZONE,
BUNNY_STORAGE_REGION, BUNNY_STORAGE_PASSWORD. Do not enable before remaining gates.
Do not expose these values in client env or scheduler URL. Scheduler needs only
endpoint URL and cleanup bearer secret, not Supabase/Bunny keys.

Vercel native cron uses GET, so unchanged POST requires an external POST scheduler
or a reviewed cron GET handler. Final schedule/configuration depends on actual host
and request-duration limits; maxDuration=300 alone does not guarantee plan support.
See HOSTED_CLEANUP_PLAN.md for proposal. No scheduler was installed/enabled.
