import {
  notFound,
} from "next/navigation";

import {
  getTranslations,
} from "next-intl/server";

import Container
  from "@/components/layout/Container/Container";

import Page
  from "@/components/layout/PageContainer/Page";

import BackLink
  from "@/components/ui/back-link/BackLink";

import EventHeader
  from "@/features/events/components/EventWorkspace/EventHeader/EventHeader";

import EventNavigation
  from "@/features/events/components/EventWorkspace/EventNavigation/EventNavigation";

import {
  getEvent,
} from "@/features/events/repositories/getEvent";


/* ==========================================================================
   Types
========================================================================== */

interface EventLayoutProps {
  children:
    React.ReactNode;

  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Event Layout
========================================================================== */

export default async function EventLayout({
  children,
  params,
}: EventLayoutProps) {
  const {
    eventId,
  } =
    await params;

  const t =
    await getTranslations(
      "Events"
    );


  /* ==========================================================================
     Event
  ========================================================================== */

  const event =
    await getEvent(
      eventId
    );

  if (!event) {
    notFound();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <BackLink
          href="/dashboard/dogadaji"
          label={
            t(
              "backToEvents"
            )
          }
        />

        <EventHeader
          event={
            event
          }
        />

        <EventNavigation
          eventId={
            event.id
          }
        />

        {children}
      </Page>
    </Container>
  );
}