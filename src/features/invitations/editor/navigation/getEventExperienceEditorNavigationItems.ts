import {
  Eye,
  FileText,
  Palette,
  UserCheck,
} from "lucide-react";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorNavigationTranslations {
  (
    key:
      | "navigation.design"
      | "navigation.details"
      | "navigation.rsvp"
      | "navigation.preview"
  ):
    string;
}

interface GetEventExperienceEditorNavigationItemsOptions {
  hasDetails:
    boolean;

  hasRsvp:
    boolean;
}


/* ==========================================================================
   Event Experience Editor Navigation Items
========================================================================== */

export function getEventExperienceEditorNavigationItems(
  t:
    EventExperienceEditorNavigationTranslations,

  {
    hasDetails,
    hasRsvp,
  }:
    GetEventExperienceEditorNavigationItemsOptions
) {
  return [
    {
      id:
        "design",

      href:
        "#design",

      label:
        t(
          "navigation.design"
        ),

      icon:
        Palette,
    },

    ...(hasDetails
      ? [
          {
            id:
              "details",

            href:
              "#details",

            label:
              t(
                "navigation.details"
              ),

            icon:
              FileText,
          },
        ]
      : []),

    ...(hasRsvp
      ? [
          {
            id:
              "rsvp",

            href:
              "#rsvp",

            label:
              t(
                "navigation.rsvp"
              ),

            icon:
              UserCheck,
          },
        ]
      : []),

    {
      id:
        "preview",

      href:
        "#preview",

      label:
        t(
          "navigation.preview"
        ),

      icon:
        Eye,
    },
  ];
}