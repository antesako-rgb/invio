import {
  notFound,
} from "next/navigation";

import PhotoWallExperience
  from "@/features/photo-walls/components/photo-wall-experience/PhotoWallExperience";

import {
  getPublicPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getPublicPhotoWall";

import {
  getPublicPhotoWallPhotos,
} from "@/features/photo-walls/repositories/photos/getPublicPhotoWallPhotos";

import {
  buildPhotoWallGalleryPhotos,
} from "@/features/photo-walls/renderer/data/buildPhotoWallGalleryPhotos";

import {
  formatProjectEventDate,
} from "@/features/projects/utils/projectEventDisplay.utils";


/* ==========================================================================
   Public Photo Wall Page
========================================================================== */

export default async function PublicPhotoWallPage({
  params,
}: {
  params:
    Promise<{
      publicId:
        string;

      locale:
        string;
    }>;
}) {
  const {
    publicId,
    locale,
  } =
    await params;

  const photoWall =
    await getPublicPhotoWall(
      publicId
    );

  if (
    !photoWall
  ) {
    notFound();
  }

  const page =
    await getPublicPhotoWallPhotos({
      publicId,
    });

  return (
    <PhotoWallExperience
      publicId={
        publicId
      }
      eventName={
        photoWall.project_name
      }
      date={
        photoWall.event_start_date
          ? formatProjectEventDate(
              photoWall.event_start_date,
              locale
            )
          : null
      }
      appearance={
        photoWall.appearance
      }
      photos={
        buildPhotoWallGalleryPhotos(
          page.photos
        )
      }
      nextCursor={
        page.nextCursor
      }
    />
  );
}