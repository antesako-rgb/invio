import {
  Mail,
  Plus,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import Page
  from "@/components/layout/PageContainer/Page";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import PageHeader
  from "@/components/ui/page-header/PageHeader";

import EventExperiencesList
  from "@/features/invitations/components/event-experiences/EventExperiencesList/EventExperiencesList";

import {
  getEventExperiences,
} from "@/features/invitations/repositories/experience/getEventExperiences";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperiencesPageProps {
  eventId:
    string;
}


/* ==========================================================================
   Event Experiences Page
========================================================================== */

export default async function EventExperiencesPage({
  eventId,
}: EventExperiencesPageProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "Invitations.page"
    );


  /* ==========================================================================
     Data
  ========================================================================== */

  const experiences =
    await getEventExperiences(
      eventId
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Page>
      <PageHeader
        title={
          t(
            "title"
          )
        }
        description={
          t(
            "description"
          )
        }
        actions={
          <ButtonLink
            href={
              `/dashboard/dogadaji/${eventId}/pozivnice/nova`
            }
          >
            <Plus
              aria-hidden="true"
            />

            {t(
              "actions.create"
            )}
          </ButtonLink>
        }
      />

      {experiences.length === 0
        ? (
          <EmptyState
            variant="card"
            icon={
              Mail
            }
            title={
              t(
                "empty.title"
              )
            }
            description={
              t(
                "empty.description"
              )
            }
            action={
              <ButtonLink
                href={
                  `/dashboard/dogadaji/${eventId}/pozivnice/nova`
                }
              >
                <Plus
                  aria-hidden="true"
                />

                {t(
                  "empty.action"
                )}
              </ButtonLink>
            }
          />
        )
        : (
          <EventExperiencesList
            experiences={
              experiences
            }
          />
        )}
    </Page>
  );
}