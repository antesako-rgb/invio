import {
  getTranslations,
} from "next-intl/server";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import ManagementHeader
  from "@/features/management/components/ManagementHeader/ManagementHeader";

import ManagementStatusBadge
  from "@/features/management/components/ManagementStatusBadge/ManagementStatusBadge";

import PhotoWallNameEdit
  from "@/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallNameEdit/PhotoWallNameEdit";

import type {
  PhotoWall,
} from "@/features/photo-walls/types/photoWall.types";

import {
  getPhotoWallPublicPath,
} from "@/features/photo-walls/utils/getPhotoWallPublicPath";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallManagementHeaderProps {
  photoWall:
    PhotoWall;
}


/* ==========================================================================
   Photo Wall Management Header
========================================================================== */

export default async function PhotoWallManagementHeader({
  photoWall,
}: PhotoWallManagementHeaderProps) {
  const t =
    await getTranslations(
      "PhotoWalls.management"
    );

  return (
    <ManagementHeader
      heading={
        <PhotoWallNameEdit
          photoWallId={
            photoWall.id
          }
          name={
            photoWall.name
          }
          appearance={
            photoWall.appearance
          }
        />
      }
      status={
        <ManagementStatusBadge
          isPublished={
            photoWall.is_public
          }
          publishedLabel={
            t(
              "status.published"
            )
          }
          draftLabel={
            t(
              "status.draft"
            )
          }
        />
      }
      actions={
        photoWall.is_public
          ? (
              <ButtonLink
                href={
                  getPhotoWallPublicPath(
                    photoWall.public_id
                  )
                }
                variant="outline"
              >
                {t(
                  "actions.view"
                )}
              </ButtonLink>
            )
          : undefined
      }
    />
  );
}