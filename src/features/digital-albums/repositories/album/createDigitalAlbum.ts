import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export async function createDigitalAlbum(input: Database["public"]["Functions"]["create_digital_album"]["Args"]) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("create_digital_album", input);
  if (error) throw error;
  if (!data) throw new Error("Product RPC returned no product.");
  return data;
}
