import Image
  from "next/image";

import {
  CalendarDays,
  Settings,
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
  Card,
  CardContent,
  CardFooter,
  CardMedia,
  CardTitle,
} from "@/components/ui/card";

import {
  invitationTemplateRegistry,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";

import styles
  from "./EventInvitationCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventInvitationCardProps {
  invitation:
    Invitation;
}


/* ==========================================================================
   Event Invitation Card
========================================================================== */

export default async function EventInvitationCard({
  invitation,
}: EventInvitationCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const [
    t,
    locale,
  ] =
    await Promise.all([
      getTranslations(
        "Invitations.page"
      ),
      getLocale(),
    ]);


  /* ==========================================================================
     Data
  ========================================================================== */

  const isPublished =
    invitation.is_public;

  const statusLabel =
    isPublished
      ? t(
          "status.published"
        )
      : t(
          "status.draft"
        );

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

const previewUrl =
  variant?.previewUrl ??
  template?.preview.cardUrl;

const variantLabel =
  variant?.label ??
  invitation.variant_id;

  const publishedDate =
    invitation.published_at
      ? new Intl.DateTimeFormat(
          locale,
          {
            day:
              "2-digit",

            month:
              "2-digit",

            year:
              "numeric",
          }
        ).format(
          new Date(
            invitation.published_at
          )
        )
      : null;


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
      {/* ====================================================================
          Preview
      ==================================================================== */}

      <CardMedia
        className={
          styles.media
        }
      >
        <div
          className={
            styles.preview
          }
        >
          {previewUrl && (
            <Image
              src={
                previewUrl
              }
              alt=""
              fill
              sizes="180px"
              className={
                styles.previewImage
              }
            />
          )}
        </div>
      </CardMedia>


      {/* ====================================================================
          Content
      ==================================================================== */}

      <CardContent
        className={
          styles.content
        }
        spacing="md"
      >
        <div
          className={
            styles.heading
          }
        >
          <div
            className={
              styles.titleGroup
            }
          >
            <CardTitle>
              {invitation.name}
            </CardTitle>

            <span
              className={
                styles.variant
              }
            >
              {variantLabel}
            </span>
          </div>

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

            {statusLabel}
          </span>
        </div>

        <div
          className={
            styles.meta
          }
        >
          <CalendarDays
            aria-hidden="true"
          />

          <span>
            {isPublished &&
            publishedDate
              ? t(
                  "publishedAt",
                  {
                    date:
                      publishedDate,
                  }
                )
              : t(
                  "notPublished"
                )}
          </span>
        </div>
      </CardContent>


      {/* ====================================================================
          Actions
      ==================================================================== */}

      <CardFooter
        className={
          styles.footer
        }
        separator
      >
        <ButtonLink
          href={
            `/dashboard/pozivnice/${invitation.id}`
          }
          variant="outline"
        >
          <Settings
            aria-hidden="true"
          />

          {t(
            "actions.manage"
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
      </CardFooter>
    </Card>
  );
}