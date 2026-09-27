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
} from "@/features/photo-walls/repositories/photos/createPhotoWallPhoto";

import type {
  PhotoWallPhoto,
  UploadPhotoWallPhotoInput,
} from "@/features/photo-walls/types/photoWallPhoto.types";


/* ==========================================================================
   Upload Photo Wall Photo
========================================================================== */

export async function uploadPhotoWallPhoto({
  publicId,
  file,
  description,
}: UploadPhotoWallPhotoInput): Promise<PhotoWallPhoto> {
  const normalizedPublicId =
    publicId.trim();


  /* ==========================================================================
     Public ID Validation
  ========================================================================== */

  if (
    !normalizedPublicId
  ) {
    throw new Error(
      "Photo Wall nije pronađen."
    );
  }


  /* ==========================================================================
     Public Photo Wall
  ========================================================================== */

  const admin =
    createAdminClient();

  const {
    data: photoWall,
    error: photoWallError,
  } =
    await admin
      .from(
        "photo_walls"
      )
      .select(
        "id"
      )
      .eq(
        "public_id",
        normalizedPublicId
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
    photoWallError
  ) {
    console.error(
      "uploadPhotoWallPhoto photo wall error:",
      photoWallError
    );

    throw new Error(
      "Photo Wall nije moguće provjeriti."
    );
  }

  if (
    !photoWall
  ) {
    throw new Error(
      "Photo Wall nije dostupan."
    );
  }


  /* ==========================================================================
     Image Validation
  ========================================================================== */

  validateImage(
    file
  );


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
     File ID
  ========================================================================== */

  const fileId =
    randomUUID();


  /* ==========================================================================
     Bunny Path
  ========================================================================== */

  const path =
    buildPhotoWallPhotoFileName(
      photoWall.id,
      fileId
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
      photoWallId:
        photoWall.id,

      imagePath:
        path,

      fileSize:
        optimizedBuffer.byteLength,

      description:
        description?.trim() ||
        null,
    });
  } catch (
    error
  ) {
    /* ========================================================================
       Bunny Cleanup
    ======================================================================== */

    try {
      await deleteFromBunny(
        path
      );
    } catch (
      cleanupError
    ) {
      console.error(
        "uploadPhotoWallPhoto cleanup error:",
        cleanupError
      );
    }

    throw error;
  }
}