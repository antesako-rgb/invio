import DigitalAlbumFullPhotoLayout
  from "@/features/digital-albums/components/album-renderer/layouts/DigitalAlbumFullPhotoLayout/DigitalAlbumFullPhotoLayout";

import type {
  DigitalAlbumDocumentPage,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type {
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import {
  getEventPhotoUrl,
} from "@/features/event-photos/utils/getEventPhotoUrl";

import styles
  from "./DigitalAlbumPagePreview.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPagePreviewProps {
  page:
    DigitalAlbumDocumentPage;

  photos:
    DigitalAlbumPhotoWithPhoto[];
}


/* ==========================================================================
   Digital Album Page Preview
========================================================================== */

export default function DigitalAlbumPagePreview({
  page,
  photos,
}: DigitalAlbumPagePreviewProps) {
  /* ==========================================================================
     Photo
  ========================================================================== */

  const photoId =
    page.photos[0]?.photoId ??
    null;

  const albumPhoto =
    photoId
      ? photos.find(
          (photo) =>
            photo.photo_id ===
            photoId
        )
      : null;

  const imageUrl =
    albumPhoto
      ? getEventPhotoUrl(
          albumPhoto.photo.image_path
        )
      : null;


  /* ==========================================================================
     Layout
  ========================================================================== */

  function renderLayout() {
    switch (
      page.layout
    ) {
      case "full-photo":
        if (
          !imageUrl
        ) {
          return (
            <div
              className={
                styles.empty
              }
            />
          );
        }

        return (
          <DigitalAlbumFullPhotoLayout
            imageUrl={
              imageUrl
            }
            description={
              page.content.text
            }
          />
        );

      default:
        return (
          <div
            className={
              styles.empty
            }
          />
        );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
    >
      {renderLayout()}
    </div>
  );
}