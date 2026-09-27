import {
  UsersRound,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  Card,
} from "@/components/ui/card";

import {
  getReceivedCollaborationInvites,
} from "@/features/event-collaboration/repositories/getReceivedCollaborationInvites";

import styles from "./DashboardInvites.module.css";


/* ==========================================================================
   Dashboard Invites
========================================================================== */

export default async function DashboardInvites() {
  const [
    invites,
    t,
  ] =
    await Promise.all([
      getReceivedCollaborationInvites(),

      getTranslations(
        "Dashboard.overview.invites"
      ),
    ]);

  return invites.map(
    (invite) => (
      <Card
        key={
          invite.id
        }
        className={
          styles.card
        }
      >
        <UsersRound
          className={
            styles.icon
          }
          aria-hidden="true"
        />

        <div
          className={
            styles.content
          }
        >
          <h2>
            {t(
              "title"
            )}
          </h2>

          {invite.events?.name && (
            <p
              className={
                styles.name
              }
            >
              {invite.events.name}
            </p>
          )}

          <p>
            {t(
              "description"
            )}
          </p>
        </div>

        <ButtonLink
          size="lg"
          variant="outline"
          href="/dashboard/poziv"
        >
          {t(
            "open"
          )}
        </ButtonLink>
      </Card>
    )
  );
}