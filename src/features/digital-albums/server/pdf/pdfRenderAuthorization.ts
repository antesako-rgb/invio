import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const PDF_RENDER_HEADER = "x-invio-pdf-render";
const PURPOSE = "digital-album-pdf-render";
const TTL_SECONDS = 120;
const claimsSchema = z.object({
  albumId: z.string().uuid(),
  userId: z.string().uuid(),
  origin: z.string().url(),
  purpose: z.literal(PURPOSE),
  iat: z.number().int(),
  exp: z.number().int(),
}).strict();

export function assertPdfRenderConfiguration() {
  if (!/^[a-fA-F0-9]{64}$/.test(process.env.PDF_RENDER_SECRET ?? "")) {
    throw new Error("PDF render signing key is not configured.");
  }
}

function signingKey() {
  assertPdfRenderConfiguration();
  return Buffer.from(process.env.PDF_RENDER_SECRET!, "hex");
}

export function createPdfRenderToken(input: { albumId: string; userId: string; origin: string }) {
  const now = Math.floor(Date.now() / 1000);
  const claims = claimsSchema.parse({ ...input, purpose: PURPOSE, iat: now, exp: now + TTL_SECONDS });
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", signingKey()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyPdfRenderToken(token: string | null, expected: { albumId: string; origin: string }) {
  try {
    if (!token || token.length > 2048) return null;
    const parts = token.split(".");
    if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return null;
    const [payload, encodedSignature] = parts;
    const signature = Buffer.from(encodedSignature, "base64url");
    const actual = createHmac("sha256", signingKey()).update(payload).digest();
    if (signature.length !== actual.length || signature.toString("base64url") !== encodedSignature ||
        !timingSafeEqual(signature, actual)) return null;

    const claims = claimsSchema.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    const now = Math.floor(Date.now() / 1000);
    if (claims.albumId !== expected.albumId || claims.origin !== expected.origin ||
        claims.iat > now || claims.exp <= now || claims.exp <= claims.iat ||
        claims.exp - claims.iat > TTL_SECONDS) return null;
    return claims;
  } catch {
    // Never expose token contents or parsing/configuration errors.
    return null;
  }
}
