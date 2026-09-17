"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  setPhotoWallPhotoFavorite,
} from "@/features/invitations/repositories/photo-wall/setPhotoWallPhotoFavorite";

import type {
  PhotoWallPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

interface SetPhotoWallPhotoFavoriteInput {
  photoId:
    string;

  isFavorite:
    boolean;
}


/* ==========================================================================
   Set Photo Wall Photo Favorite Action
========================================================================== */

export async function setPhotoWallPhotoFavoriteAction({
  photoId,
  isFavorite,
}: SetPhotoWallPhotoFavoriteInput): Promise<ActionResult<PhotoWallPhoto>> {
  try {
    const photo =
      await setPhotoWallPhotoFavorite(
        photoId,
        isFavorite
      );

    return {
      success:
        true,

      data:
        photo,
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