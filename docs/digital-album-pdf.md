# Digital Album PDF: local and Vercel

## Existing flow and retained behavior

The export button POSTs `/api/digital-albums/[albumId]/pdf`, reads a PDF blob and
downloads `digital-album.pdf`. The API checks album access using the user-scoped
Supabase client, opens `/internal/digital-albums/[albumId]/render` with that user's session,
and uses Puppeteer's `page.pdf()`. The print route repeats the album/RLS query,
loads photos, parses `DigitalAlbumDocument`, and uses `DigitalAlbumPrintRenderer`
and the existing six page layouts. No page-flip engine is involved.

The original implementation only located Windows Chrome. It already closed the
browser in `finally` and used Node runtime, but had no serverless executable,
duration configuration, hydration/image readiness check or handled error response.
`networkidle0` plus `document.fonts.ready` did not guarantee lazy images were loaded.

The PDF remains 440 × 640 CSS px per page, with CSS page sizes, backgrounds and
zero margins. Layouts, print CSS, download UI/filename, DB and RLS are unchanged.

## Browser/runtime

- Dependencies are pinned: `puppeteer-core@25.11.0` targets Chrome 153.0.8010.36;
  `@sparticuz/chromium-min@153.0.0` supplies the corresponding Chromium major.
- `package.json` selects Node **24.x**, supported by Vercel and both dependencies.
- Local development and local `next start` use installed Windows Chrome. Optional
  `PDF_BROWSER_EXECUTABLE_PATH` supports a different local executable, including
  Linux/macOS. `NODE_ENV=production` alone does not select serverless Chromium.
- `VERCEL=1` selects the Linux serverless shell with `chromium.args` and
  `headless: "shell"` (x64 or arm64).
- **chromium-min contains no Brotli binaries.** The default remote pack is
  `https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.x64.tar`
  (or `pack.arm64.tar` for arm64). No `latest` or temporary signed URL is used.
  The official x64 URL was checked with HEAD: HTTP 200, 70,051,840 bytes.
- The library downloads/extracts to temporary storage and reuses `/tmp/chromium`.
  A module-level promise prevents simultaneous extraction in one function instance.
  Cold instances download once; separate instances have separate caches. Each
  export gets its own browser and cookie context, never a shared authenticated page.
- The request waits at most 75 seconds for initialization. If that wait expires,
  the shared extraction promise is retained (no competing extraction is started);
  the library's download has its own 300-second abort. A later warm invocation can
  reuse the result. Failed initialization clears the promise for retry.
- No Next config change is necessary: installed Next 16.3.5 already externalizes
  both `puppeteer-core` and `@sparticuz/chromium-min` automatically.
  Local executable existence checks use `turbopackIgnore` so external Chrome
  paths do not cause Turbopack to trace the entire repository into the function.

## Authentication and origin

The API explicitly verifies a Supabase user before generating a PDF, then keeps
the existing album query/RLS authorization. Only Supabase `sb-…-auth-token` cookies
(including numbered chunks) are copied to the print origin. No service role is used.
The print route remains protected by its existing user-scoped database queries.

On Vercel the trusted origin comes from the platform's `VERCEL_URL`, never an
incoming Host/forwarded header. On localhost the request's loopback origin is used,
including for `next start`. Other self-hosted production uses `NEXT_PUBLIC_APP_URL`.
The current i18n configuration uses the unprefixed default locale with detection off.

Protected Vercel deployments may need `VERCEL_AUTOMATION_BYPASS_SECRET`. It is
attached **only to requests to the exact print origin**, never CDN/Storage requests
or query strings. This bypasses Vercel's outer deployment protection only; Supabase
session/RLS checks still run. External main-frame redirects and login redirects fail.

## Render readiness and robustness

Print-only hydration marker → print media → eager loading of every rendered image
→ image decoding (including CSS backgrounds and pseudo-elements) → web-font
readiness/error check → two animation frames for layout → `page.pdf()`.
Missing assets fail the export rather than silently printing incomplete pages.
Album images resolve through `NEXT_PUBLIC_CDN_URL` (currently Bunny), with Next Image
optimization; theme backgrounds are in `public/digital-albums`. Fonts are built by
`next/font/google` and served by Next, so the build needs font-download access.

The Node route has `maxDuration = 300`. Launch is limited to 30 seconds; navigation,
hydration, assets and PDF each have 45-second bounds; CDP has a 60-second timeout.
Browser cleanup runs in `finally`, with process termination if closing exceeds 5s.
At most two exports run simultaneously per instance; excess requests receive 503
with Retry-After. This is a local resource guard, not a distributed rate limiter.
Logs contain the failure stage/status, not cookies, signed URLs or browser errors.

The completed PDF is streamed in 64 KiB chunks without Content-Length, using
`application/pdf`, attachment filename, `private, no-store, no-transform` and nosniff.
This avoids Vercel's **buffered** 4.5 MB response limit without adding storage.
Generation still holds the PDF buffer in memory; very large albums remain bounded
by function memory/duration. Actual streaming for a >4.5 MB album must be verified
on Vercel, as must cold-start performance.

## Vercel Dashboard checklist (manual, no deployment performed)

1. Set/confirm **Node.js 24.x**, **Fluid Compute**, a duration allowance of at least
   **300 seconds**, and at least **2048 MB** function memory where the plan allows.
2. Preserve existing values in the appropriate Production/Preview environment:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `NEXT_PUBLIC_CDN_URL`. Public variables must be present at build time.
   CDN must match the existing Next Image `remotePatterns` (`invio.b-cdn.net`).
3. Ensure Vercel's system environment variables are exposed: `VERCEL` and
   `VERCEL_URL` are platform-provided; **do not manually hardcode them**.
4. If Deployment Protection is enabled, enable **Protection Bypass for Automation**
   under Settings → Deployment Protection and expose its generated
   `VERCEL_AUTOMATION_BYPASS_SECRET` to the corresponding deployment environment.
   Do not use a `NEXT_PUBLIC_` prefix or commit the value.
5. Set **PDF_RENDER_SECRET** to 32 cryptographically random bytes encoded as exactly
   64 hexadecimal characters. Set it locally and in Preview/Production; use separate
   values per environment, shared by all functions in that deployment. Generate with
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
   Never commit it or prefix it with `NEXT_PUBLIC_`. Missing/invalid configuration
   fails export before launching Chromium. This is separate from Supabase keys and
   the Vercel automation bypass secret.
   Optional `PDF_CHROMIUM_PACK_URL` may point at a trusted immutable HTTPS mirror of
   the exact 153.0.0 pack for the deployed architecture. Do not use expiring URLs,
   an arbitrary browser version, or a user-controlled source. A mirror is useful
   if GitHub egress/availability becomes an operational constraint.
6. Do not set `PDF_BROWSER_EXECUTABLE_PATH` on Vercel. No new Supabase secret, bucket,
   policy or schema migration is required. Other existing app env vars stay as-is.

## Internal render authorization

The old `/editor/album/[albumId]/print` page is removed without a redirect. The new
render page requires both a short-lived capability and the existing Supabase
session/RLS authorization. A signed-in browser visiting it directly receives 404.

After API authentication/access checks and Chromium startup, the server signs an
HMAC-SHA256 token with `PDF_RENDER_SECRET`, binding album ID, authenticated user ID,
trusted deployment origin, purpose `digital-album-pdf-render`, issued-at time and
a 120-second expiry. The render page verifies the signature and claims, matches
the Supabase user, and repeats the existing user-scoped album query. No service-role
access, database token table or shared process state is involved.

Puppeteer sends the token only in `X-Invio-Pdf-Render` on the initial GET main-frame
navigation to the exact render URL. Interception strips it from all other requests,
including assets, CDN, fetches, iframes and redirects. It is never placed in a URL,
cookie, client prop or log. Existing request allowlists and Vercel bypass scoping
remain in place. Any future request tracing must redact this header.

Tokens are not single-use: within their short lifetime they also require the bound
user's valid session and album access. Rotating the secret invalidates outstanding
tokens. The renderer, document model and layout/theme implementation are unchanged.

The API/security script checks missing, invalid, tampered, expired and mismatched
tokens, session/access rejection, authorized rendering, request-header isolation
and removal of the old page. Session/RLS are isolated doubles, not deployed policies.

## Local verification

Run `node scripts/test-digital-album-pdf.mjs` with local Chrome installed (Node 24+).
It uses the actual generator and isolated HTTP fixtures, with fake cookies only:
trusted-origin selection, hydration, lazy images on three pages, delayed backgrounds,
PDF signature/page count, unauthorized responses, redirects and broken-image failure.
It does not access Supabase or production data. The test-only TS loader stubs the
`server-only` import outside Next; application modules retain their server-only guard.

Before release, manually export a real authorized album locally and on a Vercel
Preview deployment: include every layout, Croatian text, photographs on later pages,
a >4.5 MB PDF, cold/warm runs, and an album the user cannot access. Confirm font and
photo fidelity, page count, HTTP headers, cleanup, function memory and timing.
The fixture test does not prove the deployed Supabase session/RLS or font/CDN setup.

## Final hardening audit

Deployment functionality (local/Preview/Production), rendering, automation bypass
and Supabase authorization were confirmed by the project owner. The following
hardening retains that setup:

- API and print route reject invalid UUIDs before querying the database. API
  explicitly rejects cross-site browser requests via Fetch Metadata (this is
  supplementary browser protection, not authentication or a rate limiter).
- Print now explicitly verifies a signed-in user and is force-dynamic; both routes
  still use the existing user-scoped album/RLS checks. No owner-only restriction was
  added that might break legitimate collaborators. Deployed RLS policy SQL is not
  present in this repository, so this audit cannot independently prove its rules.
- Browser requests are confined to the print origin, configured HTTPS CDN origin,
  and embedded data/blob assets. Cross-origin frame navigations are blocked; cookies,
  Authorization and automation bypass credentials are not forwarded to CDN requests.
- Cleanup cannot replace the original outcome if process termination throws.
  Returning PDF bytes no longer allocates a second full PDF copy.
- The export button has a synchronous in-flight guard and handles 429/503 with
  translated messages and a Retry-After cooldown. Retries remain user-initiated.

### Distributed rate limit: not implemented

No shared limiter, Redis dependency, rate-limit table or RPC exists in the checked-in
code/generated schema. The two-export cap is per warm instance only. Browser
cooldown and Fetch Metadata checks are not distributed abuse protection.

Recommended next change: a small table and atomic Postgres RPC in the **existing
Supabase project**, keyed by verified `auth.uid()`, shared across all album exports
for that user. A starting policy to review is 5 requests/minute and 30/hour, counting
admitted attempts before Chromium starts, with 429 and Retry-After computed from
database time. The RPC must serialize updates atomically, reject anonymous calls,
prevent direct counter edits, fix search_path if using SECURITY DEFINER, and clean
up expired rows. Storage errors should fail closed with 503, never silently disable
the limiter. See [Supabase database functions](https://supabase.com/docs/guides/database/functions).

This needs an approved schema migration and API integration; neither is added or
applied by this hardening audit. No Redis/Upstash is necessary. Until then, a signed-in
user can still spread requests across serverless instances and incur Chromium cost.

Real remaining resource limits: decoded images and the final PDF are held in memory;
very large albums can exceed available memory or the function deadline. No arbitrary
file-size cap was introduced. A client disconnect does not immediately cancel an
in-progress export; existing stage timeouts/cleanup still apply. Cold pack extraction
may continue after the 75-second wait expires, under the library's own download timeout.

Additional isolated checks:
`node scripts/test-digital-album-pdf-api.mjs` covers route validation, auth/access
denial, headers, safe errors and 503 Retry-After using doubles. The real-Chrome smoke
test also covers blocked external requests, the two-export cap and counter recovery.
These do not substitute for a cross-account RLS test against the deployed database.

## Reference links

- [Sparticuz min package and caching](https://github.com/Sparticuz/chromium#-min-package)
- [Pinned Chromium release](https://github.com/Sparticuz/chromium/releases/tag/v153.0.0)
- [Vercel streaming for large responses](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)
- [Vercel automation protection bypass](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
- [Vercel Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
