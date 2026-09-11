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

import EventExperienceStatusAction
  from "@/features/invitations/components/experience-management/EventExperienceStatusCard/EventExperienceStatusAction";

import EventExperienceStatusCardMobileToggle
  from "@/features/invitations/components/experience-management/EventExperienceStatusCard/EventExperienceStatusCardMobileToggle";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import styles
  from "./EventExperienceStatusCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceStatusCardProps {
  experience:
    EventExperience;
}


/* ==========================================================================
   Event Experience Status Card
========================================================================== */

export default async function EventExperienceStatusCard({
  experience,
}: EventExperienceStatusCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "EventExperiences.management.statusCard"
    );


  /* ==========================================================================
     Experience
  ========================================================================== */

  const experienceType =
    experience.type;


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
            `title.${experienceType}`
          )}
        </CardTitle>

        <CardDescription>
          {t(
            `description.${experienceType}`
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
                  `published.title.${experienceType}`
                )
              : t(
                  `draft.title.${experienceType}`
                )}
          </strong>

          <span>
            {isPublished
              ? t(
                  `published.description.${experienceType}`
                )
              : t(
                  `draft.description.${experienceType}`
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
        <EventExperienceStatusAction
          experienceId={
            experience.id
          }
          isPublished={
            isPublished
          }
          experienceType={
            experienceType
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
      <EventExperienceStatusCardMobileToggle
        title={
          t(
            `title.${experienceType}`
          )
        }
        status={
          isPublished
            ? t(
                `published.title.${experienceType}`
              )
            : t(
                `draft.title.${experienceType}`
              )
        }
        isPublished={
          isPublished
        }
      >
        {content}
      </EventExperienceStatusCardMobileToggle>
    </Card>
  );
}