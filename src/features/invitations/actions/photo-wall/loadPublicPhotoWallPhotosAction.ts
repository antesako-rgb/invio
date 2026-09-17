"use server";

import {
  getPublicPhotoWallPhotos,
} from "@/features/invitations/repositories/photo-wall/getPublicPhotoWallPhotos";

import type {
  PhotoWallPhotosCursor,
  PublicPhotoWallPhotosPage,
} from "@/features/invitations/types/photoWallPhoto.types";


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
  const {
    publicId,
    cursor,
  } =
    input;


  /* ==========================================================================
     Load Photos
  ========================================================================== */

  return getPublicPhotoWallPhotos({
    publicId,

    cursor,
  });
}