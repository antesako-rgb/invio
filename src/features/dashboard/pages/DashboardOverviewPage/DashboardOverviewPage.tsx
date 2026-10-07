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

import styles from "./DashboardOverviewPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardOverviewPageProps {
  firstName?: string | null;
  view?: "overview" | "projects";
}


/* ==========================================================================
   Dashboard Overview Page
========================================================================== */

export default async function DashboardOverviewPage({
  firstName,
  view = "overview",
}: DashboardOverviewPageProps) {
  const projects =
    await getProjects();

  return (
    <Container className={styles.container}>
      <Page className={styles.page}>
        {view === "overview" && <DashboardInvites />}
        {projects.length === 0 ? (
          <DashboardOnboarding />
        ) : (
          <>
            {view === "overview" && (
              <>
                <DashboardWelcome firstName={firstName} />
              </>
            )}
            <DashboardProjects projects={projects} limit={view === "overview" ? 3 : null} />
          </>
        )}

        <footer className={styles.footer}>
          <DashboardBrandMessage />
        </footer>
      </Page>
    </Container>
  );
}
