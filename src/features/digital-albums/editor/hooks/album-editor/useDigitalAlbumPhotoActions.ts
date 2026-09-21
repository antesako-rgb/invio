import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  DigitalAlbumDocument,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface UseDigitalAlbumPhotoActionsOptions {
  document:
    DigitalAlbumDocument;

  activePageId:
    string | null;

  setDocument:
    Dispatch<
      SetStateAction<
        DigitalAlbumDocument
      >
    >;

  saveDocument:
    (
      document:
        DigitalAlbumDocument
    ) => Promise<void>;
}


/* ==========================================================================
   Use Digital Album Photo Actions
========================================================================== */

export default function useDigitalAlbumPhotoActions({
  document,
  activePageId,
  setDocument,
  saveDocument,
}: UseDigitalAlbumPhotoActionsOptions) {
  /* ==========================================================================
     Select Photo
  ========================================================================== */

  async function selectPhoto(
    photoSlotId:
      string,
    photoId:
      string
  ) {
    if (
      !activePageId
    ) {
      return;
    }

    const nextDocument:
      DigitalAlbumDocument = {
        ...document,

        pages:
          document.pages.map(
            (page) => {
              if (
                page.id !==
                  activePageId
              ) {
                return page;
              }

              return {
                ...page,

                photos:
                  page.photos.map(
                    (photoSlot) =>
                      photoSlot.id ===
                        photoSlotId
                        ? {
                            ...photoSlot,

                            photoId,
                          }
                        : photoSlot
                  ),
              };
            }
          ),
      };

    setDocument(
      nextDocument
    );

    await saveDocument(
      nextDocument
    );
  }


  /* ==========================================================================
     Remove Photo
  ========================================================================== */

  async function removePhotoFromPage(
    photoSlotId:
      string
  ) {
    if (
      !activePageId
    ) {
      return;
    }

    const nextDocument:
      DigitalAlbumDocument = {
        ...document,

        pages:
          document.pages.map(
            (page) => {
              if (
                page.id !==
                  activePageId
              ) {
                return page;
              }

              return {
                ...page,

                photos:
                  page.photos.map(
                    (photoSlot) =>
                      photoSlot.id ===
                        photoSlotId
                        ? {
                            ...photoSlot,

                            photoId:
                              null,
                          }
                        : photoSlot
                  ),
              };
            }
          ),
      };

    setDocument(
      nextDocument
    );

    await saveDocument(
      nextDocument
    );
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    selectPhoto,
    removePhotoFromPage,
  };
}