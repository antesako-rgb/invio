import EventGuestsPage
  from "@/features/guests/pages/EventGuestsPage/EventGuestsPage";

import {
  getEventGuestsPageData,
} from "@/features/guests/repositories/getEventGuestsPageData";


/* ==========================================================================
   Types
========================================================================== */

interface GuestsPageProps {
  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Guests Page
========================================================================== */

export default async function GuestsPage({
  params,
}: GuestsPageProps) {
  const {
    eventId,
  } =
    await params;


  /* ==========================================================================
     Guests Data
  ========================================================================== */

  const {
    guests,
    groups,
    rsvpInvitations,
  } =
    await getEventGuestsPageData(
      eventId
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EventGuestsPage
      eventId={
        eventId
      }
      guests={
        guests
      }
      groups={
        groups
      }
      rsvpInvitations={
        rsvpInvitations
      }
    />
  );
}