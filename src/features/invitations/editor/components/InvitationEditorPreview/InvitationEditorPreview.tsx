"use client";

import {
  X,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import InvitationRenderer
  from "@/features/invitations/renderer/InvitationRenderer";

import type {
  InvitationRenderData,
} from "@/features/invitations/types/invitationRenderer.types";

import "./InvitationEditorPreview.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorPreviewProps {
  templateId:
    string;

  variantId:
    string;

  data:
    InvitationRenderData;

  onClose:
    () => void;
}


/* ==========================================================================
   Invitation Editor Preview
========================================================================== */

export default function InvitationEditorPreview({
  templateId,
  variantId,
  data,
  onClose,
}: InvitationEditorPreviewProps) {
  const t =
    useTranslations(
      "Invitations.editor.preview"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-editor-preview"
      data-invitation-editor-ui
    >
      {/* ====================================================================
          Close
      ==================================================================== */}

      <button
        type="button"
        className="invitation-editor-preview__close"
        onClick={
          onClose
        }
        aria-label={
          t(
            "close"
          )
        }
      >
        <X
          size={20}
          aria-hidden="true"
        />
      </button>


      {/* ====================================================================
          Experience
      ==================================================================== */}

      <div
        className="invitation-editor-preview__experience"
      >
        <InvitationRenderer
          templateId={
            templateId
          }
          variantId={
            variantId
          }
          mode="live"
          data={
            data
          }
        />
      </div>
    </div>
  );
}