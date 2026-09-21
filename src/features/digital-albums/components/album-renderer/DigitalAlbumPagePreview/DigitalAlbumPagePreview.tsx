import DigitalAlbumPageRenderer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import type {
  DigitalAlbumDocumentPage,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type {
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

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
     Renderer Photos
  ========================================================================== */

  const rendererPhotos:
    DigitalAlbumRendererPhoto[] =
      photos.map(
        (albumPhoto) => ({
          id:
            albumPhoto.photo_id,

          imagePath:
            albumPhoto.photo.image_path,

          description:
            albumPhoto.description,
        })
      );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
      data-album-theme="classic"
    >
      <DigitalAlbumPageRenderer
        page={
          page
        }
        photos={
          rendererPhotos
        }
      />
    </div>
  );
}