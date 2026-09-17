import NewInvitationPage
  from "@/features/invitations/pages/NewInvitationPage/NewInvitationPage";


/* ==========================================================================
   Types
========================================================================== */

interface NewInvitationRoutePageProps {
  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   New Invitation Route Page
========================================================================== */

export default async function NewInvitationRoutePage({
  params,
}: NewInvitationRoutePageProps) {
  const {
    eventId,
  } =
    await params;

  return (
    <NewInvitationPage
      eventId={
        eventId
      }
    />
  );
}