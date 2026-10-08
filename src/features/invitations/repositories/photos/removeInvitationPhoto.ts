import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { requestProjectPhotoCleanup } from "@/features/project-photos/storage/requestProjectPhotoCleanup";

export async function removeInvitationPhoto(invitationId: string, photoId: string) {
  z.string().uuid().parse(invitationId);
  z.string().uuid().parse(photoId);
  const client = await createServerClient();
  const { error } = await client.rpc("remove_invitation_photo", {
    p_invitation_id: invitationId, p_photo_id: photoId,
  });
  if (error) throw error;
  await requestProjectPhotoCleanup({ photoId });
}
