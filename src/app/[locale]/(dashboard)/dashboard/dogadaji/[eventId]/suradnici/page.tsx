import {
  notFound,
} from "next/navigation";

import {
  getNow,
  getTranslations,
} from "next-intl/server";

import Page
  from "@/components/layout/PageContainer/Page";

import Container
  from "@/components/layout/Container/Container";

import BackLink
  from "@/components/ui/back-link/BackLink";

import PageHeader
  from "@/components/ui/page-header/PageHeader";

import {
  Card,
  CardTitle,
} from "@/components/ui/card";

import {
  Badge,
} from "@/components/ui/badge/badge";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  getEvent,
} from "@/features/events/repositories/getEvent";

import {
  getEventCollaborators,
} from "@/features/event-collaboration/repositories/getEventCollaborators";

import {
  getEventCollaborationInvites,
} from "@/features/event-collaboration/repositories/getEventCollaborationInvites";

import CollaborationLinkForm
  from "@/features/event-collaboration/components/CollaborationLinkForm";

import styles
  from "@/features/event-collaboration/components/Collaboration.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface CollaboratorsPageProps {
  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Collaborators Page
========================================================================== */

export default async function CollaboratorsPage({
  params,
}: CollaboratorsPageProps) {
  const {
    eventId,
  } =
    await params;

  const event =
    await getEvent(
      eventId
    );

  if (!event) {
    notFound();
  }


  /* ==========================================================================
     Current User
  ========================================================================== */

  const supabase =
    await createServerClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  const isOwner =
    user?.id ===
    event.owner_id;


  /* ==========================================================================
     Data
  ========================================================================== */

  const [
    members,
    invites,
    t,
  ] =
    await Promise.all([
      getEventCollaborators(
        eventId
      ),

      isOwner
        ? getEventCollaborationInvites(
            eventId
          )
        : Promise.resolve([]),

      getTranslations(
        "Events.collaboration"
      ),
    ]);

  const now =
    await getNow();

  const pending =
    invites.filter(
      (invite) =>
        invite.status ===
          "pending" &&
        new Date(
          invite.expires_at
        ).getTime() >
          now.getTime()
    );

  const navigation =
    await getTranslations(
      "Events.edit"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <BackLink
          href={`/dashboard/dogadaji/${eventId}`}
          label={
            navigation(
              "backToEvent"
            )
          }
        />

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
        />

        {isOwner ? (
          <Card
            className={
              styles.card
            }
          >
            <CardTitle>
              {t(
                "invite"
              )}
            </CardTitle>

            <CollaborationLinkForm
              eventId={
                eventId
              }
            />
          </Card>
        ) : (
          <p
            className={
              styles.description
            }
          >
            {t(
              "ownerOnly"
            )}
          </p>
        )}

        <Card
          className={
            styles.card
          }
        >
          <CardTitle>
            {t(
              "members"
            )}
          </CardTitle>

          {members.length ? (
            <ul
              className={
                styles.list
              }
            >
              {members.map(
                (member) => (
                  <li
                    key={
                      member.profile_id
                    }
                    className={
                      styles.row
                    }
                  >
                    <span>
                      {
                        [
                          member.first_name,
                          member.last_name,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " "
                          ) ||
                        member.email
                      }
                    </span>

                    <Badge
                      variant="success"
                    >
                      {t(
                        "member"
                      )}
                    </Badge>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p
              className={
                styles.description
              }
            >
              {t(
                "empty"
              )}
            </p>
          )}
        </Card>

        {pending.length > 0 && (
          <Card
            className={
              styles.card
            }
          >
            <CardTitle>
              {t(
                "pendingTitle"
              )}
            </CardTitle>

            <ul
              className={
                styles.list
              }
            >
              {pending.map(
                (invite) => (
                  <li
                    key={
                      invite.id
                    }
                    className={
                      styles.row
                    }
                  >
                    <span>
                      {
                        invite.email
                      }
                    </span>

                    <Badge
                      variant="warning"
                    >
                      {t(
                        "pending"
                      )}
                    </Badge>
                  </li>
                )
              )}
            </ul>
          </Card>
        )}
      </Page>
    </Container>
  );
}