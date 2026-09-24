"use client";

import {
  useTranslations,
} from "next-intl";

import type {
  ReactNode,
} from "react";

import DigitalAlbumPhoto
  from "../../DigitalAlbumPhoto/DigitalAlbumPhoto";

import DigitalAlbumEditableText
  from "../../../../editor/components/DigitalAlbumEditableText/DigitalAlbumEditableText";

import type {
  DigitalAlbumDocumentPage,
  DigitalAlbumPageContent,
  DigitalAlbumPageLayout,
} from "../../../../types/digitalAlbumDocument.types";

import type {
  DigitalAlbumRendererPhoto,
} from "../../types/digitalAlbumRenderer.types";

import styles
  from "./DigitalAlbumLayouts.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface Parts {
  photo:
    (
      index: number,
      caption?: boolean,
    ) => ReactNode;

  text:
    (
      field: keyof DigitalAlbumPageContent,
    ) => ReactNode;
}


/* ==========================================================================
   Cover
========================================================================== */

function Cover({
  photo,
  text,
}: Parts) {
  return (
    <>
      {photo(
        0,
        false,
      )}

      <div
        className={
          styles.coverShade
        }
      />

      <div
        className={
          styles.coverText
        }
      >
        {text(
          "date"
        )}

        {text(
          "title"
        )}

        {text(
          "subtitle"
        )}
      </div>
    </>
  );
}


/* ==========================================================================
   Full Photo
========================================================================== */

function FullPhoto({
  photo,
}: Parts) {
  return (
    <>
      {photo(
        0
      )}
    </>
  );
}


/* ==========================================================================
   Two Photos
========================================================================== */

function TwoPhotos({
  photo,
}: Parts) {
  return (
    <div
      className={
        styles.stack
      }
    >
      {photo(
        0
      )}

      {photo(
        1
      )}
    </div>
  );
}


/* ==========================================================================
   Editorial
========================================================================== */

function Editorial({
  photo,
  text,
}: Parts) {
  return (
    <>
      {text(
        "title"
      )}

      <div
        className={
          styles.essayPhoto
        }
      >
        {photo(
          0,
          false,
        )}
      </div>

      <div
        className={
          styles.essayText
        }
      >
        {text(
          "text"
        )}
      </div>
    </>
  );
}


/* ==========================================================================
   Story
========================================================================== */

function Story({
  text,
}: Parts) {
  return (
    <>
      <div
        data-album-text-area
        className={
          styles.chapterHeading
        }
      >
        {text(
          "subtitle"
        )}

        {text(
          "title"
        )}

        <span
          className={
            styles.rule
          }
        />

        {text(
          "date"
        )}
      </div>

      <div
        data-album-text-area
        className={
          styles.chapterNote
        }
      >
        {text(
          "text"
        )}
      </div>
    </>
  );
}


/* ==========================================================================
   Collage
========================================================================== */

function Collage({
  photo,
  text,
}: Parts) {
  return (
    <div
      className={
        styles.collageGrid
      }
    >
      <div
        className={
          styles.collageLead
        }
      >
        {photo(
          0,
          false,
        )}
      </div>

      <div>
        {photo(
          1,
          false,
        )}
      </div>

      <div>
        {photo(
          2,
          false,
        )}
      </div>

      <div
        className={
          styles.collageText
        }
      >
        {text(
          "subtitle"
        )}

        {text(
          "title"
        )}
      </div>
    </div>
  );
}


/* ==========================================================================
   Portrait Plate
========================================================================== */

function PortraitPlate({
  photo,
}: Parts) {
  return (
    <div
      className={
        styles.portraitPlate
      }
    >
      {photo(
        0
      )}
    </div>
  );
}


/* ==========================================================================
   Landscape Plate
========================================================================== */

function LandscapePlate({
  photo,
}: Parts) {
  return (
    <div
      className={
        styles.landscapePlate
      }
    >
      {photo(
        0
      )}
    </div>
  );
}


/* ==========================================================================
   Portrait Diptych
========================================================================== */

function PortraitDiptych({
  photo,
}: Parts) {
  return (
    <div
      className={
        styles.diptych
      }
    >
      {photo(
        0
      )}

      {photo(
        1
      )}
    </div>
  );
}


/* ==========================================================================
   Mixed Pair
========================================================================== */

function MixedPair({
  photo,
}: Parts) {
  return (
    <>
      <div
        className={
          styles.mixedPortrait
        }
      >
        {photo(
          0
        )}
      </div>

      <div
        className={
          styles.mixedLandscape
        }
      >
        {photo(
          1
        )}
      </div>
    </>
  );
}


/* ==========================================================================
   Hero Detail
========================================================================== */

function HeroDetail({
  photo,
}: Parts) {
  return (
    <>
      <div
        className={
          styles.hero
        }
      >
        {photo(
          0,
          false,
        )}
      </div>

      <div
        className={
          styles.detail
        }
      >
        {photo(
          1
        )}
      </div>
    </>
  );
}


/* ==========================================================================
   Quote
========================================================================== */

function Quote({
  text,
}: Parts) {
  return (
    <div
      className={
        styles.quoteBlock
      }
    >
      <span
        className={
          styles.quoteMark
        }
        aria-hidden="true"
      >
        &#8220;
      </span>

      {text(
        "text"
      )}

      <span
        className={
          styles.rule
        }
      />

      {text(
        "subtitle"
      )}
    </div>
  );
}


/* ==========================================================================
   Closing
========================================================================== */

function Closing({
  text,
}: Parts) {
  return (
    <div
      className={
        styles.closingBlock
      }
    >
      <span
        className={
          styles.rule
        }
      />

      {text(
        "title"
      )}

      {text(
        "text"
      )}

      {text(
        "date"
      )}
    </div>
  );
}


/* ==========================================================================
   Layouts
========================================================================== */

const layouts:
  Record<
    DigitalAlbumPageLayout,
    (parts: Parts) => ReactNode
  > = {
    cover:
      Cover,

    "full-photo":
      FullPhoto,

    "two-photos":
      TwoPhotos,

    editorial:
      Editorial,

    story:
      Story,

    collage:
      Collage,

    "portrait-plate":
      PortraitPlate,

    "landscape-plate":
      LandscapePlate,

    "portrait-diptych":
      PortraitDiptych,

    "mixed-pair":
      MixedPair,

    "hero-detail":
      HeroDetail,

    quote:
      Quote,

    closing:
      Closing,
  };


/* ==========================================================================
   Digital Album Layouts
========================================================================== */

export default function DigitalAlbumLayouts({
  page,
  photos,
  activePhotoSlotId,
  onSelectPhotoSlot,
  onPageContentChange,
}: {
  page:
    DigitalAlbumDocumentPage;

  photos:
    DigitalAlbumRendererPhoto[];

  activePhotoSlotId?:
    string | null;

  onSelectPhotoSlot?:
    (id: string) => void;

  onPageContentChange?:
    (
      content:
        Partial<DigitalAlbumPageContent>,
    ) => void;
}) {
  const t =
    useTranslations(
      "DigitalAlbumEditor.upgrade.fields"
    );

  const Composition =
    layouts[
      page.layout
    ];


  /* ==========================================================================
     Photo
  ========================================================================== */

  function photo(
    index: number,
    caption = true,
  ) {
    const slot =
      page.photos[
        index
      ];

    if (!slot) {
      return null;
    }

    const asset =
      photos.find(
        (photo) =>
          photo.id ===
          slot.photoId
      );

    const description =
      slot.caption ??
      asset?.description;

    return (
      <figure
        className={
          styles.figure
        }
      >
        <div
          className={
            styles.image
          }
        >
          <DigitalAlbumPhoto
            slot={
              slot
            }
            photo={
              asset
            }
            active={
              slot.id ===
              activePhotoSlotId
            }
            onSelect={
              onSelectPhotoSlot
            }
          />
        </div>

        {
          caption &&
          description && (
            <figcaption
              data-album-text
              className={
                styles.caption
              }
            >
              {
                description
              }
            </figcaption>
          )
        }
      </figure>
    );
  }


  /* ==========================================================================
     Text
  ========================================================================== */

  function text(
    field:
      keyof DigitalAlbumPageContent,
  ) {
    return (
      <DigitalAlbumEditableText
        value={
          page.content[
            field
          ]
        }
        placeholder={
          t(
            field
          )
        }
        editable={
          Boolean(
            onPageContentChange
          )
        }
        className={
          styles[
            field
          ]
        }
        onChange={(
          value
        ) =>
          onPageContentChange?.({
            [field]:
              value,
          })
        }
      />
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.page
      }
      data-album-page={
        page.id
      }
      data-composition={
        page.layout
      }
      data-album-layout-version="2"
    >
      <Composition
        photo={
          photo
        }
        text={
          text
        }
      />
    </div>
  );
}