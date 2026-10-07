import { createServerClient } from "@/lib/supabase/server";

export async function renewProjectCollaborationInvite(inviteId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("renew_project_collaboration_invite", { p_invite_id: inviteId });
  if (error) throw error;
  if (!data[0]) throw new Error("Invitation renewal returned no link");
  return data[0];
}
