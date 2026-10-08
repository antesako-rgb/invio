import { runStorageCleanup } from "@/features/project-photos/storage/runStorageCleanup";
import { verifyCleanupRequest } from "@/features/project-photos/storage/cleanupRequestAuth";
import { consumeCleanupRequest } from "@/features/project-photos/storage/consumeCleanupRequest";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const secret = process.env.STORAGE_CLEANUP_SECRET;
  const headers = { "Cache-Control": "no-store" };
  if (process.env.STORAGE_CLEANUP_ENABLED !== "true" || !secret || secret.length < 32) {
    return new Response(null, { status: 503, headers });
  }
  // Only the fixed two-byte body is allowed; bound streaming reads as well.
  let body: Buffer = Buffer.alloc(0);
  const reader = request.body?.getReader();
  if (reader) {
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > 2) { await reader.cancel(); return new Response(null, { status: 401, headers }); }
        chunks.push(chunk.value);
      }
      body = Buffer.concat(chunks);
    } catch { return new Response(null, { status: 401, headers }); }
    finally { reader.releaseLock(); }
  }
  const verified = verifyCleanupRequest(request, body, secret);
  if (!verified) return new Response(null, { status: 401, headers });
  try {
    // UNIQUE DB insert is committed before worker starts: concurrent replay loses.
    if (!await consumeCleanupRequest(verified.requestId, verified.issuedAt)) {
      return new Response(null, { status: 409, headers });
    }
    return Response.json(await runStorageCleanup(3), { headers });
  } catch {
    return Response.json({ error: "Storage cleanup failed" }, { status: 500, headers });
  }
}
