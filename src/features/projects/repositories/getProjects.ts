import { createServerClient } from "@/lib/supabase/server";
import type { ProjectWithEventDetails } from "../types/project.types";

export async function getProjects(): Promise<ProjectWithEventDetails[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("projects")
    .select("*,project_event_details(*)").order("created_at", { ascending: false }).order("id");
  if (error) throw error;
  return data;
}
