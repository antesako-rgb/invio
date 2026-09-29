import {
  z,
} from "zod";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  assertInvitationVersion,
  parseInvitationDocument,
} from "../../utils/parseInvitationDocument";

import {
  assertInvitationRevision,
} from "../../utils/invitationRevision";


/* ==========================================================================
   Get Invitation
========================================================================== */

export async function getInvitation(
  invitationId: string
) {
  // =========================================
  // Validation
  // =========================================

  const invitationIdResult =
    z
      .string()
      .uuid()
      .safeParse(
        invitationId
      );

  if (
    !invitationIdResult.success
  ) {
    return null;
  }


  // =========================================
  // Supabase
  // =========================================

  const supabase =
    await createServerClient();


  // =========================================
  // Invitation
  // =========================================

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "invitations"
      )
      .select(
        "*"
      )
      .eq(
        "id",
        invitationId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }


  // =========================================
  // Document Validation
  // =========================================

  if (data) {
    assertInvitationVersion(
      data.document_version
    );

    assertInvitationRevision(
      data.document_revision
    );

    parseInvitationDocument(
      data.document
    );
  }


  // =========================================
  // Return
  // =========================================

  return data;
}