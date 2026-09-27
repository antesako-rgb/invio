import {
  notFound,
} from "next/navigation";

import PhotoWallManagement
  from "@/features/photo-walls/components/photo-wall-management/PhotoWallManagement";

import {
  getPhotoWallManagementPageData,
} from "@/features/photo-walls/repositories/photo-wall/getPhotoWallManagementPageData";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotosPageProps {
  photoWallId:
    string;
}


/* ==========================================================================
   Photo Wall Photos Page
========================================================================== */

export default async function PhotoWallPhotosPage({
  photoWallId,
}: PhotoWallPhotosPageProps) {
  const data =
    await getPhotoWallManagementPageData(
      photoWallId
    );

  if (!data) {
    notFound();
  }

  return (
    <PhotoWallManagement
      wall={
        data.photoWall
      }
    />
  );
}