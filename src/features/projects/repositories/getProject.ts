import { createServerClient } from "@/lib/supabase/server";
import type { ProjectWithEventDetails } from "../types/project.types";

export async function getProject(projectId: string): Promise<ProjectWithEventDetails | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("projects")
    .select("*,project_event_details(*)").eq("id", projectId).maybeSingle();
  if (error) throw error;
  return data;
}
