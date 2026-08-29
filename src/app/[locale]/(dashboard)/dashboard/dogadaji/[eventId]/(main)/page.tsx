import EventPage
  from "@/features/events/pages/EventPage/EventPage";

import {
  getEventGuestsPageData,
} from "@/features/guests/repositories/getEventGuestsPageData";


/* ==========================================================================
   Types
========================================================================== */

interface EventOverviewPageProps {
  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Event Overview Page
========================================================================== */

export default async function EventOverviewPage({
  params,
}: EventOverviewPageProps) {
  const {
    eventId,
  } =
    await params;


  /* ==========================================================================
     Guests Data
  ========================================================================== */

  const {
    guests,
  } =
    await getEventGuestsPageData(
      eventId
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EventPage
      guests={
        guests
      }
    />
  );
}