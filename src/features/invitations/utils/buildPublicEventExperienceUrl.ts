import type {
  Locale,
} from "@/i18n/config";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Build Public Event Experience URL
========================================================================== */

export function buildPublicEventExperienceUrl(
  locale:
    Locale,

  type:
    EventExperienceType,

  publicId:
    string
) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (
    !appUrl
  ) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  const baseUrl =
    appUrl.replace(
      /\/$/,
      ""
    );

  return `${baseUrl}/${locale}/${type}/${publicId}`;
}