import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";

export const CLEANUP_PATH = "/api/internal/storage-cleanup";
export const MAX_REQUEST_AGE_SECONDS = 120;

export function verifyCleanupRequest(request: Request, body: string | Uint8Array, secret: string, now = Date.now()) {
  const bodyBytes = typeof body === "string" ? Buffer.from(body, "utf8") : Buffer.from(body);
  const url = new URL(request.url);
  const timestamp = request.headers.get("x-cleanup-timestamp") ?? "";
  const requestId = request.headers.get("x-cleanup-id") ?? "";
  const signature = request.headers.get("x-cleanup-signature") ?? "";
  if (request.method !== "POST" || url.pathname !== CLEANUP_PATH || url.search || bodyBytes.length !== 2 || bodyBytes[0] !== 0x7b || bodyBytes[1] !== 0x7d
    || !/^[0-9]{10}$/.test(timestamp)
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(requestId)
    || !/^[0-9a-f]{64}$/.test(signature)) return null;
  const issuedAt = Number(timestamp);
  const seconds = Math.floor(now / 1000);
  if (issuedAt > seconds + 30 || seconds - issuedAt > MAX_REQUEST_AGE_SECONDS) return null;
  const digest = createHash("sha256").update(bodyBytes).digest("hex");
  const canonical = ["memora-cleanup-v1", request.method, url.pathname, timestamp, requestId, digest].join("\n");
  const expected = createHmac("sha256", secret).update(canonical, "utf8").digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) return null;
  return { requestId, issuedAt };
}
