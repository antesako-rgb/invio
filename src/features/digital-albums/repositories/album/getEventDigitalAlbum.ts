import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Get Event Digital Album
========================================================================== */

export async function getEventDigitalAlbum(
  eventId:
    string
): Promise<DigitalAlbum | null> {

  const supabase =
    await createServerClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "digital_albums"
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
    throw error;
  }


  return data;

}