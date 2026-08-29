"use client";

import {
  useTranslations,
} from "next-intl";

import "./InvitationEditorSidebar.css";


/* ==========================================================================
   Invitation Editor Sidebar
========================================================================== */

export default function InvitationEditorSidebar() {
  const t =
    useTranslations(
      "Invitations.editor"
    );

  return (
    <aside
      className="invitation-editor-sidebar"
      data-invitation-editor-sidebar
    >
      {/* ====================================================================
          Header
      ==================================================================== */}

      <div
        className="invitation-editor-sidebar__header"
      >
        <h2
          className="invitation-editor-sidebar__title"
        >
          {t(
            "sidebar.title"
          )}
        </h2>
      </div>


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="invitation-editor-sidebar__content"
      >
        {/* Invitation-level controls */}
      </div>
    </aside>
  );
}