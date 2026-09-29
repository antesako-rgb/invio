import { createServerClient } from "@/lib/supabase/server";

export async function deleteDigitalAlbum(albumId: string): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("delete_digital_album", { p_album_id: albumId });
  if (error) throw error;
}
