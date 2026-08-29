import type {
  Tables,
  TablesUpdate,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Profile
========================================================================== */

export type Profile =
  Tables<"profiles">;


/* ==========================================================================
   Update Profile
========================================================================== */

export type UpdateProfileInput =
  Pick<
    TablesUpdate<"profiles">,
    | "first_name"
    | "last_name"
    | "avatar_url"
  >;