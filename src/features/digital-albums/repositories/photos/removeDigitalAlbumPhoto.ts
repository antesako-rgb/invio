import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { requestProjectPhotoCleanup } from "@/features/project-photos/storage/requestProjectPhotoCleanup";
import type { RemoveDigitalAlbumPhotoInput } from "../../types/digitalAlbumPhoto.types";

export async function removeDigitalAlbumPhoto(input: RemoveDigitalAlbumPhotoInput): Promise<void> {
  z.string().uuid().parse(input.albumId);
  z.string().uuid().parse(input.photoId);
  const client = await createServerClient();
  const { error } = await client.rpc("remove_digital_album_photo", {
    p_album_id: input.albumId, p_photo_id: input.photoId,
  });
  if (error) throw error;
  await requestProjectPhotoCleanup({ photoId: input.photoId });
}
