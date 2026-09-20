"use client";

import {
  useTranslations,
} from "next-intl";

import EditorPreview
  from "@/features/editor/components/EditorPreview/EditorPreview";

import EventExperienceRenderer
  from "@/features/invitations/renderer/EventExperienceRenderer";

import type {
  EventExperienceRenderData,
} from "@/features/invitations/types/eventExperienceRenderer.types";


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
    <EditorPreview
      closeLabel={
        t(
          "close"
        )
      }
      onClose={
        onClose
      }
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
    </EditorPreview>
  );
}