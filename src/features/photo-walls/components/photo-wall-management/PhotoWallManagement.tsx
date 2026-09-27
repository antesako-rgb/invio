import PhotoWallPhotosManagement
  from "@/features/photo-walls/components/photo-wall-management/PhotoWallPhotosManagement/PhotoWallPhotosManagement";

import {
  getPhotoWallPhotosPage,
} from "@/features/photo-walls/repositories/photos/getPhotoWallPhotosPage";

import type {
  PhotoWall,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallManagementProps {
  wall:
    PhotoWall;
}


/* ==========================================================================
   Photo Wall Management
========================================================================== */

export default async function PhotoWallManagement({
  wall,
}: PhotoWallManagementProps) {
  /* ==========================================================================
     Photos
  ========================================================================== */

  const photosPage =
    await getPhotoWallPhotosPage({
      photoWallId:
        wall.id,
    });


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <PhotoWallPhotosManagement
      photoWallId={
        wall.id
      }
      photosPage={
        photosPage
      }
    />
  );
}