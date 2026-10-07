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
  getProject,
} from "@/features/projects/repositories/getProject";

import {
  getProjectCollaborators,
} from "@/features/project-collaboration/repositories/getProjectCollaborators";

import {
  getProjectCollaborationInvites,
} from "@/features/project-collaboration/repositories/getProjectCollaborationInvites";

import CollaborationLinkForm
  from "@/features/project-collaboration/components/CollaborationLinkForm";

import CollaborationMemberActions from "@/features/project-collaboration/components/CollaborationMemberActions";
import PendingCollaborationInvites from "@/features/project-collaboration/components/PendingCollaborationInvites";

import styles
  from "@/features/project-collaboration/components/Collaboration.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface CollaboratorsPageProps {
  params:
    Promise<{
      projectId:
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
    projectId,
  } =
    await params;

  const project =
    await getProject(
      projectId
    );

  if (!project) {
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
    project.owner_id;


  /* ==========================================================================
     Data
  ========================================================================== */

  const [
    members,
    invites,
    t,
  ] =
    await Promise.all([
      getProjectCollaborators(
        projectId
      ),

      isOwner
        ? getProjectCollaborationInvites(
            projectId
          )
        : Promise.resolve([]),

      getTranslations(
        "Projects.collaboration"
      ),
    ]);

  const now =
    await getNow();

  const pending =
    invites.filter(
      (invite) =>
        invite.status === "pending"
    );

  const navigation =
    await getTranslations(
      "Projects"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <BackLink
          href={`/dashboard/projects/${projectId}`}
          label={
            navigation(
              "back"
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
              projectId={
                projectId
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

                    <div className={styles.rowActions}>
                    <Badge
                      variant="success"
                    >
                      {t(
                        "member"
                      )}
                    </Badge>
                    {isOwner && member.profile_id !== project.owner_id && <CollaborationMemberActions
                      kind="member" projectId={projectId} profileId={member.profile_id} email={member.email}
                    />}
                    </div>
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

            <p className={styles.description}>{t("pendingHelp")}</p>
            <PendingCollaborationInvites projectId={projectId} invites={pending} now={now.toISOString()} />
          </Card>
        )}
      </Page>
    </Container>
  );
}
