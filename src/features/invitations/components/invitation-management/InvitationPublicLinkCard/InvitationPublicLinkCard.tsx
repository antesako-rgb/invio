import {
  ExternalLink,
  Link2,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import InvitationPublicLinkCardMobileToggle
  from "@/features/invitations/components/invitation-management/InvitationPublicLinkCard/InvitationPublicLinkCardMobileToggle";

import InvitationPublicLinkCopy
  from "@/features/invitations/components/invitation-management/InvitationPublicLinkCopy/InvitationPublicLinkCopy";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";

import styles
  from "./InvitationPublicLinkCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationPublicLinkCardProps {
  invitation:
    Invitation;
}


/* ==========================================================================
   Invitation Public Link Card
========================================================================== */

export default async function InvitationPublicLinkCard({
  invitation,
}: InvitationPublicLinkCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "Invitations.management.publicLinkCard"
    );


  /* ==========================================================================
     Data
  ========================================================================== */

  const isPublished =
    invitation.is_public;

  const publicPath =
    `/pozivnice/${invitation.public_id}`;


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
          Link
      ================================================================== */}

      <div
        className={
          styles.linkBox
        }
        data-active={
          isPublished
            ? "true"
            : "false"
        }
      >
        <Link2
          aria-hidden="true"
        />

        <div
          className={
            styles.linkContent
          }
        >
          <strong>
            {isPublished
              ? t(
                  "active.title"
                )
              : t(
                  "inactive.title"
                )}
          </strong>

          <span
            className={
              styles.publicLink
            }
          >
            {publicPath}
          </span>

          <span
            className={
              styles.linkDescription
            }
          >
            {isPublished
              ? t(
                  "active.description"
                )
              : t(
                  "inactive.description"
                )}
          </span>
        </div>
      </div>


      {/* ==================================================================
          Actions
      ================================================================== */}

      <div
        className={
          styles.actions
        }
      >
        <InvitationPublicLinkCopy
          publicPath={
            publicPath
          }
          disabled={
            !isPublished
          }
        />

        <ButtonLink
          href={
            publicPath
          }
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          aria-disabled={
            !isPublished
          }
          tabIndex={
            isPublished
              ? undefined
              : -1
          }
          className={
            !isPublished
              ? styles.disabledAction
              : undefined
          }
        >
          <ExternalLink
            aria-hidden="true"
          />

          {t(
            "actions.open"
          )}
        </ButtonLink>
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
      <InvitationPublicLinkCardMobileToggle
        title={
          t(
            "title"
          )
        }
        status={
          isPublished
            ? t(
                "active.title"
              )
            : t(
                "inactive.title"
              )
        }
        isActive={
          isPublished
        }
      >
        {content}
      </InvitationPublicLinkCardMobileToggle>
    </Card>
  );
}