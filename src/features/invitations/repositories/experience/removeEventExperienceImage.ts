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
   Remove Event Experience Image
========================================================================== */

export async function removeEventExperienceImage(
  experienceId: string,
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
     Event Experience Access
  ========================================================================== */

  const {
    data: experience,
    error: experienceError,
  } =
    await supabase
      .from("invitations")
      .select("id")
      .eq(
        "id",
        experienceId
      )
      .single();

  if (
    experienceError ||
    !experience
  ) {
    throw new Error(
      "Event experience nije pronađen ili nemate dopuštenje za pristup."
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
    `invitations/${experienceId}/images/`;

  if (
    !path ||
    !path.startsWith(
      expectedPrefix
    )
  ) {
    throw new Error(
      "Fotografija ne pripada ovom event experienceu."
    );
  }

  await deleteFromBunny(
    path
  );
}