import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/** Default for a new plan only. Updates keep the user's saved source or disconnection. */
export async function getDefaultRsvpInvitation(db: SupabaseClient<Database>, projectId: string) {
  const result = await db.from("invitations").select("id").eq("project_id", projectId).limit(2);
  if (result.error) throw result.error;
  return result.data?.length === 1 ? result.data[0].id : null;
}
