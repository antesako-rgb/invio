import {
  CalendarHeart,
  Plus,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import Container
  from "@/components/layout/Container/Container";

import Page
  from "@/components/layout/PageContainer/Page";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import DashboardWelcome
  from "@/features/dashboard/components/DashboardWelcome/DashboardWelcome";

import DashboardEvents
  from "@/features/dashboard/components/DashboardEvents/DashboardEvents";

import DashboardBusinessCta
  from "@/features/dashboard/components/DashboardBusinessCta/DashboardBusinessCta";

import DashboardExplore
  from "@/features/dashboard/components/DashboardExplore/DashboardExplore";

import DashboardBrandMessage
  from "@/features/dashboard/components/DashboardBrandMessage/DashboardBrandMessage";

import {
  getEvents,
} from "@/features/events/repositories/getEvents";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardOverviewPageProps {
  firstName?:
    string | null;
}


/* ==========================================================================
   Dashboard Overview Page
========================================================================== */

export default async function DashboardOverviewPage({
  firstName,
}: DashboardOverviewPageProps) {
  const t =
    await getTranslations(
      "Dashboard.overview"
    );


  /* ==========================================================================
     Events
  ========================================================================== */

  const events =
    await getEvents();

  const hasEvents =
    events.length > 0;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <DashboardWelcome
          firstName={
            firstName
          }
        />

        {hasEvents ? (
          <DashboardEvents
            events={
              events
            }
          />
        ) : (
          <EmptyState
            variant="card"
            icon={
              CalendarHeart
            }
            title={
              t(
                "emptyEvent.title"
              )
            }
            description={
              t(
                "emptyEvent.description"
              )
            }
            action={
              <ButtonLink
                href="/dashboard/dogadaji/novi"
              >
                <Plus
                  aria-hidden="true"
                />

                {t(
                  "emptyEvent.action"
                )}
              </ButtonLink>
            }
          />
        )}

        <DashboardBusinessCta />

        <DashboardExplore />

        <DashboardBrandMessage />
      </Page>
    </Container>
  );
}