import {
  notFound,
} from "next/navigation";

import DigitalAlbumEditorView
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView";

import {
  getDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getDigitalAlbum";

import {
  getDigitalAlbumPhotos,
} from "@/features/digital-albums/repositories/photos/getDigitalAlbumPhotos";

import {
  parseDigitalAlbumDocument,
} from "@/features/digital-albums/utils/parseDigitalAlbumDocument";

import {
  getEventPhotoWalls,
} from "@/features/invitations/repositories/photo-wall/getEventPhotoWalls";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorPageProps {
  params:
    Promise<{
      albumId:
        string;
    }>;
}


/* ==========================================================================
   Digital Album Editor Page
========================================================================== */

export default async function DigitalAlbumEditorPage({
  params,
}: DigitalAlbumEditorPageProps) {
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
     Editor Data
  ========================================================================== */

  const [
    photos,
    photoWalls,
  ] =
    await Promise.all([
      getDigitalAlbumPhotos(
        album.id
      ),

      getEventPhotoWalls(
        album.event_id
      ),
    ]);


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DigitalAlbumEditorView
      albumId={
        album.id
      }
      document={
        document
      }
      documentVersion={
        album.document_version
      }
      photos={
        photos
      }
      photoWalls={
        photoWalls
      }
    />
  );
}