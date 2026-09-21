import DigitalAlbumCoverLayout
  from "@/features/digital-albums/components/album-renderer/layouts/DigitalAlbumCoverLayout/DigitalAlbumCoverLayout";

import DigitalAlbumFullPhotoLayout
  from "@/features/digital-albums/components/album-renderer/layouts/DigitalAlbumFullPhotoLayout/DigitalAlbumFullPhotoLayout";

import DigitalAlbumTwoPhotosLayout
  from "@/features/digital-albums/components/album-renderer/layouts/DigitalAlbumTwoPhotosLayout/DigitalAlbumTwoPhotosLayout";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import type {
  DigitalAlbumDocumentPage,
  DigitalAlbumPageContent,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import {
  getEventPhotoUrl,
} from "@/features/event-photos/utils/getEventPhotoUrl";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPageRendererProps {
  page:
    DigitalAlbumDocumentPage;

  photos:
    DigitalAlbumRendererPhoto[];

  activePhotoSlotId?:
    string | null;

  onSelectPhotoSlot?:
    (
      photoSlotId:
        string
    ) => void;

  onPageContentChange?:
    (
      content:
        Partial<DigitalAlbumPageContent>
    ) => void;
}


/* ==========================================================================
   Digital Album Page Renderer
========================================================================== */

export default function DigitalAlbumPageRenderer({
  page,
  photos,
  activePhotoSlotId,
  onSelectPhotoSlot,
  onPageContentChange,
}: DigitalAlbumPageRendererProps) {
  /* ==========================================================================
     Editable
  ========================================================================== */

  const photoEditable =
    Boolean(
      onSelectPhotoSlot
    );

  const contentEditable =
    Boolean(
      onPageContentChange
    );


  /* ==========================================================================
     Album Photo
  ========================================================================== */

  function getAlbumPhoto(
    photoId:
      string | null
  ): DigitalAlbumRendererPhoto | null {
    if (
      !photoId
    ) {
      return null;
    }

    return (
      photos.find(
        (photo) =>
          photo.id ===
          photoId
      ) ??
      null
    );
  }


  /* ==========================================================================
     Cover
  ========================================================================== */

  if (
    page.layout ===
      "cover"
  ) {
    const photoSlot =
      page.photos[0];

    if (
      !photoSlot
    ) {
      return null;
    }

    const albumPhoto =
      getAlbumPhoto(
        photoSlot.photoId
      );

    return (
      <DigitalAlbumCoverLayout
        photoSlotId={
          photoSlot.id
        }
        imageUrl={
          albumPhoto
            ? getEventPhotoUrl(
                albumPhoto.imagePath
              )
            : null
        }
        title={
          page.content.title
        }
        subtitle={
          page.content.subtitle
        }
        text={
          page.content.text
        }
        active={
          photoSlot.id ===
          activePhotoSlotId
        }
        photoEditable={
          photoEditable
        }
        contentEditable={
          contentEditable
        }
        onSelectPhotoSlot={
          onSelectPhotoSlot
        }
        onContentChange={
          onPageContentChange
        }
      />
    );
  }


  /* ==========================================================================
     Full Photo
  ========================================================================== */

  if (
    page.layout ===
      "full-photo"
  ) {
    const photoSlot =
      page.photos[0];

    if (
      !photoSlot
    ) {
      return null;
    }

    const albumPhoto =
      getAlbumPhoto(
        photoSlot.photoId
      );

    return (
      <DigitalAlbumFullPhotoLayout
        slotId={
          photoSlot.id
        }
        imageUrl={
          albumPhoto
            ? getEventPhotoUrl(
                albumPhoto.imagePath
              )
            : null
        }
        description={
          albumPhoto?.description ??
          null
        }
        active={
          photoSlot.id ===
          activePhotoSlotId
        }
        editable={
          photoEditable
        }
        onSelectPhotoSlot={
          onSelectPhotoSlot
        }
      />
    );
  }


  /* ==========================================================================
     Two Photos
  ========================================================================== */

  if (
    page.layout ===
      "two-photos"
  ) {
    const firstPhotoSlot =
      page.photos[0];

    const secondPhotoSlot =
      page.photos[1];

    if (
      !firstPhotoSlot ||
      !secondPhotoSlot
    ) {
      return null;
    }

    const firstAlbumPhoto =
      getAlbumPhoto(
        firstPhotoSlot.photoId
      );

    const secondAlbumPhoto =
      getAlbumPhoto(
        secondPhotoSlot.photoId
      );

    return (
      <DigitalAlbumTwoPhotosLayout
        firstPhotoSlotId={
          firstPhotoSlot.id
        }
        secondPhotoSlotId={
          secondPhotoSlot.id
        }
        firstPhoto={
          firstAlbumPhoto
            ? {
                imageUrl:
                  getEventPhotoUrl(
                    firstAlbumPhoto.imagePath
                  ),

                description:
                  firstAlbumPhoto.description,
              }
            : null
        }
        secondPhoto={
          secondAlbumPhoto
            ? {
                imageUrl:
                  getEventPhotoUrl(
                    secondAlbumPhoto.imagePath
                  ),

                description:
                  secondAlbumPhoto.description,
              }
            : null
        }
        activePhotoSlotId={
          activePhotoSlotId
        }
        editable={
          photoEditable
        }
        onSelectPhotoSlot={
          onSelectPhotoSlot
        }
      />
    );
  }


  /* ==========================================================================
     Fallback
  ========================================================================== */

  return null;
}