import {
  getDigitalAlbumLayout,
} from "../config/digitalAlbumLayouts";

import type {
  DigitalAlbumDocument,
  DigitalAlbumDocumentPage,
  DigitalAlbumPageLayout,
  DigitalAlbumPhotoSlot,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface CreateDefaultDigitalAlbumDocumentOptions {
  eventName:
    string;

  eventDate:
    string;
}


type StarterPageCopy =
  Partial<
    Pick<
      DigitalAlbumDocumentPage["content"],
      "subtitle" | "text"
    >
  >;


/* ==========================================================================
   Constants
========================================================================== */

const DEFAULT_LAYOUT_VERSION =
  2 as const;


/* ==========================================================================
   Photo Slot
========================================================================== */

function createPhotoSlot():
  DigitalAlbumPhotoSlot {

  return {
    id:
      crypto.randomUUID(),

    photoId:
      null,
  };

}


/* ==========================================================================
   Page
========================================================================== */

function createPage(
  layout:
    DigitalAlbumPageLayout,

  content:
    DigitalAlbumDocumentPage["content"] = {},
): DigitalAlbumDocumentPage {

  const {
    photoSlotCount,
  } =
    getDigitalAlbumLayout(
      layout
    );

  return {
    id:
      crypto.randomUUID(),

    layout,

    layoutVersion:
      DEFAULT_LAYOUT_VERSION,

    photos:
      Array.from(
        {
          length:
            photoSlotCount,
        },
        () =>
          createPhotoSlot()
      ),

    content,

    unplacedPhotos:
      [],
  };

}


/* ==========================================================================
   Default Document
========================================================================== */

export function createDefaultDigitalAlbumDocument({
  eventName,
  eventDate,
}: CreateDefaultDigitalAlbumDocumentOptions):
  DigitalAlbumDocument {

  /* ==========================================================================
     Starter Page
  ========================================================================== */

  function starterPage(
    layout:
      DigitalAlbumPageLayout,

    copy:
      StarterPageCopy = {},
  ): DigitalAlbumDocumentPage {

    const {
      textFields,
    } =
      getDigitalAlbumLayout(
        layout
      );

    const values:
      DigitalAlbumDocumentPage["content"] = {
        title:
          eventName,

        date:
          eventDate,

        subtitle:
          "Uspomene koje ostaju",

        text:
          "Posebni trenuci, ljudi i uspomene koje želimo sačuvati.",

        ...copy,
      };

    const content =
      Object.fromEntries(
        textFields.map(
          (field) => [
            field,
            values[field],
          ]
        )
      ) as DigitalAlbumDocumentPage["content"];

    return createPage(
      layout,
      content
    );

  }


  /* ==========================================================================
     Document
  ========================================================================== */

  return {
    theme:
      "classic",

    pages: [

      /* 01 — Cover */

      starterPage(
        "cover",
        {
          subtitle:
            "Uspomene koje ostaju",
        }
      ),


      /* 02 — Editorial */

      starterPage(
        "editorial",
        {
          text:
            "Posebni trenuci, ljudi i uspomene koje želimo sačuvati.",
        }
      ),


      /* 03 — Portrait Diptych */

      starterPage(
        "portrait-diptych"
      ),


      /* 04 — Three Grid */

      starterPage(
        "three-grid"
      ),


      /* 05 — Quote */

      starterPage(
        "quote",
        {
          text:
            "Najljepše uspomene stvaramo zajedno.",

          subtitle:
            eventName,
        }
      ),


      /* 06 — Split */

      starterPage(
        "split",
        {
          text:
            "Priča ispričana kroz fotografije, detalje i trenutke koje vrijedi sačuvati.",
        }
      ),


      /* 07 — Full Photo */

      starterPage(
        "full-photo"
      ),


      /* 08 — Collage */

      starterPage(
        "collage",
        {
          subtitle:
            "Zajedno",
        }
      ),


      /* 09 — Portrait Pair + Text */

      starterPage(
        "portrait-pair-text",
        {
          subtitle:
            "Posebni trenuci",
        }
      ),


      /* 10 — Mosaic */

      starterPage(
        "mosaic"
      ),


      /* 11 — Closing */

      starterPage(
        "closing",
        {
          text:
            "Hvala što ste dio ovih uspomena.",
        }
      ),


      /* 12 — Back Cover */

      starterPage(
        "cover",
        {
          subtitle:
            "Do sljedeće uspomene",
        }
      ),
    ],
  };

}