import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { deleteDigitalAlbum } from "../repositories/album/deleteDigitalAlbum";
import { deleteOrphanProjectPhoto } from "@/features/project-photos/services/deleteOrphanProjectPhoto";
import { deleteEmptyDigitalAlbumPhotoDirectory } from "@/features/project-photos/services/deleteEmptyDigitalAlbumPhotoDirectory";

export async function deleteDigitalAlbumWithStorage(albumId: string): Promise<void> {
  const supabase = await createServerClient();
  const { data: album, error: albumError } = await supabase.from("digital_albums")
    .select("id,project_id").eq("id", albumId).single();
  if (albumError) throw albumError;
  const photos: { id: string; image_path: string }[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("digital_album_photos")
      .select("photo:project_photos!digital_album_photos_photo_id_fkey(id,image_path)")
      .eq("album_id", album.id).order("photo_id").range(offset, offset + 499);
    if (error) throw error;
    for (const row of data) photos.push(row.photo);
    if (data.length < 500) break;
  }
  // Owner/member authorization is enforced by the existing deletion RPC.
  await deleteDigitalAlbum(album.id);
  let failed = false;
  for (const photo of photos) {
    try { await deleteOrphanProjectPhoto({ photoId: photo.id, imagePath: photo.image_path }); }
    catch { failed = true; console.error("Album deleted; orphan cleanup failed.", { albumId, photoId: photo.id }); }
  }
  // Keep this directory if uploads from it are still referenced by another product.
  try { await deleteEmptyDigitalAlbumPhotoDirectory(album.id); }
  catch { failed = true; console.error("Album deleted; directory cleanup failed.", { albumId }); }
  if (failed) throw new Error("Album deleted; storage cleanup requires retry. See server diagnostics.");
}
