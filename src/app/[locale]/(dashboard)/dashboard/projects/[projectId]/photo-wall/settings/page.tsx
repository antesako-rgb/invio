import {
  notFound,
} from "next/navigation";

import PhotoWallSettingsPage
  from "@/features/photo-walls/pages/PhotoWallSettingsPage/PhotoWallSettingsPage";

import {
  getProjectPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";


/* ==========================================================================
   Project Photo Wall Settings Page
========================================================================== */

export default async function ProjectPhotoWallSettingsPage({
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
    <PhotoWallSettingsPage
      photoWallId={
        photoWall.id
      }
    />
  );
}