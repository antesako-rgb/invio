import {
  notFound,
} from "next/navigation";

import PhotoWallOverviewPage
  from "@/features/photo-walls/pages/PhotoWallOverviewPage/PhotoWallOverviewPage";

import {
  getEventPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getEventPhotoWall";


export default async function EventPhotoWallPage({
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
    <PhotoWallOverviewPage
      photoWallId={
        photoWall.id
      }
    />
  );
}