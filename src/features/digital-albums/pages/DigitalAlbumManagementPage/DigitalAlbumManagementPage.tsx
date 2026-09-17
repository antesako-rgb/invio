import {
  notFound,
} from "next/navigation";

import Container
  from "@/components/layout/Container/Container";

import Page
  from "@/components/layout/PageContainer/Page";

import DigitalAlbumDeleteDangerZone
  from "@/features/digital-albums/components/album-management/DigitalAlbumDeleteDangerZone/DigitalAlbumDeleteDangerZone";

import DigitalAlbumManagementHeader
  from "@/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumManagementHeader";

import DigitalAlbumPhotos
  from "@/features/digital-albums/components/album-management/DigitalAlbumPhotos/DigitalAlbumPhotos";

import DigitalAlbumPublicLinkCard
  from "@/features/digital-albums/components/album-management/DigitalAlbumPublicLinkCard/DigitalAlbumPublicLinkCard";

import DigitalAlbumStatusCard
  from "@/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusCard";

import {
  getDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getDigitalAlbum";

import {
  getDigitalAlbumPhotos,
} from "@/features/digital-albums/repositories/photos/getDigitalAlbumPhotos";

import styles
  from "./DigitalAlbumManagementPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumManagementPageProps {
  albumId:
    string;
}


/* ==========================================================================
   Digital Album Management Page
========================================================================== */

export default async function DigitalAlbumManagementPage({
  albumId,
}: DigitalAlbumManagementPageProps) {
  /* ==========================================================================
     Album
  ========================================================================== */

  const album =
    await getDigitalAlbum(
      albumId
    );

  if (!album) {
    notFound();
  }


  /* ==========================================================================
     Photos
  ========================================================================== */

  const photos =
    await getDigitalAlbumPhotos(
      album.id
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <DigitalAlbumManagementHeader
          album={
            album
          }
        />


        {/* ==================================================================
            Overview
        ================================================================== */}

        <div
          className={
            styles.overview
          }
        >
          <DigitalAlbumStatusCard
            album={
              album
            }
          />

          <DigitalAlbumPublicLinkCard
            album={
              album
            }
          />
        </div>


        {/* ==================================================================
            Photos
        ================================================================== */}

     <DigitalAlbumPhotos
  albumId={
    album.id
  }
  photoWallId={
    album.photo_wall_id
  }
  photos={
    photos
  }
/>

        {/* ==================================================================
            Danger Zone
        ================================================================== */}

        <DigitalAlbumDeleteDangerZone
          albumId={
            album.id
          }
          photoWallId={
            album.photo_wall_id
          }
        />
      </Page>
    </Container>
  );
}