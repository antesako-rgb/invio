import {
  getTranslations,
} from "next-intl/server";

import type {
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";

import {
  getDigitalAlbumPublicPath,
} from "@/features/digital-albums/utils/getDigitalAlbumPublicPath";

import ManagementPublicLinkCard
  from "@/features/management/components/ManagementPublicLinkCard/ManagementPublicLinkCard";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPublicLinkCardProps {
  album:
    DigitalAlbum;
}


/* ==========================================================================
   Digital Album Public Link Card
========================================================================== */

export default async function DigitalAlbumPublicLinkCard({
  album,
}: DigitalAlbumPublicLinkCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "DigitalAlbums.management.publicLinkCard"
    );


  /* ==========================================================================
     Public Path
  ========================================================================== */

  const publicPath =
    getDigitalAlbumPublicPath(
      album.public_id
    );


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    album.is_public;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementPublicLinkCard
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
      publicPath={
        publicPath
      }
      isActive={
        isPublished
      }
      activeTitle={
        t(
          "active.title"
        )
      }
      inactiveTitle={
        t(
          "inactive.title"
        )
      }
      activeDescription={
        t(
          "active.description"
        )
      }
      inactiveDescription={
        t(
          "inactive.description"
        )
      }
      copyLabel={
        t(
          "actions.copy"
        )
      }
      copiedLabel={
        t(
          "actions.copied"
        )
      }
      openLabel={
        t(
          "actions.open"
        )
      }
    />
  );
}