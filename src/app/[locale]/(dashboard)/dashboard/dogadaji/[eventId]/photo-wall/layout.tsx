import {
  notFound,
} from "next/navigation";

import type {
  ReactNode,
} from "react";

import Container
  from "@/components/layout/Container/Container";

import Page
  from "@/components/layout/PageContainer/Page";

import EventProductContext
  from "@/features/events/components/EventWorkspace/EventProductContext/EventProductContext";

import PhotoWallNavigation
  from "@/features/photo-walls/components/PhotoWallNavigation/PhotoWallNavigation";

import PhotoWallManagementHeader
  from "@/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallManagementHeader";

import {
  getEventPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getEventPhotoWall";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallLayoutProps {
  children:
    ReactNode;

  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Photo Wall Layout
========================================================================== */

export default async function PhotoWallLayout({
  children,
  params,
}: PhotoWallLayoutProps) {
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
    <Container>
      <Page>
        <EventProductContext
          eventId={
            eventId
          }
        />

        <PhotoWallManagementHeader
          photoWall={
            photoWall
          }
        />

        <PhotoWallNavigation
          eventId={
            eventId
          }
        />

        {children}
      </Page>
    </Container>
  );
}