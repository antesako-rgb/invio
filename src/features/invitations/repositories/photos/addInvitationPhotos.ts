import {
  z,
} from "zod";

import {
  createServerClient,
} from "@/lib/supabase/server";


/* ==========================================================================
   Add Invitation Photos
========================================================================== */

export async function addInvitationPhotos(
  invitationId: string,
  photoIds: string[]
) {
  const ids =
    z
      .array(
        z.string()
          .uuid()
      )
      .min(1)
      .max(50)
      .parse(
        photoIds
      );

  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "add_invitation_photos",
      {
        p_invitation_id:
          invitationId,

        p_photo_ids:
          ids,
      }
    );

  if (error) {
    throw error;
  }

  return data;
}