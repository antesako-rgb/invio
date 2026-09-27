import {
  createServerClient,
} from "@/lib/supabase/server";
import { getEventDigitalAlbum } from "@/features/digital-albums/repositories/album/getEventDigitalAlbum";

import type {
  Event,
} from "../types/event.types";

import {
  EVENT_COLUMNS,
  mapEvent,
} from "./mapEvent";


/* ==========================================================================
   Types
========================================================================== */

interface EventProductSummary {
  id: string;
  event_id: string;
  name: string;
  is_public: boolean;
}

export interface EventProductsPageData {
  event: Event;
  photoWall: EventProductSummary | null;
  digitalAlbum: EventProductSummary | null;
}


/* ==========================================================================
   Get Event Products Page Data
========================================================================== */

export async function getEventProductsPageData(
  eventId: string
): Promise<EventProductsPageData | null> {
  const supabase =
    await createServerClient();

  const [
    eventResult,
    photoWallResult,
    digitalAlbumResult,
  ] =
    await Promise.all([
      supabase
        .from("events")
        .select(EVENT_COLUMNS)
        .eq(
          "id",
          eventId
        )
        .maybeSingle(),

      supabase
        .from("photo_walls")
        .select(
          "id,event_id,name,is_public"
        )
        .eq(
          "event_id",
          eventId
        )
        .maybeSingle(),

      getEventDigitalAlbum(eventId),
    ]);

  if (eventResult.error) {
    throw eventResult.error;
  }

  if (photoWallResult.error) {
    throw photoWallResult.error;
  }

  if (!eventResult.data) {
    return null;
  }

  return {
    event:
      mapEvent(
        eventResult.data
      ),

    photoWall:
      photoWallResult.data,

    digitalAlbum:
      digitalAlbumResult,
  };
}
