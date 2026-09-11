import "server-only";

import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWallPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Get Photo Wall Photos
========================================================================== */

export async function getPhotoWallPhotos(
  invitationId:
    string
): Promise<PhotoWallPhoto[]> {
  const supabase =
    await createServerClient();


  /* ==========================================================================
     Get Photos
  ========================================================================== */

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "photo_wall_photos"
      )
      .select(
        "*"
      )
      .eq(
        "invitation_id",
        invitationId
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      )
      .order(
        "id",
        {
          ascending:
            false,
        }
      );


  /* ==========================================================================
     Error
  ========================================================================== */

  if (
    error
  ) {
    console.error(
      "getPhotoWallPhotos error:",
      error
    );

    throw new Error(
      "Fotografije nije moguće dohvatiti."
    );
  }


  /* ==========================================================================
     Result
  ========================================================================== */

  return data ??
    [];
}