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

import EventExperiencePublicLinkCardMobileToggle
  from "@/features/invitations/components/experience-management/EventExperiencePublicLinkCard/EventExperiencePublicLinkCardMobileToggle";

import EventExperiencePublicLinkCopy
  from "@/features/invitations/components/experience-management/EventExperiencePublicLinkCard/EventExperiencePublicLinkCopy/EventExperiencePublicLinkCopy";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import {
  getEventExperiencePublicPath,
} from "@/features/invitations/utils/getEventExperiencePublicPath";

import styles
  from "./EventExperiencePublicLinkCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperiencePublicLinkCardProps {
  experience:
    EventExperience;
}


/* ==========================================================================
   Event Experience Public Link Card
========================================================================== */

export default async function EventExperiencePublicLinkCard({
  experience,
}: EventExperiencePublicLinkCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "EventExperiences.management.publicLinkCard"
    );


  /* ==========================================================================
     Experience
  ========================================================================== */

  const experienceType =
    experience.type;


  /* ==========================================================================
     Public Path
  ========================================================================== */

  const publicPath =
    getEventExperiencePublicPath(
      experience.public_id
    );


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    experience.is_public;


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
            `description.${experienceType}`
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
                  `active.description.${experienceType}`
                )
              : t(
                  `inactive.description.${experienceType}`
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
        <EventExperiencePublicLinkCopy
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
            `actions.open.${experienceType}`
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
      <EventExperiencePublicLinkCardMobileToggle
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
      </EventExperiencePublicLinkCardMobileToggle>
    </Card>
  );
}