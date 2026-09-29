import { createServerClient } from "@/lib/supabase/server";
import type { Project } from "@/features/projects/types/project.types";
import type { CreateProjectEventInput } from "../types/projectEvent.types";

// The RPC atomically creates the Project and ProjectEvent Details, with no products.
export async function createProjectEvent(input: CreateProjectEventInput): Promise<Project> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("create_event_project", input);
  if (error) throw error;
  if (!data) throw new Error("ProjectEvent Project RPC returned no project.");
  return data;
}
