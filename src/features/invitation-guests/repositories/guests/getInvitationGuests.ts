import { createServerClient } from "@/lib/supabase/server";

export async function getInvitationGuests(invitationId: string) {
  const db = await createServerClient();
  const { data, error } = await db.from("invitation_guests").select("id,project_id,invitation_id,group_id,recipient_id,first_name,last_name,notes,is_primary,created_at,updated_at").eq("invitation_id", invitationId)
    .order("first_name").order("last_name").order("id");
  if (error) throw error;
  return data;
}
