import type {
  DigitalAlbumPhotoSlot,
} from "../types/digitalAlbumDocument.types";


/* ==========================================================================
   Digital Album Photo Style
========================================================================== */

export function digitalAlbumPhotoStyle(
  slot:
    DigitalAlbumPhotoSlot
) {
  return {
    objectFit:
      slot.fit ??
      "cover",

    objectPosition:
      `${(slot.position?.x ?? 0.5) * 100}% ${(slot.position?.y ?? 0.5) * 100}%`,
  };
}