import Container from "@/components/layout/Container/Container";

import Page from "@/components/layout/PageContainer/Page";

import DashboardBrandMessage from "@/features/dashboard/components/DashboardBrandMessage/DashboardBrandMessage";

import DashboardProjects from "@/features/dashboard/components/DashboardProjects/DashboardProjects";

import DashboardProductsIntro from "@/features/dashboard/components/DashboardProductsIntro/DashboardProductsIntro";

import {
  getProjects,
} from "@/features/projects/repositories/getProjects";


/* ==========================================================================
   Projects Page
========================================================================== */

export default async function ProjectsPage() {
  const projects =
    await getProjects();

  return (
    <Container>
      <Page>
        <DashboardProjects
          projects={
            projects
          }
          limit={
            null
          }
        />

        {projects.length === 0 && (
          <>
            <DashboardProductsIntro />

            <DashboardBrandMessage />
          </>
        )}
      </Page>
    </Container>
  );
}