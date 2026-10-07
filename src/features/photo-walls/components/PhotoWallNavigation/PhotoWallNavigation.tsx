import {
  getTranslations,
} from "next-intl/server";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallNavigationProps {
  photoWallId:
    string;
}


/* ==========================================================================
   Photo Wall Navigation
========================================================================== */

export default async function PhotoWallNavigation({
  photoWallId,
}: PhotoWallNavigationProps) {
  const t =
    await getTranslations(
      "PhotoWalls.productNavigation"
    );

  const base =
    `/dashboard/photo-walls/${photoWallId}`;

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
        `${base}/photos`,
    },
    {
      id:
        "materials",

      label:
        t(
          "materials"
        ),

      href:
        `${base}/materials`,
    },
    {
      id:
        "settings",

      label:
        t(
          "settings"
        ),

      href:
        `${base}/settings`,
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