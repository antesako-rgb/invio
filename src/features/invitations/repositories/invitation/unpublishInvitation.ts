import {
  createServerClient,
} from "@/lib/supabase/server";


/* ==========================================================================
   Unpublish Invitation
========================================================================== */

export async function unpublishInvitation(
  invitationId: string
) {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "unpublish_invitation",
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