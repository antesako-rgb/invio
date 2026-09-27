import Container from "@/components/layout/Container/Container";

import Page from "@/components/layout/PageContainer/Page";

import DashboardBrandMessage from "@/features/dashboard/components/DashboardBrandMessage/DashboardBrandMessage";

import DashboardEvents from "@/features/dashboard/components/DashboardEvents/DashboardEvents";

import DashboardProductsIntro from "@/features/dashboard/components/DashboardProductsIntro/DashboardProductsIntro";

import {
  getEvents,
} from "@/features/events/repositories/getEvents";


/* ==========================================================================
   Events Page
========================================================================== */

export default async function EventsPage() {
  const events =
    await getEvents();

  return (
    <Container>
      <Page>
        <DashboardEvents
          events={
            events
          }
          limit={
            null
          }
        />

        {events.length === 0 && (
          <>
            <DashboardProductsIntro />

            <DashboardBrandMessage />
          </>
        )}
      </Page>
    </Container>
  );
}