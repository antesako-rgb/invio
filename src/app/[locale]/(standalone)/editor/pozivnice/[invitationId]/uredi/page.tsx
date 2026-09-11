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
  getPhotoWallPhotos,
} from "@/features/invitations/repositories/photo-wall/getPhotoWallPhotos";

import {
  buildEventExperienceRenderData,
} from "@/features/invitations/renderer/data/buildEventExperienceRenderData";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface EditInvitationPageProps {
  params:
    Promise<{
      locale:
        Locale;

      invitationId:
        string;
    }>;
}


/* ==========================================================================
   Edit Invitation Page
========================================================================== */

export default async function EditInvitationPage({
  params,
}: EditInvitationPageProps) {
  const {
    locale,
    invitationId,
  } =
    await params;

  const editorData =
    await getEventExperienceEditorData(
      invitationId
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


  /* ==========================================================================
     Photo Wall
  ========================================================================== */

  const photoWallPhotos =
    experience.type ===
      "photo-wall"
      ? await getPhotoWallPhotos(
          experience.id
        )
      : undefined;


  /* ==========================================================================
     Render Data
  ========================================================================== */

  const baseData =
    buildEventExperienceRenderData({
      experience,

      locale,

      eventTimezone:
        event.timezone,
    });

  const data = {
    ...baseData,

    photoWall:
      photoWallPhotos
        ? {
            photos:
              photoWallPhotos,
          }
        : undefined,
  };


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