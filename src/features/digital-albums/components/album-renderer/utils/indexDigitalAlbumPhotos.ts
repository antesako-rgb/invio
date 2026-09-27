import type { DigitalAlbumRendererPhoto } from "../types/digitalAlbumRenderer.types";

export function indexDigitalAlbumPhotos(photos: readonly DigitalAlbumRendererPhoto[]) {
  const index = new Map<string, DigitalAlbumRendererPhoto>();
  for (const photo of photos) {
    // Match the previous Array.find semantics if a caller supplies duplicates.
    if (!index.has(photo.id)) index.set(photo.id, photo);
  }
  return index;
}
