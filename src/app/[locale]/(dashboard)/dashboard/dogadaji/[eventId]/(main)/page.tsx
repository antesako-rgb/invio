import EventPage
  from "@/features/events/pages/EventPage/EventPage";

import {
  getEventGuests,
} from "@/features/guests/repositories/getEventGuests";


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
     Guests
  ========================================================================== */

  const guests =
    await getEventGuests(
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