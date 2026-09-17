import {
  notFound,
} from "next/navigation";

import type {
  EventType,
} from "@/features/events/types/event.types";

import EventExperienceEditorView
  from "@/features/invitations/editor/components/EventExperienceEditorView/EventExperienceEditorView";

import {
  getEventExperienceEditorData,
} from "@/features/invitations/repositories/experience/getEventExperienceEditorData";

import {
  buildEventExperienceRenderData,
} from "@/features/invitations/renderer/data/buildEventExperienceRenderData";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface EditEventExperiencePageProps {
  params:
    Promise<{
      locale:
        Locale;

      type:
        EventExperienceType;

      experienceId:
        string;
    }>;
}


/* ==========================================================================
   Edit Event Experience Page
========================================================================== */

export default async function EditEventExperiencePage({
  params,
}: EditEventExperiencePageProps) {
  const {
    locale,
    type,
    experienceId,
  } =
    await params;


  /* ==========================================================================
     Editor Data
  ========================================================================== */

  const editorData =
    await getEventExperienceEditorData(
      experienceId
    );

  if (
    !editorData
  ) {
    notFound();
  }

  const {
    experience,
    event,
  } =
    editorData;

  if (
    experience.type !==
      type
  ) {
    notFound();
  }


  /* ==========================================================================
     Render Data
  ========================================================================== */

  const data =
    buildEventExperienceRenderData({
      experience,

      locale,

      eventTimezone:
        event.timezone,

      publicId:
        experience.public_id,
    });


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EventExperienceEditorView
      experienceId={
        experience.id
      }
      experienceName={
        experience.name
      }
      eventType={
        event.type as EventType
      }
      templateId={
        experience.template_id
      }
      variantId={
        experience.variant_id
      }
      locale={
        locale
      }
      data={
        data
      }
    />
  );
}