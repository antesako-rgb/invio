import {
  randomUUID,
} from "crypto";

import {
  uploadToBunny,
  deleteFromBunny,
} from "@/lib/upload/bunny";

import {
  buildDigitalAlbumPhotoFileName,
} from "@/lib/upload/buildFileName";

import {
  optimizeImage,
} from "@/lib/upload/optimizeImage";

import {
  validateImage,
} from "@/lib/upload/validateImage";

import {
  createDigitalAlbumPhoto,
} from "@/features/digital-albums/repositories/photos/createDigitalAlbumPhoto";

import type {
  DigitalAlbumPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

interface UploadDigitalAlbumPhotoInput {
  file:
    File;

  albumId:
    string;

  description?:
    string;
}


/* ==========================================================================
   Upload Digital Album Photo
========================================================================== */

export async function uploadDigitalAlbumPhoto({
  file,
  albumId,
  description,
}: UploadDigitalAlbumPhotoInput): Promise<DigitalAlbumPhoto> {
  const normalizedAlbumId =
    albumId.trim();


  /* ==========================================================================
     Album ID Validation
  ========================================================================== */

  if (
    !normalizedAlbumId
  ) {
    throw new Error(
      "Identifikator digitalnog albuma je obavezan."
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
    buildDigitalAlbumPhotoFileName(
      normalizedAlbumId,
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
    return await createDigitalAlbumPhoto({
      albumId:
        normalizedAlbumId,

      imagePath:
        path,

      fileSize:
        optimizedBuffer.byteLength,

      description:
        description,
    });
  } catch (error) {
    /* ========================================================================
       Bunny Cleanup
    ======================================================================== */

    try {
      await deleteFromBunny(
        path
      );
    } catch (cleanupError) {
      console.error(
        "uploadDigitalAlbumPhoto cleanup error:",
        cleanupError
      );
    }

    throw error;
  }
}