import {
  createDefaultDigitalAlbumDocument,
} from "@/features/digital-albums/document/createDefaultDigitalAlbumDocument";

import type {
  Json,
} from "@/lib/supabase/database.types";

import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CreateEventInput,
  Event,
} from "../types/event.types";

import {
  mapEvent,
} from "./mapEvent";


/* ==========================================================================
   Create Event
========================================================================== */

export async function createEvent(
  input:
    CreateEventInput
): Promise<Event> {

  const supabase =
    await createServerClient();


  /* ==========================================================================
     Digital Album
  ========================================================================== */

  const digitalAlbumDocument =
    createDefaultDigitalAlbumDocument({
      eventName:
        input.p_name,

      eventDate:
        input.p_start_date,
    });


  const digitalAlbumDocumentJson =
    JSON.parse(
      JSON.stringify(
        digitalAlbumDocument
      )
    ) as Json;


  /* ==========================================================================
     Create
  ========================================================================== */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_event",
      {
        ...input,

        p_digital_album_document:
          digitalAlbumDocumentJson,
      }
    );


  if (
    error
  ) {
    throw new Error(
      error.message
    );
  }


  if (
    !data
  ) {
    throw new Error(
      "Event RPC returned no event."
    );
  }


  return mapEvent(
    data
  );

}