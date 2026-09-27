import {
  notFound,
} from "next/navigation";

import PhotoWallPublicLinkCard
  from "@/features/photo-walls/components/wall-management/PhotoWallPublicLinkCard/PhotoWallPublicLinkCard";

import PhotoWallStatusCard
  from "@/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusCard";

import {
  getPhotoWallManagementPageData,
} from "@/features/photo-walls/repositories/photo-wall/getPhotoWallManagementPageData";

import styles
  from "./PhotoWallOverviewPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallOverviewPageProps {
  photoWallId:
    string;
}


/* ==========================================================================
   Photo Wall Overview Page
========================================================================== */

export default async function PhotoWallOverviewPage({
  photoWallId,
}: PhotoWallOverviewPageProps) {
  const data =
    await getPhotoWallManagementPageData(
      photoWallId
    );

  if (!data) {
    notFound();
  }

  const {
    photoWall,
    isOwner,
  } =
    data;

  return (
    <div
      className={
        styles.overview
      }
    >
      <PhotoWallStatusCard
        wall={
          photoWall
        }
        canPublish={
          isOwner
        }
      />

      <PhotoWallPublicLinkCard
        wall={
          photoWall
        }
      />
    </div>
  );
}