import { createServerClient } from "@/lib/supabase/server";

export class CollaborationProfileMissingError extends Error {
  constructor() {
    super("User profile not found.");
    this.name = "CollaborationProfileMissingError";
  }
}

export async function getReceivedCollaborationInvites() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) return [];
  // The RPC matches auth.uid() to profiles.email and filters pending, unexpired invites.
  const { data, error } = await supabase.rpc("get_received_collaboration_invites");
  if (error?.code === "P0002" && error.message === "User profile not found.") {
    throw new CollaborationProfileMissingError();
  }
  if (error) throw error;
  return data;
}
