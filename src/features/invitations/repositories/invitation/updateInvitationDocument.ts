import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  UpdateInvitationDocumentInput,
} from "../../types/invitation.types";

import {
  assertInvitationRevision,
  InvitationSaveConflict,
} from "../../utils/invitationRevision";

import {
  assertInvitationVersion,
  parseInvitationDocument,
} from "../../utils/parseInvitationDocument";

import {
  invitationDocumentsEqual,
} from "../../utils/invitationDocumentOperations";


/* ==========================================================================
   Update Invitation Document
========================================================================== */

export async function updateInvitationDocument(
  input: UpdateInvitationDocumentInput
) {
  assertInvitationVersion(
    input.documentVersion
  );

  assertInvitationRevision(
    input.documentRevision
  );

  const document =
    parseInvitationDocument(
      input.document
    );

  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_invitation_document",
      {
        p_invitation_id:
          input.invitationId,

        p_document:
          document,

        p_document_version:
          input.documentVersion,

        p_expected_revision:
          input.documentRevision,
      }
    );

  if (error) {
    if (
      error.code === "PT409"
    ) {
      throw new InvitationSaveConflict();
    }

    throw error;
  }

  if (!data) {
    throw new Error(
      "Invitation was not saved"
    );
  }

  assertInvitationRevision(
    data.document_revision
  );

  assertInvitationVersion(
    data.document_version
  );

  const savedDocument =
    parseInvitationDocument(
      data.document
    );

  if (
    data.document_revision !==
      input.documentRevision + 1
    || !invitationDocumentsEqual(
      savedDocument,
      document
    )
  ) {
    throw new Error(
      "Invitation save round-trip mismatch"
    );
  }

  return data;
}