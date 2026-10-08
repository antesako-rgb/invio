import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { requestProjectPhotoCleanup } from "@/features/project-photos/storage/requestProjectPhotoCleanup";
import type { DeletePhotoWallPhotoInput } from "../../types/photoWallPhoto.types";

export async function deletePhotoWallPhoto(input: DeletePhotoWallPhotoInput): Promise<void> {
  z.string().uuid().parse(input.photoWallId);
  z.string().uuid().parse(input.photoId);
  const client = await createServerClient();
  const { error } = await client.rpc("remove_photo_wall_photo", {
    p_photo_wall_id: input.photoWallId, p_photo_id: input.photoId,
  });
  if (error) throw error;
  await requestProjectPhotoCleanup({ photoId: input.photoId });
}
