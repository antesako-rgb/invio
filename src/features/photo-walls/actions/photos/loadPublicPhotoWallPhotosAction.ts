"use server";

import {
  getPublicPhotoWallPhotos,
} from "@/features/photo-walls/repositories/photos/getPublicPhotoWallPhotos";

import type {
  PhotoWallPhotosCursor,
  PublicPhotoWallPhotosPage,
} from "@/features/photo-walls/types/photoWallPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

interface LoadPublicPhotoWallPhotosActionInput {
  publicId:
    string;

  cursor:
    PhotoWallPhotosCursor;
}


/* ==========================================================================
   Load Public Photo Wall Photos Action
========================================================================== */

export async function loadPublicPhotoWallPhotosAction(
  input:
    LoadPublicPhotoWallPhotosActionInput
): Promise<PublicPhotoWallPhotosPage> {
  return getPublicPhotoWallPhotos({
    publicId:
      input.publicId,

    cursor:
      input.cursor,
  });
}