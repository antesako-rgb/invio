import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetPhotoWallPhotosPageInput,
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
      .select(
        "*"
      )
      .eq(
        "invitation_id",
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
        "id",
        "in",
        `(${excludedPhotoIds.join(",")})`
      );
  }

  if (
    cursor
  ) {
    photosQuery =
      photosQuery.or(
        `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`
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
        "id",
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
        "id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "invitation_id",
        invitationId
      );

  let favoriteCountQuery =
    supabase
      .from(
        "photo_wall_photos"
      )
      .select(
        "id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "invitation_id",
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
        "id",
        "in",
        excludedIds
      );

    favoriteCountQuery =
      favoriteCountQuery.not(
        "id",
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

  const photos =
    hasMore
      ? rows.slice(
          0,
          PAGE_SIZE
        )
      : rows;


  /* ==========================================================================
     Next Cursor
  ========================================================================== */

  const lastPhoto =
    photos[
      photos.length -
      1
    ];

  const nextCursor =
    hasMore &&
    lastPhoto
      ? {
          createdAt:
            lastPhoto.created_at,

          id:
            lastPhoto.id,
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