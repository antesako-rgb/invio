import type { PhotoWallGalleryPhoto } from "@/features/photo-walls/types/photoWallPhoto.types";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/avif": "avif", "image/gif": "gif",
};
const MAX_FILE_BYTES = 32 * 1024 * 1024;

// Existing CDN resources only. No proxy, arbitrary host or storage credentials.
export function getShareablePhotoUrl(imageUrl: string): string {
  const configured = process.env.NEXT_PUBLIC_CDN_URL;
  if (!configured) throw new Error("CDN unavailable");
  const base = new URL(configured);
  const url = new URL(imageUrl);
  const prefix = base.pathname.replace(/\/+$/, "") + "/";
  if (url.protocol !== "https:" || url.origin !== base.origin ||
      !url.pathname.startsWith(prefix) || url.username || url.password || url.search || url.hash) {
    throw new Error("Invalid photo resource");
  }
  return url.href;
}

export async function fetchPhotoFile(photo: PhotoWallGalleryPhoto, signal: AbortSignal): Promise<File> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = window.setTimeout(abort, 30000);
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) abort();
  try {
    const response = await fetch(getShareablePhotoUrl(photo.imageUrl), {
      mode: "cors", credentials: "omit", redirect: "error", signal: controller.signal,
    });
    if (!response.ok || Number(response.headers.get("content-length")) > MAX_FILE_BYTES) {
      throw new Error("Photo unavailable");
    }
    const blob = await response.blob();
    const extension = IMAGE_EXTENSIONS[blob.type.toLowerCase()];
    if (!extension || !blob.size || blob.size > MAX_FILE_BYTES) throw new Error("Invalid image");
    const id = photo.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "image";
    return new File([blob], `memiva-photo-${id}.${extension}`, { type: blob.type });
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

export function downloadPhotoFile(file: File): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  try { anchor.click(); }
  finally {
    anchor.remove();
    // Allow browsers (including Safari) to consume the download before revoking.
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
