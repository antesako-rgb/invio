import {
  notFound,
} from "next/navigation";

import DigitalAlbumPrintRenderer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import {
  getDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getDigitalAlbum";

import {
  getDigitalAlbumPhotos,
} from "@/features/digital-albums/repositories/photos/getDigitalAlbumPhotos";

import {
  parseDigitalAlbumDocument,
} from "@/features/digital-albums/utils/parseDigitalAlbumDocument";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPrintPageProps {
  params:
    Promise<{
      albumId:
        string;
    }>;
}


/* ==========================================================================
   Digital Album Print Page
========================================================================== */

export default async function DigitalAlbumPrintPage({
  params,
}: DigitalAlbumPrintPageProps) {
  const {
    albumId,
  } =
    await params;


  /* ==========================================================================
     Album
  ========================================================================== */

  const album =
    await getDigitalAlbum(
      albumId
    );

  if (
    !album
  ) {
    notFound();
  }


  /* ==========================================================================
     Document
  ========================================================================== */

  const document =
    parseDigitalAlbumDocument(
      album.document
    );


  /* ==========================================================================
     Photos
  ========================================================================== */

  const photos =
    await getDigitalAlbumPhotos(
      album.id
    );


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
    <DigitalAlbumPrintRenderer
      document={
        document
      }
      photos={
        rendererPhotos
      }
    />
  );
}