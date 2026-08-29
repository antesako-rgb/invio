import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  CreateInvitationData,
  CreateInvitationInput,
  Invitation,
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
   Create Invitation
========================================================================== */

export async function createInvitation(
  input: CreateInvitationData
): Promise<Invitation> {
  const supabase =
    await createServerClient();

  const rpcInput: CreateInvitationInput = {
    p_event_id:
      input.p_event_id,

    p_name:
      input.p_name,

    p_template_id:
      input.p_template_id,

    p_variant_id:
      input.p_variant_id,

    ...(input.p_content !== undefined
      ? {
          p_content:
            toJson(
              input.p_content
            ),
        }
      : {}),

    ...(input.p_presentation !== undefined
      ? {
          p_presentation:
            toJson(
              input.p_presentation
            ),
        }
      : {}),
  };

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_invitation",
      rpcInput
    );

  if (error) {
    console.error(
      "createInvitation error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Pozivnica nije kreirana."
    );
  }

  return data;
}