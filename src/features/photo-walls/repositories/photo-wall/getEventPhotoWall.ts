import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  PhotoWall,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Get Event Photo Wall
========================================================================== */

export async function getEventPhotoWall(
  eventId:
    string
): Promise<PhotoWall | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "photo_walls"
      )
      .select(
        "*"
      )
      .eq(
        "event_id",
        eventId
      )
      .maybeSingle();

  if (
    error
  ) {
    console.error(
      "getEventPhotoWall error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}