import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  DigitalAlbumDocument,
  DigitalAlbumDocumentPage,
  DigitalAlbumPhotoSlot,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Helpers
========================================================================== */

function isRecord(
  value:
    unknown
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object"
    && value !==
      null
    && !Array.isArray(
      value
    )
  );
}


/* ==========================================================================
   Parse Photo Slot
========================================================================== */

function parsePhotoSlot(
  value:
    unknown
): DigitalAlbumPhotoSlot {
  if (
    !isRecord(
      value
    )
  ) {
    throw new Error(
      "Neispravan photo slot u dokumentu digitalnog albuma."
    );
  }

  if (
    typeof value.id !==
      "string"
    || value.id.length ===
      0
  ) {
    throw new Error(
      "Photo slot nema ispravan ID."
    );
  }

  if (
    value.photoId !==
      null
    && typeof value.photoId !==
      "string"
  ) {
    throw new Error(
      "Photo slot nema ispravan photoId."
    );
  }

  return {
    id:
      value.id,

    photoId:
      value.photoId,
  };
}


/* ==========================================================================
   Parse Page
========================================================================== */

function parsePage(
  value:
    unknown
): DigitalAlbumDocumentPage {
  if (
    !isRecord(
      value
    )
  ) {
    throw new Error(
      "Neispravna stranica u dokumentu digitalnog albuma."
    );
  }

  if (
    typeof value.id !==
      "string"
    || value.id.length ===
      0
  ) {
    throw new Error(
      "Stranica nema ispravan ID."
    );
  }

  if (
    value.layout !==
      "full-photo"
  ) {
    throw new Error(
      "Layout stranice digitalnog albuma nije podržan."
    );
  }

  if (
    !Array.isArray(
      value.photos
    )
  ) {
    throw new Error(
      "Fotografije stranice nisu ispravne."
    );
  }

  if (
    !isRecord(
      value.content
    )
  ) {
    throw new Error(
      "Sadržaj stranice nije ispravan."
    );
  }

  const {
    title,
    subtitle,
    text,
  } =
    value.content;

  if (
    title !== undefined
    && typeof title !==
      "string"
  ) {
    throw new Error(
      "Naslov stranice nije ispravan."
    );
  }

  if (
    subtitle !== undefined
    && typeof subtitle !==
      "string"
  ) {
    throw new Error(
      "Podnaslov stranice nije ispravan."
    );
  }

  if (
    text !== undefined
    && typeof text !==
      "string"
  ) {
    throw new Error(
      "Tekst stranice nije ispravan."
    );
  }

  return {
    id:
      value.id,

    layout:
      value.layout,

    photos:
      value.photos.map(
        parsePhotoSlot
      ),

    content: {
      ...(title !== undefined
        ? {
            title,
          }
        : {}),

      ...(subtitle !== undefined
        ? {
            subtitle,
          }
        : {}),

      ...(text !== undefined
        ? {
            text,
          }
        : {}),
    },
  };
}


/* ==========================================================================
   Parse Digital Album Document
========================================================================== */

export function parseDigitalAlbumDocument(
  value:
    Json
): DigitalAlbumDocument {
  if (
    !isRecord(
      value
    )
  ) {
    throw new Error(
      "Dokument digitalnog albuma nije ispravan."
    );
  }

  if (
    value.theme !==
      "classic"
  ) {
    throw new Error(
      "Tema digitalnog albuma nije podržana."
    );
  }

  if (
    !Array.isArray(
      value.pages
    )
  ) {
    throw new Error(
      "Stranice digitalnog albuma nisu ispravne."
    );
  }

  return {
    theme:
      value.theme,

    pages:
      value.pages.map(
        parsePage
      ),
  };
}