import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  getDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getDigitalAlbum";

import {
  albumPhotoUsage,
} from "@/features/digital-albums/utils/digitalAlbumDocumentOperations";

import {
  parseDigitalAlbumDocument,
} from "@/features/digital-albums/utils/parseDigitalAlbumDocument";

import {
  deleteEmptyDigitalAlbumPhotoDirectory,
} from "@/features/event-photos/services/deleteEmptyDigitalAlbumPhotoDirectory";

import {
  deleteOrphanEventPhoto,
} from "@/features/event-photos/services/deleteOrphanEventPhoto";

import type {
  RemoveDigitalAlbumPhotoInput,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Remove Digital Album Photo
========================================================================== */

export async function removeDigitalAlbumPhoto(
  input:
    RemoveDigitalAlbumPhotoInput
): Promise<void> {
  const album =
    await getDigitalAlbum(
      input.albumId
    );

  if (
    !album
  ) {
    throw new Error(
      "Digital album not found."
    );
  }

  const document =
    parseDigitalAlbumDocument(
      album.document
    );

  if (
    albumPhotoUsage(
      document,
      input.photoId
    ).length > 0
  ) {
    throw new Error(
      "Photo is still referenced by the album document."
    );
  }


  /* ==========================================================================
     Supabase
  ========================================================================== */

  const supabase =
    await createServerClient();


  /* ==========================================================================
     Get Photo
  ========================================================================== */

  const {
    data: photo,
    error: photoError,
  } =
    await supabase
      .from(
        "event_photos"
      )
      .select(
        "id, image_path, source_type"
      )
      .eq(
        "id",
        input.photoId
      )
      .maybeSingle();

  if (
    photoError
  ) {
    console.error(
      "removeDigitalAlbumPhoto get photo error:",
      photoError
    );

    throw new Error(
      "Unable to load photo."
    );
  }

  if (
    !photo
  ) {
    throw new Error(
      "Photo not found."
    );
  }


  /* ==========================================================================
     Remove Digital Album Association
  ========================================================================== */

  const {
    error,
  } =
    await supabase.rpc(
      "remove_digital_album_photo",
      {
        p_album_id:
          input.albumId,

        p_photo_id:
          input.photoId,
      }
    );

  if (
    error
  ) {
    console.error(
      "removeDigitalAlbumPhoto error:",
      error
    );

    throw new Error(
      error.message
    );
  }


  /* ==========================================================================
     Keep Photo Wall Source
  ========================================================================== */

  if (
    photo.source_type ===
    "photo-wall"
  ) {
    return;
  }


  /* ==========================================================================
     Delete Orphan Event Photo
  ========================================================================== */

  await deleteOrphanEventPhoto({
    photoId:
      input.photoId,

    imagePath:
      photo.image_path,
  });


  /* ==========================================================================
     Delete Empty Digital Album Directory
  ========================================================================== */

  await deleteEmptyDigitalAlbumPhotoDirectory(
    input.albumId
  );
}