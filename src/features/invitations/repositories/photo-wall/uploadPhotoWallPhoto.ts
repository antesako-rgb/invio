import "server-only";

import {
  randomUUID,
} from "crypto";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  uploadToBunny,
  deleteFromBunny,
} from "@/lib/upload/bunny";

import {
  buildPhotoWallPhotoFileName,
} from "@/lib/upload/buildFileName";

import {
  optimizeImage,
} from "@/lib/upload/optimizeImage";

import {
  validateImage,
} from "@/lib/upload/validateImage";

import {
  createPhotoWallPhoto,
} from "@/features/invitations/repositories/photo-wall/createPhotoWallPhoto";

import type {
  PhotoWallPhoto,
  UploadPhotoWallPhotoInput,
} from "@/features/invitations/types/photoWallPhoto.types";

/* ==========================================================================
   Constants
========================================================================== */

const MAX_DESCRIPTION_LENGTH =
  300;


/* ==========================================================================
   Upload Photo Wall Photo
========================================================================== */

export async function uploadPhotoWallPhoto({
  file,
  publicId,
  description,
}: UploadPhotoWallPhotoInput): Promise<PhotoWallPhoto> {
  const normalizedPublicId =
    publicId.trim();

  const normalizedDescription =
    description
      ? description.trim()
      : null;


  /* ==========================================================================
     Public ID Validation
  ========================================================================== */

  if (!normalizedPublicId) {
    throw new Error(
      "Identifikator Photo Walla je obavezan."
    );
  }


  /* ==========================================================================
     Description Validation
  ========================================================================== */

  if (
    normalizedDescription &&
    normalizedDescription.length >
      MAX_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      "Opis fotografije može imati najviše 300 znakova."
    );
  }


  /* ==========================================================================
     Image Validation
  ========================================================================== */

  validateImage(
    file
  );


  /* ==========================================================================
     Photo Wall Access
  ========================================================================== */

  const admin =
    createAdminClient();

  const {
    data: photoWall,
    error: photoWallError,
  } =
    await admin
      .from(
        "invitations"
      )
      .select(
        "id"
      )
      .eq(
        "public_id",
        normalizedPublicId
      )
      .eq(
        "type",
        "photo-wall"
      )
      .eq(
        "is_public",
        true
      )
      .not(
        "published_at",
        "is",
        null
      )
      .maybeSingle();

  if (
    photoWallError ||
    !photoWall
  ) {
    if (photoWallError) {
      console.error(
        "uploadPhotoWallPhoto access error:",
        photoWallError
      );
    }

    throw new Error(
      "Photo Wall nije pronađen ili nije dostupan."
    );
  }


  /* ==========================================================================
     Optimize Image
  ========================================================================== */

  const fileBuffer =
    await file.arrayBuffer();

  const optimizedBuffer =
    await optimizeImage({
      buffer:
        fileBuffer,

      width:
        1600,

      quality:
        85,
    });

  const optimizedArrayBuffer =
    optimizedBuffer.buffer.slice(
      optimizedBuffer.byteOffset,
      optimizedBuffer.byteOffset +
        optimizedBuffer.byteLength
    ) as ArrayBuffer;


  /* ==========================================================================
     Photo ID
  ========================================================================== */

  const photoId =
    randomUUID();


  /* ==========================================================================
     Bunny Path
  ========================================================================== */

  const path =
    buildPhotoWallPhotoFileName(
      photoWall.id,
      photoId
    );


  /* ==========================================================================
     Bunny Upload
  ========================================================================== */

  await uploadToBunny(
    optimizedArrayBuffer,
    path,
    "image/webp"
  );


  /* ==========================================================================
     Database
  ========================================================================== */

  try {
    return await createPhotoWallPhoto({
      invitationId:
        photoWall.id,

      imagePath:
        path,

      fileSize:
        optimizedBuffer.byteLength,

      description:
        normalizedDescription,
    });
  } catch (error) {
    /* ==========================================================================
       Bunny Cleanup
    ========================================================================== */

    try {
      await deleteFromBunny(
        path
      );
    } catch (cleanupError) {
      console.error(
        "uploadPhotoWallPhoto cleanup error:",
        cleanupError
      );
    }

    throw error;
  }
}