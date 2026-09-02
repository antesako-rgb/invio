import {
  Eye,
  SquarePen,
} from "lucide-react";

import {
  getLocale,
  getTranslations,
} from "next-intl/server";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  invitationTemplateRegistry,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry";

import InvitationNameEdit
  from "@/features/invitations/components/invitation-management/InvitationManagementHeader/InvitationNameEdit/InvitationNameEdit";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";

import {
  getInvitationPublicPath,
} from "@/features/invitations/utils/getInvitationPublicPath";

import styles
  from "./InvitationManagementHeader.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationManagementHeaderProps {
  invitation:
    Invitation;
}


/* ==========================================================================
   Invitation Management Header
========================================================================== */

export default async function InvitationManagementHeader({
  invitation,
}: InvitationManagementHeaderProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const [
    t,
    locale,
  ] =
    await Promise.all([
      getTranslations(
        "Invitations.management"
      ),
      getLocale(),
    ]);


  /* ==========================================================================
     Template
  ========================================================================== */

  const template =
    invitationTemplateRegistry[
      invitation.template_id
    ];

  const variant =
    template?.variants.find(
      (variant) =>
        variant.id ===
        invitation.variant_id
    );

  const variantLabel =
    variant?.label ??
    invitation.variant_id;

  const templateLabel =
    invitation.template_id;


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    invitation.is_public;


  /* ==========================================================================
     Updated At
  ========================================================================== */

  const updatedAt =
    new Intl.DateTimeFormat(
      locale,
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    ).format(
      new Date(
        invitation.updated_at
      )
    );


  /* ==========================================================================
     Public Path
  ========================================================================== */

  const publicPath =
    getInvitationPublicPath(
      invitation.public_id
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <header
      className={
        styles.root
      }
    >
      <div
        className={
          styles.content
        }
      >
        {/* ==================================================================
            Heading
        ================================================================== */}

        <div
          className={
            styles.heading
          }
        >
          <InvitationNameEdit
            invitationId={
              invitation.id
            }
            name={
              invitation.name
            }
          />

          <span
            className={
              styles.status
            }
            data-published={
              isPublished
                ? "true"
                : "false"
            }
          >
            <span
              className={
                styles.statusDot
              }
              aria-hidden="true"
            />

            {isPublished
              ? t(
                  "status.published"
                )
              : t(
                  "status.draft"
                )}
          </span>
        </div>


        {/* ==================================================================
            Meta
        ================================================================== */}

        <div
          className={
            styles.meta
          }
        >
          <span
            className={
              styles.templateMeta
            }
          >
            {templateLabel}

            <span
              className={
                styles.separator
              }
              aria-hidden="true"
            >
              ·
            </span>

            {variantLabel}
          </span>

          <span
            className={
              styles.separator
            }
            aria-hidden="true"
          >
            ·
          </span>

          <span
            className={
              styles.updated
            }
          >
            {t(
              "updatedAt",
              {
                date:
                  updatedAt,
              }
            )}
          </span>
        </div>
      </div>


      {/* ====================================================================
          Actions
      ==================================================================== */}

      <div
        className={
          styles.actions
        }
      >
        <ButtonLink
          href={
            publicPath
          }
          variant="outline"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Eye
            aria-hidden="true"
          />

          {t(
            "actions.preview"
          )}
        </ButtonLink>

        <ButtonLink
          href={
            `/editor/pozivnice/${invitation.id}/uredi`
          }
        >
          <SquarePen
            aria-hidden="true"
          />

          {t(
            "actions.edit"
          )}
        </ButtonLink>
      </div>
    </header>
  );
}