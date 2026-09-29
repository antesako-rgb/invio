import {
  z,
} from "zod";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  deleteOrphanProjectPhoto,
} from "@/features/project-photos/services/deleteOrphanProjectPhoto";


/* ==========================================================================
   Remove Invitation Photo
========================================================================== */

export async function removeInvitationPhoto(
  invitationId: string,
  photoId: string
) {
  z
    .string()
    .uuid()
    .parse(
      photoId
    );

  const supabase =
    await createServerClient();

  const {
    data: photo,
    error: photoError,
  } =
    await supabase
      .from(
        "project_photos"
      )
      .select(
        "id, image_path"
      )
      .eq(
        "id",
        photoId
      )
      .maybeSingle();

  if (photoError) {
    throw photoError;
  }

  if (!photo) {
    throw new Error(
      "Photo not found"
    );
  }

  const {
    error,
  } =
    await supabase.rpc(
      "remove_invitation_photo",
      {
        p_invitation_id:
          invitationId,

        p_photo_id:
          photoId,
      }
    );

  if (error) {
    throw error;
  }

  await deleteOrphanProjectPhoto({
    photoId,
    imagePath:
      photo.image_path,
  });
}