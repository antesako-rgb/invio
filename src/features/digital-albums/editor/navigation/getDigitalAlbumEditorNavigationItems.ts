import {
  Images,
  LayoutTemplate,
  Palette,
} from "lucide-react";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorNavigationTranslations {
  (
    key:
      | "navigation.photos"
      | "navigation.pages"
      | "navigation.design"
  ):
    string;
}


/* ==========================================================================
   Digital Album Editor Navigation Items
========================================================================== */

export function getDigitalAlbumEditorNavigationItems(
  t:
    DigitalAlbumEditorNavigationTranslations
) {
  return [
    {
      id:
        "photos",

      href:
        "#photos",

      label:
        t(
          "navigation.photos"
        ),

      icon:
        Images,
    },

    {
      id:
        "pages",

      href:
        "#pages",

      label:
        t(
          "navigation.pages"
        ),

      icon:
        LayoutTemplate,
    },

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
  ];
}