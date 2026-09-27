import {
  notFound,
} from "next/navigation";

import PhotoWallSettingsPage
  from "@/features/photo-walls/pages/PhotoWallSettingsPage/PhotoWallSettingsPage";

import {
  getEventPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getEventPhotoWall";


/* ==========================================================================
   Event Photo Wall Settings Page
========================================================================== */

export default async function EventPhotoWallSettingsPage({
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
    <PhotoWallSettingsPage
      photoWallId={
        photoWall.id
      }
    />
  );
}