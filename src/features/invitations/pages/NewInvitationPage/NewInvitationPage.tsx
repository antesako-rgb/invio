import Page
  from "@/components/layout/PageContainer/Page";

import InvitationTemplatePicker
  from "@/features/invitations/components/template-picker/InvitationTemplatePicker/InvitationTemplatePicker";

import {
  getEvent,
} from "@/features/events/repositories/getEvent";

import {
  getEventInvitations,
} from "@/features/invitations/repositories/getEventInvitations";


/* ==========================================================================
   Types
========================================================================== */

interface NewInvitationPageProps {
  eventId:
    string;
}


/* ==========================================================================
   New Invitation Page
========================================================================== */

export default async function NewInvitationPage({
  eventId,
}: NewInvitationPageProps) {
  /* ==========================================================================
     Data
  ========================================================================== */

  const [
    event,
    invitations,
  ] =
    await Promise.all([
      getEvent(
        eventId
      ),
      getEventInvitations(
        eventId
      ),
    ]);

  if (!event) {
    return null;
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Page>
      {/* PageHeader ide ovdje */}

      <InvitationTemplatePicker
        eventId={
          eventId
        }
        event={
          event
        }
        invitations={
          invitations
        }
      />
    </Page>
  );
}