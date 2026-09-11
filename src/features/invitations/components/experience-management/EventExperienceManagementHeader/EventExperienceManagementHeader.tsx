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
  getEventExperienceTemplateConfig,
  getEventExperienceVariantConfig,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import EventExperienceNameEdit
  from "@/features/invitations/components/experience-management/EventExperienceManagementHeader/EventExperienceNameEdit/EventExperienceNameEdit";

import {
  eventExperienceVariants,
} from "@/features/invitations/config/eventExperienceVariants";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import {
  getEventExperiencePublicPath,
} from "@/features/invitations/utils/getEventExperiencePublicPath";

import styles
  from "./EventExperienceManagementHeader.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceManagementHeaderProps {
  experience:
    EventExperience;
}


/* ==========================================================================
   Event Experience Management Header
========================================================================== */

export default async function EventExperienceManagementHeader({
  experience,
}: EventExperienceManagementHeaderProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const [
    t,
    locale,
  ] =
    await Promise.all([
      getTranslations(
        "EventExperiences.management"
      ),
      getLocale(),
    ]);


  /* ==========================================================================
     Template
  ========================================================================== */

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

  const variantLabel =
    variant
      ? eventExperienceVariants[
          variant.id
        ]?.label ??
        variant.id
      : experience.variant_id;

  const templateLabel =
    experience.template_id;


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    experience.is_public;


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
        experience.updated_at
      )
    );


  /* ==========================================================================
     Public Path
  ========================================================================== */

  const publicPath =
    getEventExperiencePublicPath(
      experience.public_id
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
          <EventExperienceNameEdit
            experienceId={
              experience.id
            }
            name={
              experience.name
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
        {isPublished && (
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
              "actions.view"
            )}
          </ButtonLink>
        )}

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
      </div>
    </header>
  );
}