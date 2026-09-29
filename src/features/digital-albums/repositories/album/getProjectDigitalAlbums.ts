import { createServerClient } from "@/lib/supabase/server";
import type { DigitalAlbum } from "../../types/digitalAlbum.types";

export async function getProjectDigitalAlbums(projectId: string): Promise<DigitalAlbum[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("digital_albums").select("*")
    .eq("project_id", projectId).order("created_at").order("id");
  if (error) throw error;
  return data;
}
