import Container from "@/components/layout/Container/Container";

import Page from "@/components/layout/PageContainer/Page";

import {
  getEvents,
} from "@/features/events/repositories/getEvents";

import DashboardBrandMessage from "../../components/DashboardBrandMessage/DashboardBrandMessage";

import DashboardEvents from "../../components/DashboardEvents/DashboardEvents";

import DashboardInvites from "../../components/DashboardInvites/DashboardInvites";

import DashboardProductsIntro from "../../components/DashboardProductsIntro/DashboardProductsIntro";

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
  const events =
    await getEvents();

  return (
    <Container>
      <Page>
        <DashboardWelcome
          firstName={
            firstName
          }
        />

        <DashboardInvites />

        <DashboardEvents
          events={
            events
          }
        />

        {events.length === 0 && (
          <DashboardProductsIntro />
        )}

        <DashboardBrandMessage />
      </Page>
    </Container>
  );
}