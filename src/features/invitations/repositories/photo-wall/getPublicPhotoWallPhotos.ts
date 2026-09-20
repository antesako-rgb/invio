import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWallPhotosCursor,
  PublicPhotoWallPhotosPage,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Constants
========================================================================== */

const PAGE_SIZE =
  30;


/* ==========================================================================
   Types
========================================================================== */

interface GetPublicPhotoWallPhotosPageInput {
  publicId:
    string;

  cursor?:
    PhotoWallPhotosCursor | null;
}


/* ==========================================================================
   Get Public Photo Wall Photos
========================================================================== */

export async function getPublicPhotoWallPhotos(
  input:
    GetPublicPhotoWallPhotosPageInput
): Promise<PublicPhotoWallPhotosPage> {
  const {
    publicId,
    cursor = null,
  } =
    input;

  const supabase =
    await createServerClient();


  /* ==========================================================================
     Get Photos
  ========================================================================== */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_public_photo_wall_photos",
      {
        p_public_id:
          publicId,

        p_limit:
          PAGE_SIZE +
          1,

        p_cursor_created_at:
          cursor?.createdAt,

        p_cursor_id:
          cursor?.id,
      }
    );


  /* ==========================================================================
     Error
  ========================================================================== */

  if (
    error
  ) {
    console.error(
      "getPublicPhotoWallPhotos error:",
      error
    );

    throw new Error(
      "Fotografije nije moguće dohvatiti."
    );
  }


  /* ==========================================================================
     Page
  ========================================================================== */

  const rows =
    data ??
    [];

  const hasMore =
    rows.length >
    PAGE_SIZE;

  const photos =
    hasMore
      ? rows.slice(
          0,
          PAGE_SIZE
        )
      : rows;


  /* ==========================================================================
     Next Cursor
  ========================================================================== */

  const lastPhoto =
    photos[
      photos.length -
      1
    ];

  const nextCursor =
    hasMore &&
    lastPhoto
      ? {
          createdAt:
            lastPhoto.created_at,

          id:
            lastPhoto.id,
        }
      : null;


  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    photos,

    nextCursor,
  };
}