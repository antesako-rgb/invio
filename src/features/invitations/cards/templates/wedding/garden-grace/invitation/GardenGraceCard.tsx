import EventExperienceCountdown
  from "@/features/invitations/cards/components/EventExperienceCountdown/EventExperienceCountdown";

import EventExperienceDescription
  from "@/features/invitations/cards/components/EventExperienceDescription/EventExperienceDescription";

import EventExperienceSchedule
  from "@/features/invitations/cards/components/EventExperienceSchedule/EventExperienceSchedule";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  EventExperienceTemplateProps,
} from "@/features/invitations/types/eventExperienceTemplate.types";

import {
  gardenGraceCardAssets,
} from "./GardenGraceCardAssets";

import "./GardenGraceCard.css";
import "../styles/gardenGraceTokens.css";
import "../styles/gardenGraceVariants.css";

/* ==========================================================================
   Garden Grace Card
========================================================================== */

export default function GardenGraceCard({
  data,
  mode,
  editor,
}: EventExperienceTemplateProps) {
  const {
    primary_name,
    secondary_name,
    subtitle,
  } =
    data.content.hero;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <article
      className="garden-grace-card"
    >

      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="garden-grace-card__frame"
        src={
          gardenGraceCardAssets.frame
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="garden-grace-card__content"
      >
        {/* ==================================================================
            Hero
        ================================================================== */}

        <div
          className="garden-grace-card__hero"
        >
          {/* ================================================================
              Subtitle
          ================================================================ */}

          {subtitle && (
            <EditableText
              element="hero.subtitle"
              mode={
                mode
              }
              editor={
                editor
              }
              className="garden-grace-card__subtitle"
            >
              {subtitle}
            </EditableText>
          )}


          {/* ================================================================
              Names
          ================================================================ */}

          {(primary_name || secondary_name) && (
            <h1
              className="garden-grace-card__names"
            >
              {primary_name && (
                <EditableText
                  element="hero.primary_name"
                  mode={
                    mode
                  }
                  editor={
                    editor
                  }
                  className="garden-grace-card__name"
                >
                  {primary_name}
                </EditableText>
              )}

              {primary_name && secondary_name && (
                <span
                  className="garden-grace-card__name-separator"
                  aria-hidden="true"
                >
                  &
                </span>
              )}

              {secondary_name && (
                <EditableText
                  element="hero.secondary_name"
                  mode={
                    mode
                  }
                  editor={
                    editor
                  }
                  className="garden-grace-card__name"
                >
                  {secondary_name}
                </EditableText>
              )}
            </h1>
          )}
        </div>


        {/* ==================================================================
            Event Schedule
        ================================================================== */}

        <EventExperienceSchedule
          display={
            data.display
          }
          mode={
            mode
          }
          editor={
            editor
          }
        />


        {/* ==================================================================
            Countdown
        ================================================================== */}

        <EventExperienceCountdown
          date={
            data.content.date.start_date
          }
          timezone={
            data.eventTimezone
          }
        />


        {/* ==================================================================
            Description
        ================================================================== */}

        <EventExperienceDescription
          value={
            data.content.description
          }
          mode={
            mode
          }
          editor={
            editor
          }
        />
      </div>
    </article>
  );
}