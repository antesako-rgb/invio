import type {
  Locale,
} from "./config";


/* ==========================================================================
   Load Messages
========================================================================== */

export async function loadMessages(
  locale: Locale
) {
  const [
    common,
    footer,
    auth,
    navigation,
    dashboard,
    events,
    guests,
    eventExperiences,
    eventExperiencesManagement,
    invitations,
    invitationManagement,
    eventExperienceContent,
    eventExperienceTemplates,
  ] =
    await Promise.all([
      import(
        `../messages/${locale}/common.json`
      ),

      import(
        `../messages/${locale}/footer.json`
      ),

      import(
        `../messages/${locale}/auth.json`
      ),

      import(
        `../messages/${locale}/navigation.json`
      ),

      import(
        `../messages/${locale}/dashboard.json`
      ),

      import(
        `../messages/${locale}/events.json`
      ),

      import(
        `../messages/${locale}/guests.json`
      ),

      import(
        `../messages/${locale}/event-experiences.json`
      ),

      import(
        `../messages/${locale}/event-experiences-management.json`
      ),

      import(
        `../messages/${locale}/invitations.json`
      ),

      import(
        `../messages/${locale}/invitation-management.json`
      ),

      import(
        `../messages/${locale}/event-experience-content.json`
      ),

      import(
        `../messages/${locale}/event-experience-templates.json`
      ),
    ]);

  return {
    Common:
      common.default,

    Footer:
      footer.default,

    Auth:
      auth.default,

    Navigation:
      navigation.default,

    Dashboard:
      dashboard.default,

    Events:
      events.default,

    Guests:
      guests.default,

    EventExperiences: {
      ...eventExperiences.default,

      ...eventExperiencesManagement.default
        .EventExperiences,
    },

    Invitations: {
      ...invitations.default,

      ...invitationManagement.default
        .Invitations,
    },

    EventExperienceContent:
      eventExperienceContent.default,

    EventExperienceTemplates:
      eventExperienceTemplates.default
        .EventExperienceTemplates,
  };
}