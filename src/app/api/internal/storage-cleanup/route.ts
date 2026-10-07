import { timingSafeEqual } from "crypto";
import { runStorageCleanup } from "@/features/project-photos/storage/runStorageCleanup";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const secret = process.env.STORAGE_CLEANUP_SECRET;
  if (process.env.STORAGE_CLEANUP_ENABLED !== "true" || !secret || secret.length < 32) {
    return new Response(null, { status: 503 });
  }
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return new Response(null, { status: 401 });
  }
  try {
    return Response.json(await runStorageCleanup(3), { headers: { "Cache-Control": "no-store" } });
  } catch {
    // No keys, Bunny responses, request headers or credentials in diagnostics.
    return Response.json({ error: "Storage cleanup failed" }, { status: 500 });
  }
}
