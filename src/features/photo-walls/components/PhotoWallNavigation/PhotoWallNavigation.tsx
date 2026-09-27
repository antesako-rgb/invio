import {
  getTranslations,
} from "next-intl/server";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallNavigationProps {
  eventId:
    string;
}


/* ==========================================================================
   Photo Wall Navigation
========================================================================== */

export default async function PhotoWallNavigation({
  eventId,
}: PhotoWallNavigationProps) {
  const t =
    await getTranslations(
      "PhotoWalls.productNavigation"
    );

  const base =
    `/dashboard/dogadaji/${eventId}/photo-wall`;

  const items = [
    {
      id:
        "overview",

      label:
        t(
          "overview"
        ),

      href:
        base,

      exact:
        true,
    },
    {
      id:
        "photos",

      label:
        t(
          "photos"
        ),

      href:
        `${base}/fotografije`,
    },
    {
      id:
        "materials",

      label:
        t(
          "materials"
        ),

      href:
        `${base}/materijali`,
    },
    {
      id:
        "settings",

      label:
        t(
          "settings"
        ),

      href:
        `${base}/postavke`,
    },
  ];

  return (
    <SideNavigation
      items={
        items
      }
      variant="route"
      appearance="underline"
      ariaLabel={
        t(
          "label"
        )
      }
    />
  );
}