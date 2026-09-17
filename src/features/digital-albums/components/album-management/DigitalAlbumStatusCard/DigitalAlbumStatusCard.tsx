import {
  getTranslations,
} from "next-intl/server";

import DigitalAlbumStatusAction
  from "@/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusAction";

import type {
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";

import ManagementStatusCard
  from "@/features/management/components/ManagementStatusCard/ManagementStatusCard";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumStatusCardProps {
  album:
    DigitalAlbum;
}


/* ==========================================================================
   Digital Album Status Card
========================================================================== */

export default async function DigitalAlbumStatusCard({
  album,
}: DigitalAlbumStatusCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "DigitalAlbums.management.statusCard"
    );


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    album.is_public;

  const statusTitle =
    isPublished
      ? t(
          "published.title"
        )
      : t(
          "draft.title"
        );

  const statusDescription =
    isPublished
      ? t(
          "published.description"
        )
      : t(
          "draft.description"
        );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementStatusCard
      title={
        t(
          "title"
        )
      }
      description={
        t(
          "description"
        )
      }
      statusTitle={
        statusTitle
      }
      statusDescription={
        statusDescription
      }
      isPublished={
        isPublished
      }
      action={
        <DigitalAlbumStatusAction
          albumId={
            album.id
          }
          isPublished={
            isPublished
          }
        />
      }
    />
  );
}