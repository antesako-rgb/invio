import EventStudioPage
  from "@/features/invitations/pages/EventStudioPage/EventStudioPage";


/* ==========================================================================
   Types
========================================================================== */

interface StudioPageProps {
  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Studio Page
========================================================================== */

export default async function StudioPage({
  params,
}: StudioPageProps) {
  const {
    eventId,
  } =
    await params;

  return (
    <EventStudioPage
      eventId={
        eventId
      }
    />
  );
}