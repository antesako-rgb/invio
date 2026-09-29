import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteDirectoryFromBunny, deleteFromBunny } from "@/lib/upload/bunny";
import { deleteProject } from "../repositories/deleteProject";
import type { ProjectPhoto } from "@/features/project-photos/types/projectPhoto.types";

export async function deleteProjectWithStorage(projectId: string): Promise<void> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("UNAUTHORIZED");
  const { data: project, error: projectError } = await supabase.from("projects")
    .select("id").eq("id", projectId).eq("owner_id", user.id).maybeSingle();
  if (projectError) throw projectError;
  if (!project) throw new Error("UNAUTHORIZED");

  // Admin reads only after owner authorization; paginate beyond PostgREST's row cap.
  const admin = createAdminClient();
  const photos: ProjectPhoto[] = [];
  const directories = new Set<string>();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await admin.from("project_photos").select("*")
      .eq("project_id", projectId).order("id").range(offset, offset + 499);
    if (error) throw error;
    photos.push(...data);
    if (data.length < 500) break;
  }
  for (const photo of photos) {
    // Include origins whose product was already deleted but whose photos were shared.
    if (photo.source_type === "digital-album") directories.add(`digital-albums/${photo.source_id}`);
    if (photo.source_type === "invitation") directories.add(`invitations/${photo.source_id}`);
    if (photo.source_type === "photo-wall") directories.add(`photo-wall/${photo.source_id}`);
  }
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await admin.from("digital_albums").select("id")
      .eq("project_id", projectId).order("id").range(offset, offset + 499);
    if (error) throw error;
    for (const album of data) directories.add(`digital-albums/${album.id}`);
    if (data.length < 500) break;
  }
  const { data: wall, error: wallError } = await admin.from("photo_walls")
    .select("id").eq("project_id", projectId).maybeSingle();
  if (wallError) throw wallError;
  if (wall) directories.add(`photo-wall/${wall.id}`);

  const { data: invitation, error: invitationError } = await admin.from("invitations").select("id")
    .eq("project_id", projectId).maybeSingle();
  if (invitationError) throw invitationError;
  if (invitation) directories.add(`invitations/${invitation.id}`);

  // The RPC repeats owner authorization. Never destroy files before DB acceptance.
  await deleteProject({ p_project_id: projectId });
  let failed = false;
  for (const path of new Set(photos.map(photo => photo.image_path))) {
    try { await deleteFromBunny(path); }
    catch { failed = true; console.error("Project deleted; Bunny file cleanup failed.", { projectId, path }); }
  }
  for (const path of directories) {
    try { await deleteDirectoryFromBunny(path); }
    catch { failed = true; console.error("Project deleted; Bunny directory cleanup failed.", { projectId, path }); }
  }
  if (failed) throw new Error("Project deleted; storage cleanup requires retry. See server diagnostics.");
}
