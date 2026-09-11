import InvitationEventInfo
  from "@/features/invitations/cards/components/EventExperienceInfo/EventExperienceInfo";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  EventExperienceTemplateProps,
} from "@/features/invitations/types/eventExperienceTemplate.types";

import {
  floraCardAssets,
} from "./FloraCardAssets";

import "./FloraCard.css";
import "./styles/floraTokens.css";
import "./styles/floraVariants.css";

/* ==========================================================================
   Flora Card
========================================================================== */

export default function FloraCard({
  data,
  mode,
  editor,
}: EventExperienceTemplateProps) {
  const {
    title,
    subtitle,
  } =
    data.content.hero;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <article
      className="flora-card"
      data-invitation-card="flora"
    >
      {/* ====================================================================
          Background
      ==================================================================== */}

      <div
        className="flora-card__background"
        aria-hidden="true"
      />


      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="flora-card__frame"
        src={
          floraCardAssets.frame
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="flora-card__content"
      >
        {/* ==================================================================
            Hero
        ================================================================== */}

        <div
          className="flora-card__hero"
        >
          {/* ================================================================
              Eyebrow
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
              className="flora-card__eyebrow"
            >
              {subtitle}
            </EditableText>
          )}


          {/* ================================================================
              Title
          ================================================================ */}

          {title && (
            <h1
              className="flora-card__title"
            >
              <EditableText
                element="hero.title"
                mode={
                  mode
                }
                editor={
                  editor
                }
              className="flora-card__title-text"
              >
                {title}
              </EditableText>
            </h1>
          )}
        </div>


        {/* ==================================================================
            Event Info
        ================================================================== */}

        <InvitationEventInfo
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
      </div>
    </article>
  );
}