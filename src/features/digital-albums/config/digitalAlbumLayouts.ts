import type {
  DigitalAlbumPageLayout,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumLayoutDefinition {
  id:
    DigitalAlbumPageLayout;

  photoSlotCount:
    number;
}


/* ==========================================================================
   Layouts
========================================================================== */

export const DIGITAL_ALBUM_LAYOUTS = {
  "cover": {
    id:
      "cover",

    photoSlotCount:
      1,
  },

  "full-photo": {
    id:
      "full-photo",

    photoSlotCount:
      1,
  },

  "two-photos": {
    id:
      "two-photos",

    photoSlotCount:
      2,
  },

  "editorial": {
    id:
      "editorial",

    photoSlotCount:
      1,
  },

  "story": {
    id:
      "story",

    photoSlotCount:
      0,
  },

  "collage": {
    id:
      "collage",

    photoSlotCount:
      3,
  },
} satisfies Record<
  DigitalAlbumPageLayout,
  DigitalAlbumLayoutDefinition
>;


/* ==========================================================================
   Get Layout
========================================================================== */

export function getDigitalAlbumLayout(
  layout:
    DigitalAlbumPageLayout
): DigitalAlbumLayoutDefinition {
  return DIGITAL_ALBUM_LAYOUTS[
    layout
  ];
}