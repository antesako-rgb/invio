import { createServerClient } from "@/lib/supabase/server";

export async function getReceivedCollaborationInvites() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user?.email) return [];
  // Do not select token_hash or use an admin client to bypass recipient RLS.
  const { data, error } = await supabase.from("event_collaboration_invites")
    .select("id,expires_at,events(name)")
    .eq("email", user.email.toLowerCase()).eq("status", "pending")
    .gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
