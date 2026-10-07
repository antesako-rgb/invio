import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getPhotoWall";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import ProjectProductContext from "@/features/projects/components/ProjectProductContext/ProjectProductContext";
import PhotoWallManagementHeader from "@/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallManagementHeader";
import PhotoWallNavigation from "@/features/photo-walls/components/PhotoWallNavigation/PhotoWallNavigation";
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ photoWallId: string }> }) {
 const photoWall = await getPhotoWall((await params).photoWallId);
 if (!photoWall) notFound();
 return <Container><Page>
   <ProjectProductContext projectId={photoWall.project_id} product="photo-wall" />
   <PhotoWallManagementHeader photoWall={photoWall} /><PhotoWallNavigation photoWallId={photoWall.id} />{children}
 </Page></Container>;
}
