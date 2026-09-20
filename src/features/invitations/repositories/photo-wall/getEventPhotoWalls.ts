import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWall,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Get Event Photo Walls
========================================================================== */

export async function getEventPhotoWalls(
  eventId:
    string
): Promise<PhotoWall[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "invitations"
      )
      .select(
        "*"
      )
      .eq(
        "event_id",
        eventId
      )
      .eq(
        "type",
        "photo-wall"
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (
    error
  ) {
    console.error(
      "getEventPhotoWalls error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}