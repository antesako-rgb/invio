import "server-only";

export function getDigitalAlbumPrintUrl(requestUrl: string, albumId: string) {
  const incoming = new URL(requestUrl);
  const localRequest = ["localhost", "127.0.0.1", "[::1]"].includes(incoming.hostname);
  // Never forward session cookies to a host supplied in an incoming header.
  const origin = process.env.VERCEL === "1"
    ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    : localRequest
      ? incoming.origin
      : process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_URL
      : new URL(requestUrl).origin;

  if (!origin) throw new Error("PDF print origin is not configured.");
  const url = new URL(origin);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || (url.protocol !== "https:" && !(loopback && url.protocol === "http:"))) {
    throw new Error("PDF print origin must use HTTPS (or local HTTP).");
  }
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1" && !loopback) {
    throw new Error("Local PDF requests must use a loopback origin.");
  }
  return new URL(`/editor/album/${encodeURIComponent(albumId)}/print`, url.origin);
}
