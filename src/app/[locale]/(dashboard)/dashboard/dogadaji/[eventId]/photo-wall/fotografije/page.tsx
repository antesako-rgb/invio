import {
  notFound,
} from "next/navigation";

import PhotoWallPhotosPage
  from "@/features/photo-walls/pages/PhotoWallPhotosPage/PhotoWallPhotosPage";

import {
  getEventPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getEventPhotoWall";


export default async function EventPhotoWallPhotosPage({
  params,
}: {
  params:
    Promise<{
      eventId:
        string;
    }>;
}) {
  const {
    eventId,
  } =
    await params;

  const photoWall =
    await getEventPhotoWall(
      eventId
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