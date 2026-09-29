import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  getInvitation,
} from "../invitation/getInvitation";


/* ==========================================================================
   Get Invitation Project Photos
========================================================================== */

export async function getInvitationProjectPhotos(
  invitationId: string,
  offset = 0
) {
  if (
    !Number.isSafeInteger(offset)
    || offset < 0
  ) {
    throw new Error(
      "Invalid offset"
    );
  }

  const invitation =
    await getInvitation(
      invitationId
    );

  if (!invitation) {
    return {
      photos: [],
      nextOffset: null,
    };
  }

  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "project_photos"
      )
      .select("*")
      .eq(
        "project_id",
        invitation.project_id
      )
      .order(
        "created_at"
      )
      .order(
        "id"
      )
      .range(
        offset,
        offset + 49
      );

  if (error) {
    throw error;
  }

  return {
    photos:
      data,

    nextOffset:
      data.length === 50
        ? offset + 50
        : null,
  };
}