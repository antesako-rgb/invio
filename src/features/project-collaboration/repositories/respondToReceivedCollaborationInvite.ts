import { createServerClient } from "@/lib/supabase/server";

export async function respondToReceivedCollaborationInvite(inviteId: string, response: "accept" | "decline") {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("respond_project_collaboration_invite_by_id", {
    p_invite_id: inviteId, p_response: response,
  });
  if (error) throw error;
  return data;
}
