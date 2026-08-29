import {
  notFound,
} from "next/navigation";

import {
  getEvent,
} from "@/features/events/repositories/getEvent";

import EditEventPage from "@/features/events/pages/EditEventPage/EditEventPage";


/* ==========================================================================
   Types
========================================================================== */

interface EditEventRouteProps {
  params:
    Promise<{
      eventId: string;
    }>;
}


/* ==========================================================================
   Edit Event Route
========================================================================== */

export default async function EditEventRoute({
  params,
}: EditEventRouteProps) {
  const {
    eventId,
  } =
    await params;


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
    <EditEventPage
      event={event}
    />
  );
}