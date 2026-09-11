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
  getEventExperienceTemplateConfig,
  getEventExperienceVariantConfig,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import {
  eventExperienceVariants,
} from "@/features/invitations/config/eventExperienceVariants";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import styles
  from "./EventExperienceCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceCardProps {
  experience:
    EventExperience;
}


/* ==========================================================================
   Event Experience Card
========================================================================== */

export default async function EventExperienceCard({
  experience,
}: EventExperienceCardProps) {
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
    experience.is_public;

  const statusLabel =
    isPublished
      ? t(
          "status.published"
        )
      : t(
          "status.draft"
        );

  const template =
    getEventExperienceTemplateConfig(
      experience.type,
      experience.template_id
    );

  const variant =
    getEventExperienceVariantConfig(
      experience.type,
      experience.template_id,
      experience.variant_id
    );

  const previewUrl =
    variant?.previewUrl ??
    template?.preview.cardUrl;

  const variantLabel =
    variant
      ? eventExperienceVariants[
          variant.id
        ].label
      : experience.variant_id;

  const publishedDate =
    experience.published_at
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
            experience.published_at
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
        {previewUrl && (
          <div
            className={
              styles.preview
            }
          >
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
          </div>
        )}
      </CardMedia>


      {/* ====================================================================
          Content
      ==================================================================== */}

      <CardContent
        className={
          styles.content
        }
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
              {experience.name}
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
            `/dashboard/pozivnice/${experience.id}`
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
            `/editor/pozivnice/${experience.id}/uredi`
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