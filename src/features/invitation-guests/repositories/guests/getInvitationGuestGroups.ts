import { createServerClient } from "@/lib/supabase/server";

export async function getInvitationGuestGroups(invitationId: string) {
  const db = await createServerClient();
  const { data, error } = await db.from("invitation_guest_groups").select("id,project_id,invitation_id,name,created_at,updated_at").eq("invitation_id", invitationId).order("name").order("id");
  if (error) throw error;
  return data;
}
