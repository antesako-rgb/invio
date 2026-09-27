import {
  notFound,
} from "next/navigation";

import PhotoWallMaterials
  from "@/features/photo-walls/components/PhotoWallMaterials/PhotoWallMaterials";

import {
  getPhotoWallManagementPageData,
} from "@/features/photo-walls/repositories/photo-wall/getPhotoWallManagementPageData";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallMaterialsPageProps {
  photoWallId:
    string;
}


/* ==========================================================================
   Photo Wall Materials Page
========================================================================== */

export default async function PhotoWallMaterialsPage({
  photoWallId,
}: PhotoWallMaterialsPageProps) {
  const data =
    await getPhotoWallManagementPageData(
      photoWallId
    );

  if (!data) {
    notFound();
  }

  return (
    <PhotoWallMaterials
      photoWall={
        data.photoWall
      }
    />
  );
}