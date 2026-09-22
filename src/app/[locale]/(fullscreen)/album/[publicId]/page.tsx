import {
  notFound,
} from "next/navigation";

import DigitalAlbumRenderer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import DigitalAlbumViewer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumViewer";

import {
  getPublicDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getPublicDigitalAlbum";


/* ==========================================================================
   Types
========================================================================== */

interface PublicDigitalAlbumPageProps {
  params:
    Promise<{
      publicId:
        string;
    }>;
}


/* ==========================================================================
   Public Digital Album Page
========================================================================== */

export default async function PublicDigitalAlbumPage({
  params,
}: PublicDigitalAlbumPageProps) {
  /* ==========================================================================
     Params
  ========================================================================== */

  const {
    publicId,
  } =
    await params;


  /* ==========================================================================
     Album
  ========================================================================== */

  let publicAlbum;

  try {
    publicAlbum =
      await getPublicDigitalAlbum({
        publicId,
      });
  } catch {
    notFound();
  }


  /* ==========================================================================
     Renderer Photos
  ========================================================================== */

  const rendererPhotos:
    DigitalAlbumRendererPhoto[] =
      publicAlbum.photos.map(
        (photo) => ({
          id:
            photo.id,

          imagePath:
            photo.image_path,

          description:
            photo.description,
        })
      );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DigitalAlbumViewer>
      <DigitalAlbumRenderer
        document={
          publicAlbum.album.document
        }
        photos={
          rendererPhotos
        }
      />
    </DigitalAlbumViewer>
  );
}