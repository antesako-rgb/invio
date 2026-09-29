import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  InvitationPhotoWithPhoto,
} from "../../types/invitationPhoto.types";


/* ==========================================================================
   Get Invitation Photos
========================================================================== */

export async function getInvitationPhotos(
  invitationId: string
): Promise<InvitationPhotoWithPhoto[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "invitation_photos"
      )
      .select(`
        *,
        photo:project_photos!invitation_photos_photo_id_fkey (*)
      `)
      .eq(
        "invitation_id",
        invitationId
      )
      .order(
        "created_at"
      )
      .order(
        "photo_id"
      );

  if (error) {
    throw error;
  }

  return data;
}