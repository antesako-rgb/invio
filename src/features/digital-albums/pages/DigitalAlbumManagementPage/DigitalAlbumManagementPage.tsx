import Container
  from "@/components/layout/Container/Container";

import Page
  from "@/components/layout/PageContainer/Page";

import EventProductContext
  from "@/features/events/components/EventWorkspace/EventProductContext/EventProductContext";

import DigitalAlbumManagementHeader
  from "@/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumManagementHeader";

import DigitalAlbumPublicLinkCard
  from "@/features/digital-albums/components/album-management/DigitalAlbumPublicLinkCard/DigitalAlbumPublicLinkCard";

import DigitalAlbumStatusCard
  from "@/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusCard";

import type {
  DigitalAlbum,
} from "@/features/digital-albums/types/digitalAlbum.types";

import styles
  from "./DigitalAlbumManagementPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumManagementPageProps {
  album:
    DigitalAlbum;
}


/* ==========================================================================
   Digital Album Management Page
========================================================================== */

export default function DigitalAlbumManagementPage({
  album,
}: DigitalAlbumManagementPageProps) {

  return (
    <Container>
      <Page>
        <EventProductContext
          eventId={
            album.event_id
          }
        />


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
      </Page>
    </Container>
  );

}