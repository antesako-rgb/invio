import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";

import type {
  ProjectEventType,
} from "./projectEvent.types";

export type Project =
  Tables<"projects">;

export type CreateProjectInput =
  Omit<
    Database["public"]["Functions"]["create_project"]["Args"],
    "p_type"
  > & {
    p_type:
      ProjectEventType;
  };

export type UpdateProjectInput =
  Omit<
    Database["public"]["Functions"]["update_project"]["Args"],
    "p_type"
  > & {
    p_type:
      ProjectEventType;
  };

export type DeleteProjectInput =
  Database["public"]["Functions"]["delete_project"]["Args"];
