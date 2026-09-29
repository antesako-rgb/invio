import { createServerClient } from "@/lib/supabase/server";
import type { DeleteProjectInput } from "../types/project.types";

export async function deleteProject(input: DeleteProjectInput): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("delete_project", input);
  if (error) throw error;

}
