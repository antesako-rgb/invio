import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Helpers
========================================================================== */

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}


/* ==========================================================================
   Parse Event Experience Presentation
========================================================================== */

export function parseEventExperiencePresentation(
  presentation: Json
): EventExperiencePresentation {
  const value =
    isRecord(
      presentation
    )
      ? presentation
      : {};

  const layout =
    isRecord(
      value.layout
    )
      ? value.layout
      : {};

  const background =
    isRecord(
      layout.background
    )
      ? layout.background
      : {};

  const elements =
    isRecord(
      value.elements
    )
      ? value.elements
      : {};

  const parsedElements:
    EventExperiencePresentation["elements"] = {};

  for (
    const [
      key,
      element,
    ] of Object.entries(
      elements
    )
  ) {
    if (
      !isRecord(
        element
      )
    ) {
      continue;
    }

    parsedElements[key] = {
      font_family:
        typeof element.font_family ===
          "string"
          ? element.font_family
          : undefined,

      font_scale:
        typeof element.font_scale ===
          "number"
          ? element.font_scale
          : undefined,

      color:
        typeof element.color ===
          "string"
          ? element.color
          : undefined,

      font_style:
        element.font_style ===
          "normal" ||
        element.font_style ===
          "italic"
          ? element.font_style
          : undefined,

      font_weight:
        typeof element.font_weight ===
          "number"
          ? element.font_weight
          : undefined,

      text_align:
        element.text_align ===
          "left" ||
        element.text_align ===
          "center" ||
        element.text_align ===
          "right"
          ? element.text_align
          : undefined,
    };
  }

  return {
    layout: {
      background: {
        color:
          typeof background.color ===
            "string"
            ? background.color
            : undefined,

        image_url:
          typeof background.image_url ===
            "string" ||
          background.image_url ===
            null
            ? background.image_url
            : undefined,

        opacity:
          typeof background.opacity ===
            "number"
            ? background.opacity
            : undefined,
      },
    },

    elements:
      parsedElements,
  };
}