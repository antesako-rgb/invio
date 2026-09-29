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

import ProjectProductContext
  from "@/features/projects/components/ProjectProductContext/ProjectProductContext";

import PhotoWallNavigation
  from "@/features/photo-walls/components/PhotoWallNavigation/PhotoWallNavigation";

import PhotoWallManagementHeader
  from "@/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallManagementHeader";

import {
  getProjectPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getProjectPhotoWall";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallLayoutProps {
  children:
    ReactNode;

  params:
    Promise<{
      projectId:
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
    projectId,
  } =
    await params;

  const photoWall =
    await getProjectPhotoWall(
      projectId
    );

  if (!photoWall) {
    notFound();
  }

  return (
    <Container>
      <Page>
        <ProjectProductContext
          projectId={
            projectId
          }
        />

        <PhotoWallManagementHeader
          photoWall={
            photoWall
          }
        />

        <PhotoWallNavigation
          projectId={
            projectId
          }
        />

        {children}
      </Page>
    </Container>
  );
}