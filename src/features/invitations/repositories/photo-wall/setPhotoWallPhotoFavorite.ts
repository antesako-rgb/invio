import {
  createServerClient,
} from "@/lib/supabase/server";


/* ==========================================================================
   Set Photo Wall Photo Favorite
========================================================================== */

export async function setPhotoWallPhotoFavorite(
  photoWallId:
    string,
  photoId:
    string,
  isFavorite:
    boolean
): Promise<void> {
  const supabase =
    await createServerClient();


  /* ==========================================================================
     Set Favorite
  ========================================================================== */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "set_photo_wall_photo_favorite",
      {
        p_photo_wall_id:
          photoWallId,

        p_photo_id:
          photoId,

        p_is_favorite:
          isFavorite,
      }
    );


  /* ==========================================================================
     Error
  ========================================================================== */

  if (
    error
  ) {
    console.error(
      "setPhotoWallPhotoFavorite error:",
      error
    );

    throw new Error(
      "Favorit nije moguće ažurirati."
    );
  }


  /* ==========================================================================
     Result
  ========================================================================== */

  if (
    !data
  ) {
    throw new Error(
      "Fotografija nije pronađena."
    );
  }
}