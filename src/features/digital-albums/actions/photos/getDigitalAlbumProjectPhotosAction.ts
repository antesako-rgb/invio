"use server";
import { createServerClient } from "@/lib/supabase/server";
import { requireProjectOwner } from "@/features/projects/repositories/requireProjectOwner";
import type { ActionResult } from "@/lib/actions/actionResult";
import type { ProjectPhoto } from "@/features/project-photos/types/projectPhoto.types";
export async function getDigitalAlbumProjectPhotosAction(albumId: string, offset: number): Promise<ActionResult<{ photos: ProjectPhoto[]; nextOffset: number | null }>> {
  try {
    if (!Number.isSafeInteger(offset) || offset < 0) throw new Error("Invalid offset");
    const supabase = await createServerClient();
    const { data: album, error: albumError } = await supabase.from("digital_albums").select("project_id").eq("id", albumId).maybeSingle();
    if (albumError || !album) throw new Error("Album not found");
    await requireProjectOwner(album.project_id);
    const { data, error } = await supabase.from("project_photos").select("*").eq("project_id", album.project_id)
      .order("created_at").order("id").range(offset, offset + 49);
    if (error) throw error;
    return { success: true, data: { photos: data, nextOffset: data.length === 50 ? offset + 50 : null } };
  } catch { return { success: false, message: "Project photos could not be loaded." }; }
}
