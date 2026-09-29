import {
  notFound,
} from "next/navigation";

import PhotoWallMaterialsPage
  from "@/features/photo-walls/pages/PhotoWallMaterialsPage/PhotoWallMaterialsPage";

import {
  getProjectPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";


/* ==========================================================================
   Project Photo Wall Materials Page
========================================================================== */

export default async function ProjectPhotoWallMaterialsPage({
  params,
}: {
  params:
    Promise<{
      projectId:
        string;
    }>;
}) {
  const {
    projectId,
  } =
    await params;

  const photoWall =
    await getProjectPhotoWall(
      projectId
    );

  if (!photoWall) {
    notFound();
  }

  return (
    <PhotoWallMaterialsPage
      photoWallId={
        photoWall.id
      }
    />
  );
}