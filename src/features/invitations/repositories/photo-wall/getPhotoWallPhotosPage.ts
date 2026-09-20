import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetPhotoWallPhotosPageInput,
  PhotoWallPhoto,
  PhotoWallPhotosPage,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Constants
========================================================================== */

const PAGE_SIZE =
  24;


/* ==========================================================================
   Get Photo Wall Photos Page
========================================================================== */

export async function getPhotoWallPhotosPage({
  invitationId,
  filter = "all",
  cursor = null,
  excludedPhotoIds = [],
}: GetPhotoWallPhotosPageInput): Promise<PhotoWallPhotosPage> {
  const supabase =
    await createServerClient();


  /* ==========================================================================
     Photos Query
  ========================================================================== */

  let photosQuery =
    supabase
      .from(
        "photo_wall_photos"
      )
      .select(`
        photo_wall_id,
        photo_id,
        description,
        is_favorite,
        created_at,
        photo:event_photos!photo_wall_photos_photo_id_fkey (
          id,
          image_path,
          file_size
        )
      `)
      .eq(
        "photo_wall_id",
        invitationId
      );

  if (
    filter ===
      "favorites"
  ) {
    photosQuery =
      photosQuery.eq(
        "is_favorite",
        true
      );
  }

  if (
    excludedPhotoIds.length >
      0
  ) {
    photosQuery =
      photosQuery.not(
        "photo_id",
        "in",
        `(${excludedPhotoIds.join(",")})`
      );
  }

  if (
    cursor
  ) {
    photosQuery =
      photosQuery.or(
        `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},photo_id.lt.${cursor.id})`
      );
  }

  photosQuery =
    photosQuery
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      )
      .order(
        "photo_id",
        {
          ascending:
            false,
        }
      )
      .limit(
        PAGE_SIZE +
        1
      );


  /* ==========================================================================
     Counts
  ========================================================================== */

  let totalCountQuery =
    supabase
      .from(
        "photo_wall_photos"
      )
      .select(
        "photo_id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "photo_wall_id",
        invitationId
      );

  let favoriteCountQuery =
    supabase
      .from(
        "photo_wall_photos"
      )
      .select(
        "photo_id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "photo_wall_id",
        invitationId
      )
      .eq(
        "is_favorite",
        true
      );

  if (
    excludedPhotoIds.length >
      0
  ) {
    const excludedIds =
      `(${excludedPhotoIds.join(",")})`;

    totalCountQuery =
      totalCountQuery.not(
        "photo_id",
        "in",
        excludedIds
      );

    favoriteCountQuery =
      favoriteCountQuery.not(
        "photo_id",
        "in",
        excludedIds
      );
  }


  /* ==========================================================================
     Get Data
  ========================================================================== */

  const [
    photosResult,
    totalCountResult,
    favoriteCountResult,
  ] =
    await Promise.all([
      photosQuery,
      totalCountQuery,
      favoriteCountQuery,
    ]);


  /* ==========================================================================
     Errors
  ========================================================================== */

  if (
    photosResult.error
  ) {
    console.error(
      "getPhotoWallPhotosPage photos error:",
      photosResult.error
    );

    throw new Error(
      "Fotografije nije moguće dohvatiti."
    );
  }

  if (
    totalCountResult.error
  ) {
    console.error(
      "getPhotoWallPhotosPage total count error:",
      totalCountResult.error
    );

    throw new Error(
      "Broj fotografija nije moguće dohvatiti."
    );
  }

  if (
    favoriteCountResult.error
  ) {
    console.error(
      "getPhotoWallPhotosPage favorite count error:",
      favoriteCountResult.error
    );

    throw new Error(
      "Broj favorita nije moguće dohvatiti."
    );
  }


  /* ==========================================================================
     Page
  ========================================================================== */

  const rows =
    photosResult.data ??
    [];

  const hasMore =
    rows.length >
    PAGE_SIZE;

  const pageRows =
    hasMore
      ? rows.slice(
          0,
          PAGE_SIZE
        )
      : rows;


  /* ==========================================================================
     Photos
  ========================================================================== */

  const photos:
    PhotoWallPhoto[] =
    pageRows.map(
      (row) => ({
        id:
          row.photo.id,

        photoWallId:
          row.photo_wall_id,

        imagePath:
          row.photo.image_path,

        fileSize:
          row.photo.file_size,

        description:
          row.description,

        isFavorite:
          row.is_favorite,

        createdAt:
          row.created_at,
      })
    );


  /* ==========================================================================
     Next Cursor
  ========================================================================== */

  const lastRow =
    pageRows[
      pageRows.length -
      1
    ];

  const nextCursor =
    hasMore &&
    lastRow
      ? {
          createdAt:
            lastRow.created_at,

          id:
            lastRow.photo_id,
        }
      : null;


  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    photos,

    nextCursor,

    totalCount:
      totalCountResult.count ??
      0,

    favoriteCount:
      favoriteCountResult.count ??
      0,
  };
}