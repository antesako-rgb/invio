import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  CreatePhotoWallPhotoInput,
  PhotoWallPhoto,
} from "@/features/photo-walls/types/photoWallPhoto.types";


/* ==========================================================================
   Create Photo Wall Photo
========================================================================== */

export async function createPhotoWallPhoto({
  photoWallId,
  imagePath,
  fileSize,
  description,
}: CreatePhotoWallPhotoInput): Promise<PhotoWallPhoto> {
  const admin =
    createAdminClient();


  /* ==========================================================================
     Photo Wall
  ========================================================================== */

  const {
    data: photoWall,
    error: photoWallError,
  } =
    await admin
      .from(
        "photo_walls"
      )
      .select(
        `
          id,
          project_id
        `
      )
      .eq(
        "id",
        photoWallId
      )
      .single();

  if (
    photoWallError ||
    !photoWall
  ) {
    console.error(
      "createPhotoWallPhoto photo wall error:",
      photoWallError
    );

    throw new Error(
      "Photo Wall nije pronađen."
    );
  }


  /* ==========================================================================
     Event Photo
  ========================================================================== */

  const {
    data: projectPhoto,
    error: projectPhotoError,
  } =
    await admin
      .from(
        "project_photos"
      )
      .insert({
        project_id:
          photoWall.project_id,

        image_path:
          imagePath,

        file_size:
          fileSize,

        source_type:
          "photo-wall",

        source_id:
          photoWall.id,
      })
      .select(
        `
          id,
          image_path,
          file_size,
          created_at
        `
      )
      .single();

  if (
    projectPhotoError ||
    !projectPhoto
  ) {
    console.error(
      "createPhotoWallPhoto event photo error:",
      projectPhotoError
    );

    throw new Error(
      "Fotografiju nije moguće spremiti."
    );
  }


  /* ==========================================================================
     Photo Wall Association
  ========================================================================== */

  const {
    data: association,
    error: associationError,
  } =
    await admin
      .from(
        "photo_wall_photos"
      )
      .insert({
        photo_wall_id:
          photoWall.id,

        photo_id:
          projectPhoto.id,

        description:
          description,

        is_favorite:
          false,
      })
      .select(
        `
          description,
          is_favorite
        `
      )
      .single();

  if (
    associationError ||
    !association
  ) {
    console.error(
      "createPhotoWallPhoto association error:",
      associationError
    );


    /* ========================================================================
       Event Photo Cleanup
    ======================================================================== */

    const {
      error: cleanupError,
    } =
      await admin
        .from(
          "project_photos"
        )
        .delete()
        .eq(
          "id",
          projectPhoto.id
        );

    if (
      cleanupError
    ) {
      console.error(
        "createPhotoWallPhoto cleanup error:",
        cleanupError
      );
    }

    throw new Error(
      "Fotografiju nije moguće povezati s Photo Wallom."
    );
  }


  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    id:
      projectPhoto.id,

    photoWallId:
      photoWall.id,

    imagePath:
      projectPhoto.image_path,

    fileSize:
      projectPhoto.file_size,

    description:
      association.description,

    isFavorite:
      association.is_favorite,

    createdAt:
      projectPhoto.created_at,
  };
}