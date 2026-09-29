import Container from "@/components/layout/Container/Container";

import Page from "@/components/layout/PageContainer/Page";

import {
  getProjects,
} from "@/features/projects/repositories/getProjects";

import DashboardBrandMessage from "../../components/DashboardBrandMessage/DashboardBrandMessage";

import DashboardProjects from "../../components/DashboardProjects/DashboardProjects";

import DashboardInvites from "../../components/DashboardInvites/DashboardInvites";

import DashboardOnboarding from "../../components/DashboardOnboarding/DashboardOnboarding";

import DashboardWelcome from "../../components/DashboardWelcome/DashboardWelcome";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardOverviewPageProps {
  firstName?: string | null;
}


/* ==========================================================================
   Dashboard Overview Page
========================================================================== */

export default async function DashboardOverviewPage({
  firstName,
}: DashboardOverviewPageProps) {
  const projects =
    await getProjects();

  return (
    <Container>
      <Page>
        {projects.length === 0 ? (
          <>
            <DashboardOnboarding />
            <DashboardInvites />
          </>
        ) : (
          <>
            <DashboardWelcome firstName={firstName} />
            <DashboardInvites />
            <DashboardProjects projects={projects} />
            <DashboardBrandMessage />
          </>
        )}
      </Page>
    </Container>
  );
}