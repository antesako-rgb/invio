"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  setPhotoWallPhotoFavorite,
} from "@/features/invitations/repositories/photo-wall/setPhotoWallPhotoFavorite";


/* ==========================================================================
   Types
========================================================================== */

interface SetPhotoWallPhotoFavoriteInput {
  photoWallId:
    string;

  photoId:
    string;

  isFavorite:
    boolean;
}


/* ==========================================================================
   Set Photo Wall Photo Favorite Action
========================================================================== */

export async function setPhotoWallPhotoFavoriteAction({
  photoWallId,
  photoId,
  isFavorite,
}: SetPhotoWallPhotoFavoriteInput): Promise<ActionResult<void>> {
  try {
    await setPhotoWallPhotoFavorite(
      photoWallId,
      photoId,
      isFavorite
    );

    return {
      success:
        true,

      data:
        undefined,
    };
  } catch (error) {
    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Favorit nije moguće ažurirati.",
    };
  }
}