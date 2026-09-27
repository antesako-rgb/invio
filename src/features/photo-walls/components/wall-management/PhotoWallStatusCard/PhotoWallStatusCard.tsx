import {
  getTranslations,
} from "next-intl/server";

import PhotoWallStatusAction
  from "@/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusAction";

import type {
  PhotoWall,
} from "@/features/photo-walls/types/photoWall.types";

import ManagementStatusCard
  from "@/features/management/components/ManagementStatusCard/ManagementStatusCard";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallStatusCardProps {
  canPublish: boolean;
  wall:
    PhotoWall;
}


/* ==========================================================================
   Photo Wall Status Card
========================================================================== */

export default async function PhotoWallStatusCard({
  wall,
  canPublish,
}: PhotoWallStatusCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "PhotoWalls.management.statusCard"
    );


  /* ==========================================================================
     Photo Wall
  ========================================================================== */

  const productKey =
    "photo-wall";


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    wall.is_public;

  const statusTitle =
    isPublished
      ? t(
          `published.title.${productKey}`
        )
      : t(
          `draft.title.${productKey}`
        );

  const statusDescription =
    isPublished
      ? t(
          `published.description.${productKey}`
        )
      : t(
          `draft.description.${productKey}`
        );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementStatusCard
      title={
        t(
          `title.${productKey}`
        )
      }
      description={
        t(
          `description.${productKey}`
        )
      }
      statusTitle={
        statusTitle
      }
      statusDescription={
        statusDescription
      }
      isPublished={
        isPublished
      }
      action={
        canPublish ? <PhotoWallStatusAction
          photoWallId={
            wall.id
          }
          isPublished={
            isPublished
          }
        /> : undefined
      }
    />
  );
}