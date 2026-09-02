import {
  CircleCheck,
  CircleDashed,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import InvitationStatusAction
  from "@/features/invitations/components/invitation-management/InvitationStatusCard/InvitationStatusAction";

import InvitationStatusCardMobileToggle
  from "@/features/invitations/components/invitation-management/InvitationStatusCard/InvitationStatusCardMobileToggle";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";

import styles
  from "./InvitationStatusCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationStatusCardProps {
  invitation:
    Invitation;
}


/* ==========================================================================
   Invitation Status Card
========================================================================== */

export default async function InvitationStatusCard({
  invitation,
}: InvitationStatusCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "Invitations.management.statusCard"
    );


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    invitation.is_public;


  /* ==========================================================================
     Content
  ========================================================================== */

  const content = (
    <CardContent
      className={
        styles.content
      }
    >
      {/* ==================================================================
          Header
      ================================================================== */}

      <div
        className={
          styles.header
        }
      >
        <CardTitle>
          {t(
            "title"
          )}
        </CardTitle>

        <CardDescription>
          {t(
            "description"
          )}
        </CardDescription>
      </div>


      {/* ==================================================================
          Status
      ================================================================== */}

      <div
        className={
          styles.status
        }
        data-published={
          isPublished
            ? "true"
            : "false"
        }
      >
        {isPublished
          ? (
            <CircleCheck
              aria-hidden="true"
            />
          )
          : (
            <CircleDashed
              aria-hidden="true"
            />
          )}

        <div
          className={
            styles.statusContent
          }
        >
          <strong>
            {isPublished
              ? t(
                  "published.title"
                )
              : t(
                  "draft.title"
                )}
          </strong>

          <span>
            {isPublished
              ? t(
                  "published.description"
                )
              : t(
                  "draft.description"
                )}
          </span>
        </div>
      </div>


      {/* ==================================================================
          Action
      ================================================================== */}

      <div
        className={
          styles.actions
        }
      >
        <InvitationStatusAction
          invitationId={
            invitation.id
          }
          isPublished={
            isPublished
          }
        />
      </div>
    </CardContent>
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Card
      className={
        styles.card
      }
      radius="xl"
      shadow="xs"
    >
      <InvitationStatusCardMobileToggle
        title={
          t(
            "title"
          )
        }
        status={
          isPublished
            ? t(
                "published.title"
              )
            : t(
                "draft.title"
              )
        }
        isPublished={
          isPublished
        }
      >
        {content}
      </InvitationStatusCardMobileToggle>
    </Card>
  );
}