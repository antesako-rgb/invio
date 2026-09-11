import {
  notFound,
} from "next/navigation";

import EventExperiencePreview
  from "@/features/invitations/preview/EventExperiencePreview";

import {
  getEventExperienceTemplateConfig,
  getEventExperienceVariantConfig,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";

import type {
  Locale,
} from "@/i18n/config";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperiencePreviewPageProps {
  params:
    Promise<{
      locale:
        Locale;

      type:
        EventExperienceType;

      templateId:
        string;

      variantId:
        string;
    }>;
}


/* ==========================================================================
   Event Experience Preview Page
========================================================================== */

export default async function EventExperiencePreviewPage({
  params,
}: EventExperiencePreviewPageProps) {
  const {
    locale,
    type,
    templateId,
    variantId,
  } =
    await params;

  const template =
    getEventExperienceTemplateConfig(
      type,
      templateId
    );

  if (
    !template
  ) {
    notFound();
  }

  const variant =
    getEventExperienceVariantConfig(
      type,
      templateId,
      variantId
    );

  if (
    !variant
  ) {
    notFound();
  }

  return (
    <EventExperiencePreview
      type={
        type
      }
      templateId={
        templateId
      }
      variantId={
        variantId
      }
      locale={
        locale
      }
    />
  );
}