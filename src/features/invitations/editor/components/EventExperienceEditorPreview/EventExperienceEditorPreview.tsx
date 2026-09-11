"use client";

import {
  X,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import EventExperienceRenderer
  from "@/features/invitations/renderer/EventExperienceRenderer";

import type {
  EventExperienceRenderData,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import "./EventExperienceEditorPreview.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorPreviewProps {
  templateId:
    string;

  variantId:
    string;

  data:
    EventExperienceRenderData;

  onClose:
    () => void;
}


/* ==========================================================================
   Event Experience Editor Preview
========================================================================== */

export default function EventExperienceEditorPreview({
  templateId,
  variantId,
  data,
  onClose,
}: EventExperienceEditorPreviewProps) {
  const t =
    useTranslations(
     "EventExperiences.editor.preview"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="event-experience-editor-preview"
      data-event-experience-editor-ui
    >
      {/* ====================================================================
          Close
      ==================================================================== */}

      <button
        type="button"
        className="event-experience-editor-preview__close"
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
        className="event-experience-editor-preview__experience"
      >
        <EventExperienceRenderer
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