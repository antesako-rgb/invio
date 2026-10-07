# Controlled local cleanup test — 2026-10-07

Authorized target: c294d7d8-2d47-407a-a1fd-a99a7e9b397a only.
Read-only preflight confirmed exactly one eligible job, no other sweep candidates
or pending reservations expiring within the ten-minute safety window. Two other
ready objects retained album associations; shared Photo Wall image also retained
an album document reference.

Baseline Bunny GET Range: target and shared image 206. HEAD was rejected with 401;
no POST/configuration change occurred on that initial probe. GET body discarded.
A cryptographically random temporary secret was generated without printing it.
One local POST /api/internal/storage-cleanup returned HTTP 200:
completed: 1, failed: 0. No automatic retries and no scheduler configured.
Original .env.local was restored in finally; cleanup disabled, secret removed.
Bunny verification: target 404, shared image 206. Hosted configuration unchanged.

This confirms one ready-object unlink/cleanup integration test. It does not prove
pending-upload expiry safety, concurrent capacity, lease races or CDN cache purge.
Bunny origin absence is verified; cached CDN copies can have an independent lifetime.
