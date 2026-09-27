import "server-only";
import { createServerClient } from "@/lib/supabase/server";

// RLS remains active; this explicit check also prevents a read-only collaborator
// from acquiring Material mutation rights through a server action.
export async function requirePhotoWallMaterialOwner(photoWallId: string) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("UNAUTHORIZED");
  const { data: wall, error: wallError } = await supabase.from("photo_walls")
    .select("id,event_id").eq("id", photoWallId).maybeSingle();
  if (wallError || !wall) throw new Error("UNAUTHORIZED");
  const { data: event, error: eventError } = await supabase.from("events")
    .select("id,owner_id").eq("id", wall.event_id).eq("owner_id", user.id).maybeSingle();
  if (eventError || !event) throw new Error("UNAUTHORIZED");
  return { supabase, wall };
}
