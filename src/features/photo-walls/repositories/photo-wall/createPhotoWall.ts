import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export async function createPhotoWall(input: Database["public"]["Functions"]["create_photo_wall"]["Args"]) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("create_photo_wall", input);
  if (error) throw error;
  if (!data) throw new Error("Product RPC returned no product.");
  return data;
}
