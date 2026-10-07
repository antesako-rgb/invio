import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { UpdateInvitationRsvpSettingsInput } from "../../types/invitation.types";

export async function updateInvitationRsvpSettings(input: UpdateInvitationRsvpSettingsInput): Promise<void> {
  const db = await createServerClient();
  // Generated scalar RPC Args omit the capacity column's nullable type.
  const { error } = await db.rpc("update_invitation_rsvp_settings", input as Database["public"]["Functions"]["update_invitation_rsvp_settings"]["Args"]);
  if (error) throw error;
}
