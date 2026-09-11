import Page
  from "@/components/layout/PageContainer/Page";

import {
  getEvent,
} from "@/features/events/repositories/getEvent";

import EventExperienceTemplatePicker
  from "@/features/invitations/components/template-picker/EventExperienceTemplatePicker/EventExperienceTemplatePicker";

import {
  getEventExperiences,
} from "@/features/invitations/repositories/experience/getEventExperiences";


/* ==========================================================================
   Types
========================================================================== */

interface NewEventExperiencePageProps {
  eventId:
    string;
}


/* ==========================================================================
   New Event Experience Page
========================================================================== */

export default async function NewEventExperiencePage({
  eventId,
}: NewEventExperiencePageProps) {
  /* ==========================================================================
     Data
  ========================================================================== */

  const [
    event,
    experiences,
  ] =
    await Promise.all([
      getEvent(
        eventId
      ),
      getEventExperiences(
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

      <EventExperienceTemplatePicker
        eventId={
          eventId
        }
        event={
          event
        }
        experiences={
          experiences
        }
      />
    </Page>
  );
}