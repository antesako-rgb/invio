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

import EventInvitationsList
  from "@/features/invitations/components/event-invitations/EventInvitationsList/EventInvitationsList";

import {
  getEventInvitations,
} from "@/features/invitations/repositories/invitation/getEventInvitations";


/* ==========================================================================
   Types
========================================================================== */

interface EventInvitationsPageProps {
  eventId:
    string;
}


/* ==========================================================================
   Event Invitations Page
========================================================================== */

export default async function EventInvitationsPage({
  eventId,
}: EventInvitationsPageProps) {
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

  const invitations =
    await getEventInvitations(
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

      {invitations.length === 0
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
          <EventInvitationsList
            invitations={
              invitations
            }
          />
        )}
    </Page>
  );
}