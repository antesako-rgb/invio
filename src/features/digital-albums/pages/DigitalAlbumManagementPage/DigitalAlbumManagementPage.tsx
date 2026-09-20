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

import DigitalAlbumPublicLinkCard
  from "@/features/digital-albums/components/album-management/DigitalAlbumPublicLinkCard/DigitalAlbumPublicLinkCard";

import DigitalAlbumStatusCard
  from "@/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusCard";

import {
  getDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getDigitalAlbum";

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

  if (
    !album
  ) {
    notFound();
  }


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
            Danger Zone
        ================================================================== */}

        <DigitalAlbumDeleteDangerZone
          albumId={
            album.id
          }
          eventId={
            album.event_id
          }
        />
      </Page>
    </Container>
  );
}