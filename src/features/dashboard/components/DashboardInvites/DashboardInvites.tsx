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
  CollaborationProfileMissingError,
} from "@/features/project-collaboration/repositories/getReceivedCollaborationInvites";

import styles from "./DashboardInvites.module.css";


/* ==========================================================================
   Dashboard Invites
========================================================================== */

export default async function DashboardInvites() {
  const t = await getTranslations("Dashboard.overview.invites");
  let invites;
  try {
    invites = await getReceivedCollaborationInvites();
  } catch (error) {
    if (!(error instanceof CollaborationProfileMissingError)) throw error;
    return <Card className={styles.card}>
      <UsersRound className={styles.icon} aria-hidden="true" />
      <div className={styles.content} role="status">
        <h2>{t("title")}</h2>
        <p>{t("profileMissing")}</p>
      </div>
    </Card>;
  }

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

          {invite.project_name && (
            <p
              className={
                styles.name
              }
            >
              {invite.project_name}
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
          href={{ pathname: "/dashboard/poziv", query: { invite: invite.id } }}
        >
          {t(
            "open"
          )}
        </ButtonLink>
      </Card>
    )
  );
}
