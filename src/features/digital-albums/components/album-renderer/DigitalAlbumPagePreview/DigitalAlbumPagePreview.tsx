import DigitalAlbumPageRenderer from "@/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer";

import type { DigitalAlbumRendererPhoto } from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import type { DigitalAlbumDocumentPage, DigitalAlbumTheme } from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type { DigitalAlbumPhotoWithPhoto } from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import "@/features/digital-albums/components/album-renderer/themes/DigitalAlbumThemes.css";

import styles from "./DigitalAlbumPagePreview.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPagePreviewProps {
  page: DigitalAlbumDocumentPage;
  theme: DigitalAlbumTheme;

  photos?: DigitalAlbumPhotoWithPhoto[];
  rendererPhotos?: DigitalAlbumRendererPhoto[];
  photosById?: ReadonlyMap<string, DigitalAlbumRendererPhoto>;
}

/* ==========================================================================
   Digital Album Page Preview
========================================================================== */

export default function DigitalAlbumPagePreview({
  page,
  theme,
  photos = [],
  rendererPhotos: suppliedRendererPhotos,
  photosById,
}: DigitalAlbumPagePreviewProps) {
  /* ==========================================================================
     Renderer Photos
  ========================================================================== */

  const rendererPhotos: DigitalAlbumRendererPhoto[] = suppliedRendererPhotos ?? photos.map(
    (albumPhoto) => ({
      id: albumPhoto.photo_id,

      imagePath: albumPhoto.photo.image_path,

      description: albumPhoto.description,
    }),
  );

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div className={styles.root} data-album-theme={theme}>
      <DigitalAlbumPageRenderer page={page} photos={rendererPhotos} photosById={photosById} />
    </div>
  );
}
