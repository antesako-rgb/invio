import type { DigitalAlbumDocument, DigitalAlbumDocumentPage } from "../types/digitalAlbumDocument.types";

export function getDigitalAlbumPhotoReferences(pages: DigitalAlbumDocumentPage[], photoId: string) {
  return pages.flatMap((page, index) => [
    ...page.photos.filter((slot) => slot.photoId === photoId).map((slot) => ({
      pageId: page.id, pageNumber: index + 1, slotId: slot.id, retained: false,
    })),
    ...(page.unplacedPhotos ?? []).filter((slot) => slot.photoId === photoId).map((slot) => ({
      pageId: page.id, pageNumber: index + 1, slotId: slot.id, retained: true,
    })),
  ]);
}

export type DigitalAlbumPhotoReference = ReturnType<typeof getDigitalAlbumPhotoReferences>[number];

// Remove placements only. Membership and the underlying Event photo are untouched.
export function removeDigitalAlbumPhotoReferences(document: DigitalAlbumDocument, photoId: string): DigitalAlbumDocument {
  return {
    ...document,
    pages: document.pages.map((page) => {
      const placed = page.photos.some((slot) => slot.photoId === photoId);
      const retained = page.unplacedPhotos?.some((slot) => slot.photoId === photoId);
      if (!placed && !retained) return page;
      return {
        ...page,
        photos: placed ? page.photos.map((slot) => slot.photoId === photoId ? { id: slot.id, photoId: null } : slot) : page.photos,
        ...(retained ? { unplacedPhotos: page.unplacedPhotos?.filter((slot) => slot.photoId !== photoId) } : {}),
      };
    }),
  };
}
