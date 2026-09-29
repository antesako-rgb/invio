import {
  notFound,
} from "next/navigation";

import PhotoWallPhotosPage
  from "@/features/photo-walls/pages/PhotoWallPhotosPage/PhotoWallPhotosPage";

import {
  getProjectPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";


export default async function ProjectPhotoWallPhotosPage({
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
    <PhotoWallPhotosPage
      photoWallId={
        photoWall.id
      }
    />
  );
}