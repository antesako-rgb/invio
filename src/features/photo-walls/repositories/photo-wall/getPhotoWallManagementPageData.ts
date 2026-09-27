import "server-only";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  getPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getPhotoWall";


/* ==========================================================================
   Get Photo Wall Management Page Data
========================================================================== */

export async function getPhotoWallManagementPageData(
  photoWallId:
    string
) {
  const supabase =
    await createServerClient();

  const photoWall =
    await getPhotoWall(
      photoWallId
    );

  if (
    !photoWall
  ) {
    return null;
  }

  const [
    {
      data: {
        user,
      },
      error: authError,
    },
    {
      data: event,
      error: eventError,
    },
  ] =
    await Promise.all([
      supabase.auth.getUser(),

      supabase
        .from(
          "events"
        )
        .select(
          "owner_id"
        )
        .eq(
          "id",
          photoWall.event_id
        )
        .maybeSingle(),
    ]);

  if (
    authError
  ) {
    throw new Error(
      authError.message
    );
  }

  if (
    eventError
  ) {
    throw new Error(
      eventError.message
    );
  }

  if (
    !user ||
    !event
  ) {
    return null;
  }

  return {
    photoWall,
    isOwner:
      user.id ===
      event.owner_id,
  };
}