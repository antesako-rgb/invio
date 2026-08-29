import EventInvitationsPage
  from "@/features/invitations/pages/EventInvitationsPage/EventInvitationsPage";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationPageProps {
  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Invitation Page
========================================================================== */

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  const {
    eventId,
  } =
    await params;

  return (
    <EventInvitationsPage
      eventId={
        eventId
      }
    />
  );
}