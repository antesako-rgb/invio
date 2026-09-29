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
  getProjectPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";


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
    photoWall,
  ] =
    await Promise.all([
      getDigitalAlbumPhotos(
        album.id
      ),

      getProjectPhotoWall(
        album.project_id
      ),
    ]);


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DigitalAlbumEditorView
      projectId={album.project_id}
      albumId={
        album.id
      }
      document={
        document
      }
      documentRevision={
        album.document_revision
      }
      documentVersion={
        album.document_version
      }
      photos={
        photos
      }
      photoWalls={
        photoWall
          ? [
              photoWall,
            ]
          : []
      }
    />
  );

}
