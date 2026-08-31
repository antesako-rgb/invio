import InvitationEventInfo
  from "@/features/invitations/cards/components/InvitationEventInfo/InvitationEventInfo";

import InvitationImageFrame
  from "@/features/invitations/cards/components/InvitationImageFrame/InvitationImageFrame";

import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  InvitationTemplateProps,
} from "@/features/invitations/types/invitationTemplate.types";

import {
  portraitCardAssets,
} from "./PortraitCardAssets";

import "./PortraitCard.css";
import "./styles/portraitTokens.css";
import "./styles/portraitVariants.css";
/* ==========================================================================
   Portrait Card
========================================================================== */

export default function PortraitCard({
  data,
  mode,
  editor,
}: InvitationTemplateProps) {
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
      className="portrait-card"
      data-invitation-card="portrait"
    >
      {/* ====================================================================
          Background
      ==================================================================== */}

      <div
        className="portrait-card__background"
        aria-hidden="true"
      />


      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="portrait-card__frame"
        src={
          portraitCardAssets.frame
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="portrait-card__content"
      >
        {/* ==================================================================
            Hero
        ================================================================== */}

        <div
          className="portrait-card__hero"
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
              className="portrait-card__eyebrow"
            >
              {subtitle}
            </EditableText>
          )}


          {/* ================================================================
              Title
          ================================================================ */}

            {title && (
            <h1
              className="portrait-card__title"
            >
              <EditableText
                element="hero.title"
                mode={
                  mode
                }
                editor={
                  editor
                }
                className="portrait-card__title-text"
              >
                {title}
              </EditableText>
            </h1>
          )}
        </div>


        {/* ==================================================================
            Photo
        ================================================================== */}

        <InvitationImageFrame
          element="media.image_url"
          value={
            data.content.media.image_url
          }
          mode={
            mode
          }
          editor={
            editor
          }
          mask={
            portraitCardAssets.mask
          }
          frame={
            portraitCardAssets.maskFrame
          }
          className="portrait-card__photo"
        >
          <div
            className="portrait-card__photo-placeholder"
          />
        </InvitationImageFrame>


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