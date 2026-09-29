import {
  createServerClient,
} from "@/lib/supabase/server";


/* ==========================================================================
   Publish Invitation
========================================================================== */

export async function publishInvitation(
  invitationId: string
) {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "publish_invitation",
      {
        p_invitation_id:
          invitationId,
      }
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Invitation operation failed"
    );
  }

  return data;
}