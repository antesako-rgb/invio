import type { Database, Tables } from "@/lib/supabase/database.types";

export type Project = Tables<"projects">;
export type ProjectEventDetails = Tables<"project_event_details">;
export type ProjectWithEventDetails = Project & { project_event_details: ProjectEventDetails | null };
export type CreateProjectInput = Database["public"]["Functions"]["create_project"]["Args"];
export type UpdateProjectInput = Database["public"]["Functions"]["update_project"]["Args"];
export type DeleteProjectInput = Database["public"]["Functions"]["delete_project"]["Args"];
