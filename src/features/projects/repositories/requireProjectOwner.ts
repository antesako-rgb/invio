import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { getProject } from "./getProject";

export async function requireProjectOwner(projectId: string) {
  const supabase = await createServerClient();
  const [project, { data: { user }, error }] = await Promise.all([
    getProject(projectId), supabase.auth.getUser(),
  ]);
  if (error || !user || !project || project.owner_id !== user.id) throw new Error("UNAUTHORIZED");
  return project;
}
