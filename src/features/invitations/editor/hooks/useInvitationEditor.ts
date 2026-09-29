"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { InvitationSession } from "../state/InvitationSession";
import { InvitationSaveConflict } from "../../utils/invitationRevision";
import { parseInvitationDocument } from "../../utils/parseInvitationDocument";
import { updateInvitationDocumentAction } from "../../actions/invitation/updateInvitationDocumentAction";
import type { Invitation } from "../../types/invitation.types";
export function useInvitationEditor(invitation: Invitation) {
  const [session] = useState(() => new InvitationSession(parseInvitationDocument(invitation.document), invitation.document_version, invitation.document_revision,
    async (document, documentVersion, documentRevision) => {
      const result = await updateInvitationDocumentAction({ invitationId: invitation.id, document, documentVersion, documentRevision });

      if (!result.success) {
        if (result.code === "CONFLICT") throw new InvitationSaveConflict();

        throw new Error("Invitation save failed");
      }

      return { document: parseInvitationDocument(result.data.document), version: result.data.document_version, revision: result.data.document_revision };
    }));
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const [selectedId, selectPage] = useState<string | null>(snapshot.document.pages[0]?.id ?? null);
  const activePage = snapshot.document.pages.find(page => page.id === selectedId) ?? snapshot.document.pages[0] ?? null;

  // Keep the stored selection consistent when delete, undo or template replacement
  // removes its page. This guarded same-component update converges before commit.
  const activeId = activePage?.id ?? null;

  if (selectedId !== activeId) {
    selectPage(activeId);
  }

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (session.getSnapshot().status !== "saved") {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    function visibility() {
      if (document.visibilityState === "hidden") void session.flush();
    }

    window.addEventListener("beforeunload", beforeUnload);

    document.addEventListener("visibilitychange", visibility);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [session]);

  return { ...snapshot, session, activePage, selectPage };
}
