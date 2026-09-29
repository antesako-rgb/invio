import { getProject } from "./getProject";
import { createServerClient } from "@/lib/supabase/server";
import { getProjectPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";
import { getProjectDigitalAlbums } from "@/features/digital-albums/repositories/album/getProjectDigitalAlbums";

export async function getProjectWorkspaceData(projectId: string) {
  const project = await getProject(projectId);
  if (!project) return null;
  const supabase = await createServerClient();
  const [photoWall, digitalAlbums, auth] = await Promise.all([
    getProjectPhotoWall(projectId), getProjectDigitalAlbums(projectId), supabase.auth.getUser(),
  ]);
  if (auth.error) throw auth.error;
  return { project, photoWall, digitalAlbums, isOwner: auth.data.user?.id === project.owner_id };
}
