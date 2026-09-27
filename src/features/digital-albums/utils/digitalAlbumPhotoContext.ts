import type { DigitalAlbumDocument, DigitalAlbumDocumentPage } from "../types/digitalAlbumDocument.types";

export function getAlbumVisibleIndexes(indexes: number[], active: number, count: number) {
  const valid = [...new Set(indexes)].filter((index) => index >= 0 && index < count).sort((a, b) => a - b);
  return valid.includes(active) ? valid : active >= 0 && active < count ? [active] : [];
}

export function getAlbumPhotoUsage(pages: DigitalAlbumDocumentPage[]) {
  const counts: Record<string, number> = {};
  for (const page of pages) {
    for (const slot of page.photos) {
      if (slot.photoId) counts[slot.photoId] = (counts[slot.photoId] ?? 0) + 1;
    }
  }
  return counts;
}

// Slot IDs describe positions. Framing and captions travel with the photo.
export function swapAlbumPhotoSlots(document: DigitalAlbumDocument, sourceId: string, targetId: string) {
  if (sourceId === targetId) return document;
  const slots = document.pages.flatMap((page) => page.photos);
  const source = slots.find((slot) => slot.id === sourceId);
  const target = slots.find((slot) => slot.id === targetId);
  if (!source || !target) return document;
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...page,
      photos: page.photos.map((slot) => slot.id === sourceId
        ? { ...target, id: sourceId }
        : slot.id === targetId ? { ...source, id: targetId } : slot),
    })),
  };
}
