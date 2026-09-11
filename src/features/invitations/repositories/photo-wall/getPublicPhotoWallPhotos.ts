import "server-only";

import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetPublicPhotoWallPhotosInput,
  PublicPhotoWallPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Get Public Photo Wall Photos
========================================================================== */

export async function getPublicPhotoWallPhotos(
  input:
    GetPublicPhotoWallPhotosInput
): Promise<PublicPhotoWallPhoto[]> {
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
      input
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
     Result
  ========================================================================== */

  return data ??
    [];
}