import { createServerClient } from "@/lib/supabase/server";

export async function deleteInvitation(invitationId: string) {
  const client = await createServerClient();
  const { error } = await client.rpc("delete_invitation", { p_invitation_id: invitationId });
  if (error) throw error;
  // No directory deletion. The durable storage sweep handles product cascades.
}
