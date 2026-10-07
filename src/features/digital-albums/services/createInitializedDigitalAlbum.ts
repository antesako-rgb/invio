import "server-only";

import {
  requireProjectOwner,
} from "@/features/projects/repositories/requireProjectOwner";

import {
  createDigitalAlbum,
} from "../repositories/album/createDigitalAlbum";

import {
  deleteDigitalAlbum,
} from "../repositories/album/deleteDigitalAlbum";

import {
  updateDigitalAlbumDocument,
} from "../repositories/album/updateDigitalAlbumDocument";

import {
  createDefaultDigitalAlbumDocument,
} from "../document/createDefaultDigitalAlbumDocument";


/* ==========================================================================
   Create Initialized Digital Album
========================================================================== */

export async function createInitializedDigitalAlbum(
  projectId: string,
  name: string
) {
  const project =
    await requireProjectOwner(
      projectId
    );

  const album =
    await createDigitalAlbum({
      p_project_id:
        project.id,

      p_name:
        name,
    });

  try {
    return await updateDigitalAlbumDocument({
      albumId:
        album.id,

      document:
        createDefaultDigitalAlbumDocument({
          eventName:
            project.name,

          eventDate:
            project.start_date,
        }),

      documentVersion:
        2,

      documentRevision:
        album.document_revision,
    });
  } catch (error) {
    try {
      await deleteDigitalAlbum(
        album.id
      );
    } catch (cleanupError) {
      console.error(
        "New album initialization cleanup failed.",
        {
          albumId:
            album.id,

          projectId,

          error:
            cleanupError,
        }
      );
    }

    throw error;
  }
}
