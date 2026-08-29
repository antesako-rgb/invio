import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  Invitation,
  UpdateInvitationData,
  UpdateInvitationInput,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Helpers
========================================================================== */

function toJson(
  value: unknown
): Json {
  return JSON.parse(
    JSON.stringify(
      value
    )
  ) as Json;
}


/* ==========================================================================
   Update Invitation
========================================================================== */

export async function updateInvitation(
  input: UpdateInvitationData
): Promise<Invitation> {
  const supabase =
    await createServerClient();

  const rpcInput: UpdateInvitationInput = {
    p_invitation_id:
      input.p_invitation_id,

    p_name:
      input.p_name,

    p_template_id:
      input.p_template_id,

    p_variant_id:
      input.p_variant_id,

    p_content:
      toJson(
        input.p_content
      ),

    p_presentation:
      toJson(
        input.p_presentation
      ),
  };

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_invitation",
      rpcInput
    );

  if (error) {
    console.error(
      "updateInvitation error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Pozivnica nije ažurirana."
    );
  }

  return data;
}