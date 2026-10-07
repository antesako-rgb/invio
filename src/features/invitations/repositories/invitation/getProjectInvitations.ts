import { createServerClient } from "@/lib/supabase/server";

// Management needs metadata only; documents are loaded for the selected editor.
export async function getProjectInvitations(projectId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("invitations")
    .select("id,project_id,name,is_public,public_id,created_at,updated_at")
    .eq("project_id", projectId).order("created_at", { ascending: false }).order("id");
  if (error) throw error;
  return data;
}
