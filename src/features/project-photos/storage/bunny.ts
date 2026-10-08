import "server-only";
import { storageKeySchema } from "./storageKey.schema";

function endpoint(key: string) {
  const path = storageKeySchema.parse(key);
  const zone = process.env.BUNNY_STORAGE_ZONE;
  const region = process.env.BUNNY_STORAGE_REGION;
  const password = process.env.BUNNY_STORAGE_PASSWORD;
  if (!zone || !region || !password) throw new Error("Bunny storage is not configured");
  const host = region === "de" ? "storage.bunnycdn.com" : `${region}.storage.bunnycdn.com`;
  return { url: `https://${host}/${zone}/${path}`, password };
}

export async function uploadToBunny(file: ArrayBuffer, key: string, contentType: string) {
  const { url, password } = endpoint(key);
  const response = await fetch(url, {
    method: "PUT",
    headers: { AccessKey: password, "Content-Type": contentType },
    body: file,
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error("Bunny upload failed");
  return key;
}

export async function deleteFromBunny(key: string) {
  const { url, password } = endpoint(key);
  const response = await fetch(url, {
    method: "DELETE",
    headers: { AccessKey: password },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok && response.status !== 404) throw new Error("Bunny cleanup failed");
}
