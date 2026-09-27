import {
  notFound,
} from "next/navigation";

import {
  getTranslations,
} from "next-intl/server";

import PageHeader
  from "@/components/ui/page-header/PageHeader";

import PhotoWallSettingsAppearance
  from "@/features/photo-walls/components/settings/PhotoWallSettingsAppearance/PhotoWallSettingsAppearance";

import PhotoWallStatusCard
  from "@/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusCard";

import {
  getPhotoWallManagementPageData,
} from "@/features/photo-walls/repositories/photo-wall/getPhotoWallManagementPageData";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallSettingsPageProps {
  photoWallId:
    string;
}


/* ==========================================================================
   Photo Wall Settings Page
========================================================================== */

export default async function PhotoWallSettingsPage({
  photoWallId,
}: PhotoWallSettingsPageProps) {
  const data =
    await getPhotoWallManagementPageData(
      photoWallId
    );

  if (!data) {
    notFound();
  }

  const t =
    await getTranslations(
      "PhotoWalls.productSettings"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <PageHeader
        title={
          t(
            "title"
          )
        }
        description={
          t(
            "description"
          )
        }
      />

      <PhotoWallStatusCard
        wall={
          data.photoWall
        }
        canPublish={
          data.isOwner
        }
      />

      <PhotoWallSettingsAppearance
        photoWall={
          data.photoWall
        }
      />
    </>
  );
}