import {
  notFound,
} from "next/navigation";

import PhotoWallOverviewPage
  from "@/features/photo-walls/pages/PhotoWallOverviewPage/PhotoWallOverviewPage";

import {
  getProjectPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";


export default async function ProjectPhotoWallPage({
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
    <PhotoWallOverviewPage
      photoWallId={
        photoWall.id
      }
    />
  );
}