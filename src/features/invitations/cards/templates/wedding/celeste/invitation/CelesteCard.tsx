import EventExperienceCountdown
  from "@/features/invitations/cards/components/EventExperienceCountdown/EventExperienceCountdown";

import InvitationDescription
  from "@/features/invitations/cards/components/EventExperienceDescription/EventExperienceDescription";

import InvitationEventDetails
  from "@/features/invitations/cards/components/EventExperienceDetails/EventExperienceDetails";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  EventExperienceTemplateProps,
} from "@/features/invitations/types/eventExperienceTemplate.types";
import {
  celesteCardAssets,
} from "./CelesteCardAssets";

import "./CelesteCard.css";
import "./styles/celesteTokens.css";
import "./styles/celesteVariants.css";


/* ==========================================================================
   Celeste Card
========================================================================== */

export default function CelesteCard({
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
      className="celeste-card"
      data-invitation-card="celeste"
    >
      {/* ====================================================================
          Background
      ==================================================================== */}

      <div
        className="celeste-card__background"
        aria-hidden="true"
      />


      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="celeste-card__frame"
        src={
          celesteCardAssets.frame
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="celeste-card__content"
      >
        {/* ==================================================================
            Hero
        ================================================================== */}

        <div
          className="celeste-card__hero"
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
              className="celeste-card__subtitle"
            >
              {subtitle}
            </EditableText>
          )}


          {/* ================================================================
              Names
          ================================================================ */}

          {(primary_name || secondary_name) && (
            <h1
              className="celeste-card__names"
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
                  className="celeste-card__name"
                >
                  {primary_name}
                </EditableText>
              )}

              {primary_name && secondary_name && (
                <span
                  className="celeste-card__name-separator"
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
                  className="celeste-card__name"
                >
                  {secondary_name}
                </EditableText>
              )}
            </h1>
          )}
        </div>


        {/* ==================================================================
            Event Details
        ================================================================== */}

        <InvitationEventDetails
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

        <InvitationDescription
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