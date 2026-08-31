import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  deleteFromBunny,
} from "@/lib/upload/bunny";

import {
  getBunnyPath,
} from "@/lib/upload/getBunnyPath";


/* ==========================================================================
   Remove Invitation Image
========================================================================== */

export async function removeInvitationImage(
  invitationId: string,
  imageUrl: string
): Promise<void> {
  const supabase =
    await createServerClient();


  /* ==========================================================================
     Authentication
  ========================================================================== */

  const {
    data: {
      user,
    },
    error: authError,
  } =
    await supabase.auth.getUser();

  if (
    authError ||
    !user
  ) {
    throw new Error(
      "Prijava je obavezna."
    );
  }


  /* ==========================================================================
     Invitation Access
  ========================================================================== */

  const {
    data: invitation,
    error: invitationError,
  } =
    await supabase
      .from("invitations")
      .select("id")
      .eq(
        "id",
        invitationId
      )
      .single();

  if (
    invitationError ||
    !invitation
  ) {
    throw new Error(
      "Pozivnica nije pronađena ili nemate dopuštenje za pristup."
    );
  }


  /* ==========================================================================
     Bunny Path
  ========================================================================== */
const path =
  getBunnyPath(
    imageUrl
  );

const expectedPrefix =
  `invitations/${invitationId}/images/`;

if (
  !path ||
  !path.startsWith(
    expectedPrefix
  )
) {
  throw new Error(
    "Fotografija ne pripada ovoj pozivnici."
  );
}

await deleteFromBunny(
  path
);
}