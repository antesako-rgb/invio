import {
  notFound,
} from "next/navigation";

import PhotoWallMaterialsPage
  from "@/features/photo-walls/pages/PhotoWallMaterialsPage/PhotoWallMaterialsPage";

import {
  getEventPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getEventPhotoWall";


/* ==========================================================================
   Event Photo Wall Materials Page
========================================================================== */

export default async function EventPhotoWallMaterialsPage({
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
    <PhotoWallMaterialsPage
      photoWallId={
        photoWall.id
      }
    />
  );
}