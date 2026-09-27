import {
  getTranslations,
} from "next-intl/server";

import type {
  PhotoWall,
} from "@/features/photo-walls/types/photoWall.types";

import {
  getPhotoWallPublicPath,
} from "@/features/photo-walls/utils/getPhotoWallPublicPath";

import ManagementPublicLinkCard
  from "@/features/management/components/ManagementPublicLinkCard/ManagementPublicLinkCard";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPublicLinkCardProps {
  wall:
    PhotoWall;
}


/* ==========================================================================
   Photo Wall Public Link Card
========================================================================== */

export default async function PhotoWallPublicLinkCard({
  wall,
}: PhotoWallPublicLinkCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "PhotoWalls.management.publicLinkCard"
    );


  /* ==========================================================================
     Photo Wall
  ========================================================================== */

  const productKey =
    "photo-wall";


  /* ==========================================================================
     Public Path
  ========================================================================== */

const publicPath =
  getPhotoWallPublicPath(
    wall.public_id
  );


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    wall.is_public;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementPublicLinkCard
      title={
        t(
          "title"
        )
      }
      description={
        t(
          `description.${productKey}`
        )
      }
      publicPath={
        publicPath
      }
      isActive={
        isPublished
      }
      activeTitle={
        t(
          "active.title"
        )
      }
      inactiveTitle={
        t(
          "inactive.title"
        )
      }
      activeDescription={
        t(
          `active.description.${productKey}`
        )
      }
      inactiveDescription={
        t(
          `inactive.description.${productKey}`
        )
      }
      copyLabel={
        t(
          "actions.copy"
        )
      }
      copiedLabel={
        t(
          "actions.copied"
        )
      }
      openLabel={
        t(
          `actions.open.${productKey}`
        )
      }
    />
  );
}